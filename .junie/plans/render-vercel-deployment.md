---
sessionId: session-260704-212638-lwpm
---

# Requirements

### Overview & Goals

Migrate AirVault Concierge from a local Docker Compose setup (with planned AWS EKS/Terraform infrastructure) to a **simplified, production-ready deployment** on Render (backend + Postgres + Redis) and Vercel (frontend) — targeting launch in under 1 hour.

### Scope

#### In Scope
- Archive AWS infra code (no `infra/` directory currently exists — skip archive step)
- Fix `backend/Dockerfile` to honour Render's dynamic `$PORT` env variable
- Create `render.yaml` (Render Blueprint) defining the web service, managed Postgres, and Redis
- Update `backend/app/config.py` to make Kafka optional (Upstash Kafka or graceful no-op) so the app doesn't crash without a full Kafka cluster
- Create `frontend/.config.js` with `output: 'standalone'` and API rewrites
- Create `frontend/vercel.json` with build settings and env var declarations
- Create root-level `.env.example` documenting all required production variables
- Produce a complete step-by-step deployment guide (DNS, env vars, copy-paste commands)
- Produce a post-deployment verification checklist

#### Out of Scope
- Changing application business logic (auth, claims, rides, pets, GraphQL, WebSocket)
- Replacing Kafka with a different message broker (Kafka dependency is made optional/graceful, not removed)
- Docker Compose local dev setup — left untouched
- CI/CD pipeline setup

### User Stories
- As a developer, I want to deploy the full AirVault backend to Render with one blueprint file so that I don't manually configure each service.
- As a developer, I want to deploy the .js frontend to Vercel with a single `vercel.json` so that build and routing are handled automatically.
- As an operator, I want a checklist of live endpoint tests so that I can confirm the deployment is healthy.

### Functional Requirements
- All existing REST endpoints (`/api/v1/flights`, `/api/v1/claims`, `/api/v1/rides`, `/api/v1/pets`), WebSocket (`/ws`), and GraphQL (`/graphql`) must work after deployment.
- Backend must start successfully even without a Kafka broker (graceful skip of consumer startup).
- Frontend must proxy API calls to the Render backend URL via .js rewrites.
- Custom domains `api.awsaftrading.com` → Render and `app.awsaftrading.com` → Vercel must be documented.


# Technical Design

### Current Implementation

 Component | Current State |
-----------|---------------|
 `backend/Dockerfile` | Uses hardcoded `--port 8000`; Render requires `$PORT` |
 `backend/app/config.py` | `KAFKA_BOOTSTRAP_SERVERS` is a **required** field — app crashes without it |
 `frontend/.config.js` | Empty file — no `output`, no rewrites |
 `frontend/vercel.json` | Does not exist |
 `render.yaml` | Does not exist |
 `.env.example` | Does not exist |
 `infra/` directory | **Does not exist** — no AWS code to archive |

### Key Decisions

1. **Render managed Redis vs Upstash** — Use Render's native Redis instance in `render.yaml` for zero-configuration. Upstash can be substituted by swapping `REDIS_URL`.
2. **Kafka strategy** — Make `KAFKA_BOOTSTRAP_SERVERS` optional in `config.py` (default `None`). Wrap Kafka consumer startup in a try/except so the app boots without Kafka. Upstash Kafka (managed) can be wired in later by setting the env var.
3. **Frontend deployment mode** — Use `output: 'standalone'` in `.config.js` + Vercel's native .js support (no custom server needed).
4. **API proxying** — .js `rewrites` in `.config.js` forward `/api/**` and `/ws/**` to `_PUBLIC_API_URL` so the frontend never has CORS issues in production.

### Proposed Changes

#### `backend/Dockerfile`
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Render sets $PORT; fall back to 8000 for local/Docker Compose
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

#### `backend/app/config.py`
```python
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    KAFKA_BOOTSTRAP_SERVERS: Optional[str] = None   # optional for Render/Upstash
    STRIPE_SECRET_KEY: str
    RAPIDAPI_KEY: str
    JWT_SECRET: str = "change-me-in-production"
    CORS_ORIGINS: list = ["https://app.awsaftrading.com"]
    ALLOWED_HOSTS: list = ["*"]
    KAFKA_DELAY_TOPIC: str = "flight-delays"
    KAFKA_CLAIM_TOPIC: str = "claim-processed"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
```

#### `backend/app/main.py` (lifespan update)
Wrap Kafka consumer registration in `if settings.KAFKA_BOOTSTRAP_SERVERS:` guard.

#### `frontend/.config.js`
```js
/** @type {import('').Config} */
const Config = {
  output: 'standalone',
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${process.env._PUBLIC_API_URL}/api/:path*` },
      { source: '/ws/:path*',  destination: `${process.env._PUBLIC_API_URL}/ws/:path*` },
      { source: '/graphql',    destination: `${process.env._PUBLIC_API_URL}/graphql` },
    ];
  },
};
export default Config;
```

#### `frontend/vercel.json` (new file)
```json
{
  "framework": "js",
  "buildCommand": "npm run build",
  "outputDirectory": ".",
  "env": {
    "_PUBLIC_API_URL": "@_public_api_url"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [{ "key": "X-Frame-Options", "value": "DENY" }]
    }
  ]
}
```

#### `render.yaml` (new file)
```yaml
databases:
  - name: airvault-postgres
    databaseName: airvault
    user: airvault
    plan: free

  - name: airvault-redis
    plan: free
    type: redis

services:
  - type: web
    name: airvault-backend
    env: docker
    dockerfilePath: ./backend/Dockerfile
    plan: starter
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: airvault-postgres
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: airvault-redis
          type: redis
          property: connectionString
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: RAPIDAPI_KEY
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: KAFKA_BOOTSTRAP_SERVERS
        sync: false   # leave blank unless using Upstash Kafka
```

#### `.env.example` (new root-level file)
```
# --- Backend (Render) ---
DATABASE_URL=postgresql+asyncpg://user:pass@host/dbname
REDIS_URL=redis://user:pass@host:6379
KAFKA_BOOTSTRAP_SERVERS=   # optional – Upstash Kafka endpoint
STRIPE_SECRET_KEY=sk_live_...
RAPIDAPI_KEY=...
JWT_SECRET=replace-with-random-64-char-string

# --- Frontend (Vercel) ---
_PUBLIC_API_URL=https://api.awsaftrading.com
```

### Architecture Diagram

```mermaid
graph TD
    Browser["Browser / Mobile"]
    Vercel["Vercel\n(.js frontend)\napp.awsaftrading.com"]
    Render["Render Web Service\n(FastAPI backend)\napi.awsaftrading.com"]
    PG["Render Managed\nPostgres"]
    Redis["Render Managed\nRedis"]
    Kafka["Upstash Kafka\n(optional)"] 
    Stripe["Stripe API"]
    RapidAPI["RapidAPI\n(flight data)"]

    Browser --> Vercel
    Vercel -- "API / WS / GraphQL rewrites" --> Render
    Render --> PG
    Render --> Redis
    Render -.->|optional| Kafka
    Render --> Stripe
    Render --> RapidAPI
```

### File Structure

```
airvault-concierge/
├── render.yaml                  ← NEW
├── .env.example                 ← NEW
├── docker-compose.yml           ← UNCHANGED
├── backend/
│   ├── Dockerfile               ← MODIFIED ($PORT fix)
│   ├── .env                     ← UNCHANGED (local dev)
│   └── app/
│       ├── config.py            ← MODIFIED (Kafka optional, JWT_SECRET)
│       └── main.py              ← MODIFIED (Kafka guard in lifespan)
└── frontend/
    ├── .config.js           ← MODIFIED (standalone + rewrites)
    ├── vercel.json              ← NEW
    └── ...
```


# Deployment Guide

### Prerequisites
- GitHub repository with the codebase pushed
- Render account (render.com)
- Vercel account (vercel.com)
- Domain `awsaftrading.com` DNS management access

---

### Step 1 — Push to GitHub
```bash
cd ~/Desktop/airvault-concierge
git add .
git commit -m "chore: add Render + Vercel deployment config"
git push origin main
```

---

### Step 2 — Deploy Backend on Render

#### Option A — Blueprint (render.yaml)
1. Go to **render.com → New → Blueprint**.
2. Connect your GitHub repo.
3. Render detects `render.yaml` automatically and creates:
   - `airvault-postgres` (managed Postgres)
   - `airvault-redis` (managed Redis)
   - `airvault-backend` (Docker web service)
4. In the **Environment** tab of `airvault-backend`, fill in:
   ```
   STRIPE_SECRET_KEY   = sk_live_...
   RAPIDAPI_KEY        = ...
   ```
5. Click **Apply** — Render builds and deploys the Docker image.
6. Note the auto-assigned URL: `https://airvault-backend.onrender.com`

#### Option B — Manual (if Blueprint isn't available on free tier)
1. **New → PostgreSQL** → name: `airvault-postgres` → copy the *Internal Connection String*.
2. **New → Redis** → name: `airvault-redis` → copy the *Internal Redis URL*.
3. **New → Web Service** → connect repo → Runtime: **Docker** → Dockerfile path: `./backend/Dockerfile`.
4. Set environment variables manually (see `.env.example`).

---

### Step 3 — Deploy Frontend on Vercel
```bash
npm i -g vercel   # if not installed
cd frontend
vercel --prod
```
Or via Vercel dashboard:
1. **New Project → Import Git Repository**.
2. Set **Root Directory**: `frontend`.
3. Add environment variable:
   ```
   _PUBLIC_API_URL = https://api.awsaftrading.com
   ```
4. Click **Deploy**.

---

### Step 4 — Custom DNS

 Record | Type | Value |
--------|------|-------|
 `api.awsaftrading.com` | CNAME | `airvault-backend.onrender.com` |
 `app.awsaftrading.com` | CNAME | `cname.vercel-dns.com` |

Add both custom domains in their respective dashboards (Render → Settings → Custom Domains; Vercel → Project → Domains).

---

### Required Environment Variables (complete list)

 Variable | Where | Description |
----------|-------|-------------|
 `DATABASE_URL` | Render (auto-linked) | `postgresql+asyncpg://...` |
 `REDIS_URL` | Render (auto-linked) | `redis://...` |
 `STRIPE_SECRET_KEY` | Render (manual) | Live or test Stripe key |
 `RAPIDAPI_KEY` | Render (manual) | RapidAPI flight data key |
 `JWT_SECRET` | Render (auto-generated) | 64-char random string |
 `KAFKA_BOOTSTRAP_SERVERS` | Render (optional) | Upstash Kafka URL or leave blank |
 `_PUBLIC_API_URL` | Vercel | `https://api.awsaftrading.com` |

---

### Verification Checklist

```bash
BASE=https://api.awsaftrading.com
FRONT=https://app.awsaftrading.com

# 1. Health check
curl $BASE/health
# Expected: {"status":"ok"}

# 2. OpenAPI docs accessible
curl -o /dev/null -w "%{http_code}" $BASE/docs
# Expected: 200

# 3. GraphQL introspection
curl -X POST $BASE/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{__typename}"}'
# Expected: {"data":{"__typename":"Query"}}

# 4. REST endpoint
curl $BASE/api/v1/flights
# Expected: 200 (list or auth error — not 502)

# 5. Frontend loads
curl -o /dev/null -w "%{http_code}" $FRONT
# Expected: 200

# 6. Frontend proxied API call
curl $FRONT/api/v1/flights
# Expected: same response as direct backend call
```


# Delivery Steps

### ✓ Step 1: Fix backend Dockerfile and make Kafka optional in config
Backend starts cleanly on Render (dynamic $PORT, no Kafka crash).

- Modify `backend/Dockerfile`: change `CMD` from hardcoded `--port 8000` to `sh -c 'uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}'` so Render's injected `$PORT` is respected.
- Modify `backend/app/config.py`: change `KAFKA_BOOTSTRAP_SERVERS` from a required `str` to `Optional[str] = None`; add `JWT_SECRET: str` field; update `CORS_ORIGINS` default to the production domain.
- Modify `backend/app/main.py`: wrap Kafka consumer startup inside `if settings.KAFKA_BOOTSTRAP_SERVERS:` guard in the `lifespan` context manager so the app boots without a Kafka broker.

### ✓ Step 2: Create render.yaml blueprint and root .env.example
A single `render.yaml` at the repo root lets Render provision all services automatically.

- Create `render.yaml` at the repo root defining: a managed Postgres database (`airvault-postgres`), a managed Redis instance (`airvault-redis`), and a Docker web service (`airvault-backend`) with `DATABASE_URL` and `REDIS_URL` auto-linked from the managed services, `JWT_SECRET` auto-generated, and `STRIPE_SECRET_KEY`, `RAPIDAPI_KEY`, `KAFKA_BOOTSTRAP_SERVERS` declared as manual/sync:false placeholders.
- Set `healthCheckPath: /health` on the web service so Render knows when the deployment is healthy.
- Create `.env.example` at the repo root listing every required variable with placeholder values and inline comments, covering both backend (Render) and frontend (Vercel) variables.

### ✓ Step 3: Configure .js frontend for Vercel deployment
Frontend builds as a standalone .js app on Vercel and proxies all backend traffic without CORS issues.

- Rewrite `frontend/.config.js` (currently empty) with `output: 'standalone'` and `async rewrites()` mapping `/api/**`, `/ws/**`, and `/graphql` to `process.env._PUBLIC_API_URL`.
- Create `frontend/vercel.json` declaring `framework: 'js'`, the build command, output directory, `_PUBLIC_API_URL` env var reference, and a security header (`X-Frame-Options: DENY`).

### ✓ Step 4: Write the deployment guide and verification checklist
Operators can deploy end-to-end in under 1 hour using documented, copy-paste steps.

- Add a `DEPLOY.md` at the repo root containing: GitHub push commands, Render Blueprint steps (and manual fallback), Vercel CLI and dashboard steps, DNS record table for `api.awsaftrading.com` → Render and `app.awsaftrading.com` → Vercel, complete environment variable reference table, and a `curl`-based verification checklist covering `/health`, `/docs`, `/graphql`, `/api/v1/flights`, and the Vercel frontend URL.

---

# PayloadCMS + .js Monorepo Migration

Rebuild the Python FastAPI backend as a unified .js + PayloadCMS monorepo.
Architecture: single .js 15 app with PayloadCMS embedded, Postgres (Drizzle), Redis (ioredis), kafkajs for delay events.

### ✓ Step 5: Scaffold PayloadCMS + .js monorepo
Bootstrap the `payload-app/` directory with `create-payload-app`, configure Postgres adapter, and port env vars.

- Run `npx create-payload-app@latest payload-app` with `--template blank --db postgres` flags (non-interactive).
- Wire `DATABASE_URI`, `PAYLOAD_SECRET`, `REDIS_URL`, `KAFKA_BOOTSTRAP_SERVERS`, `STRIPE_SECRET_KEY`, `RAPIDAPI_KEY` env vars in `payload-app/.env.example`.
- Configure `payload.config.ts` with the Postgres adapter and `serverURL`.

### ✓ Step 6: Create PayloadCMS collections for all domain models
Port all six Python SQLAlchemy models to TypeScript PayloadCMS collection configs.

- Create `Users` collection (email, isPremium, createdAt) with PayloadCMS built-in auth enabled.
- Create `Flights` collection (airline, origin, destination, departure, arrival, price).
- Create `Claims` collection (flightId, passengerId, airline, delayMinutes, payoutAmount, status, claimLetter, stripeTransferId).
- Create `Rides` collection (vehicle, totalFee, pickup, dropoff).
- Create `PetChecklists` collection (origin, destination, owner, petName, generatedAt).
- Create `Meals` collection (name, description, available) — used by GraphQL.

### ✓ Step 7: Implement business logic as .js API routes + PayloadCMS hooks
Port all five route groups and services to .js App Router API routes + Payload hooks/endpoints.

- `app/api/v1/flights/search/route.ts` — RapidAPI call + 7% concierge fee, Redis cache.
- `app/api/v1/flights/live/[flightId]/route.ts` — flight status with 30s Redis TTL.
- `app/api/v1/claims/route.ts` (POST) + `app/api/v1/claims/[id]/route.ts` (GET) — Stripe payout logic; Claims collection `afterChange` hook triggers Kafka event.
- `app/api/v1/rides/request/route.ts` — vehicle matching + luggage fee.
- `app/api/v1/pets/checklist/route.ts` — IATA requirements + PDF generation (pdf-lib).
- `app/api/v1/meals/route.ts` (GET) + `app/api/v1/meals/reserve/route.ts` (POST).
- WebSocket via `app/api/ws/flight-track/route.ts` using Node.js `ws` library.
- Kafka consumer (`lib/kafka/consumer.ts`) started as a global singleton that triggers claim processing on `flight-delays` topic.

### ✓ Step 8: Migrate frontend pages into the monorepo and update docker-compose
Move existing .js frontend pages into `payload-app/` and update docker-compose to remove Python backend.

- Copy `frontend/app/` and `frontend/components/` pages into `payload-app/app/` (non-colliding paths).
- Update `payload-app/.config.ts` with `output: 'standalone'` and socket rewrites.
- Replace `backend` service in `docker-compose.yml` with a `payload-app` Node.js service.
- Update `render.yaml` to point `dockerfilePath` to `./payload-app/Dockerfile`.
- Update `.env.example` and `DEPLOY.md` to reflect the new stack.
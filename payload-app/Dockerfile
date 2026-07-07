FROM node:22-alpine AS base

# ── Dependencies (all — including dev, needed for the build) ─────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# ── Builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# Pre-compile src/ (payload config + collections) to plain ESM JS so the
# runner does not need tsx to load .ts files at runtime
RUN node -e " \
  const esbuild = require('./node_modules/esbuild'); \
  esbuild.buildSync({ \
    entryPoints: ['src/payload.config.ts'], \
    bundle: true, \
    packages: 'external', \
    format: 'esm', \
    platform: 'node', \
    loader: { '.ts': 'ts', '.tsx': 'tsx' }, \
    outfile: 'dist/payload.config.mjs', \
  }); \
  console.log('esbuild done'); \
"

# ── Runner ────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV _TELEMETRY_DISABLED=1
# Point Payload at the pre-compiled ESM config (no tsx needed at runtime)
ENV PAYLOAD_CONFIG_PATH=dist/payload.config.mjs
# Suppress Node.js ExperimentalWarning for built-in SQLite (not used, but imported transitively)
ENV NODE_OPTIONS="--no-warnings"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 js

# Copy standalone .js build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=js:nodejs /app/./standalone ./
COPY --from=builder --chown=js:nodejs /app/./static ././static

# Override node_modules with the full set (includes payload CLI + tsx for migrations)
# The standalone build embeds only what .js needs; we need payload's runtime deps too
COPY --from=deps --chown=js:nodejs /app/node_modules ./node_modules

# Copy the pre-compiled ESM config (esbuild output from builder)
COPY --from=builder --chown=js:nodejs /app/dist ./dist

# Copy migrations directory (may be empty on first deploy — PayloadCMS will create tables via migrate)
COPY --from=builder --chown=js:nodejs /app/src/migrations ./migrations

USER js

# Render sets $PORT; fall back to 3000 for local dev
ENV PORT=3000
EXPOSE 3000

# Attempt DB migration on startup (non-blocking: server starts even if migration fails).
# This prevents Render's health-check timeout from rolling back the deploy when
# the DB is briefly unavailable at startup time.
CMD ["sh", "-c", "node node_modules/payload/bin.js migrate --force 2>&1 || true; node server.js"]
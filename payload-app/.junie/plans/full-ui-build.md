---
sessionId: session-260707-113149-1oje
---

# Requirements

### Overview & Goals

The app backend is fully wired — 9 API routes, 6 PayloadCMS collections, Redis caching, Kafka events, Stripe, PDF generation. The frontend however is a skeleton: the home page is a plain dark card grid, the flights page is blank (`<h1>Flights Page</h1>`), the dashboard just shows an email address, and none of the services (flight search, claims, rides, meals, pet checklist) have any UI.

The goal is to build a complete, polished frontend that exposes every backend service to the user.

### Scope

#### In Scope
- Fix the **layout inconsistency**: the root layout header/footer is white but the home page is `bg-gray-950` — pick a consistent premium dark theme and apply it everywhere
- **Auth-aware navigation** header: show email + logout when a `payload-token` cookie is present; show Login/Sign Up when not
- **Home page hero**: proper landing page with service highlights and CTAs, not a raw link grid
- **Flights search page** (`/flights`): search form connected to `POST /api/v1/flights/search`, results card list
- **Claims page** (`/claims`): file a new delay-compensation claim (form → `POST /api/v1/claims`) + list the user's past claims (`GET /api/v1/claims?user_id=…`)
- **Rides page** (`/rides`): ride-request form connected to `POST /api/v1/rides/request`, confirmation summary
- **Meals page** (`/meals`): browse available meals (`GET /api/v1/meals`), reserve a meal (`POST /api/v1/meals/reserve`)
- **Pet checklist page** (`/pets`): form → `POST /api/v1/pets/checklist`, triggers PDF download
- **Dashboard** (`/dashboard`): authenticated overview — welcome card, quick-action tiles for each service, and the user's recent claims
- **Nav update**: add Flights, Claims, Rides, Meals, Pets links

#### Out of Scope
- Payment UI / Stripe checkout
- Real-time WebSocket flight tracking UI
- Admin panel customization (PayloadCMS `/admin` is already working)
- Mobile app or native wrappers

### User Stories
- As a traveller, I want to search last-minute flights and see prices so I can book quickly
- As a delayed passenger, I want to file a compensation claim in seconds without filling paper forms
- As a traveller arriving at the airport, I want to request the right-sized car for my luggage
- As a passenger, I want to pre-select my in-flight meal before boarding
- As a pet owner, I want to generate a PDF checklist of everything my pet needs to enter a country
- As a logged-in user, I want a dashboard that shows my history and quick links to every service

### Non-Functional Requirements
- Every new page passes `tsc --noEmit --skipLibCheck` with zero errors
- No new npm dependencies — use Tailwind CSS (already installed) and native browser APIs only
- Server components where possible (data fetching); `'use client'` only for interactive forms

# Technical Design

### Current State

 File | Status |
---|---|
 `src/app/layout.tsx` | White header + dark page = visual clash; nav is static (no auth check) |
 `src/app/page.tsx` | Dark `bg-gray-950` hero with 4 raw `<a>` buttons |
 `src/app/flights/page.tsx` | Empty placeholder — 2 lines of text, no functionality |
 `src/app/dashboard/page.tsx` | Auth-gated but shows only email + logout button |
 `src/app/login/page.tsx` | Functional but completely unstyled beyond a plain border card |
 `src/app/signup/page.tsx` | Same as login |
 No `/claims`, `/rides`, `/meals`, `/pets` pages exist | — |

### Key Decisions

1. **Consistent dark theme** — the home page already uses `bg-gray-950`. The layout header/footer will be changed to match (`bg-gray-900 border-gray-800`). All new pages use the same dark palette (gray-950 bg, white text, indigo-500/600 accents).
2. **Auth-aware header via server component** — `layout.tsx` is already a server component. We can read `cookies()` from `next/headers` to determine session state and render different nav links without adding a client-side state layer.
3. **All feature pages are new route files** — no new folders need to be created; Next.js App Router handles `/claims`, `/rides`, `/meals`, `/pets` automatically.
4. **Client components for forms only** — each feature page is a server component that renders a `'use client'` sub-form component (like login/signup already do). Server components handle initial data loads (e.g., meals list).
5. **Zero new dependencies** — Tailwind utilities + native `fetch` cover all UI needs.

### Architecture Diagram

```mermaid
graph TD
    L[layout.tsx\nServer component] -->|reads cookie| AuthHeader[Auth-Aware Header]
    L --> Pages
    Pages --> Home[/ Home Hero]
    Pages --> Flights[/flights\nSearch + Results]
    Pages --> Claims[/claims\nFile + History]
    Pages --> Rides[/rides\nRequest Form]
    Pages --> Meals[/meals\nBrowse + Reserve]
    Pages --> Pets[/pets\nChecklist PDF]
    Pages --> Dashboard[/dashboard\nOverview + Quick Links]
    Flights -->|POST| API1[/api/v1/flights/search]
    Claims -->|POST GET| API2[/api/v1/claims]
    Rides -->|POST| API3[/api/v1/rides/request]
    Meals -->|GET POST| API4[/api/v1/meals + reserve]
    Pets -->|POST - PDF| API5[/api/v1/pets/checklist]
```

### Proposed Changes

#### 1. `src/app/layout.tsx` — Layout Shell & Auth Nav
- Change header from `bg-white` → `bg-gray-900 border-gray-800 text-white`
- Change footer to match dark theme
- Read `cookies()` from `next/headers` inside the layout (server component) — if `payload-token` cookie is present, fetch user with `payload.auth()` and render email + Logout button; otherwise render Login / Sign Up
- Add nav links: Home · Flights · Claims · Rides · Meals · Pets · Dashboard

#### 2. `src/app/page.tsx` — Home Page Hero
- Replace the 4-button grid with a proper hero section: headline, sub-headline, two CTAs ("Search Flights" → `/flights`, "My Dashboard" → `/dashboard`)
- Below the hero: a 2×3 service card grid (Flights, Claims, Rides, Meals, Pets, Admin) with an icon, short description, and action link each

#### 3. `src/app/flights/page.tsx` — Flight Search
- Server component shell + `FlightSearchForm` client component
- Form fields: Origin (IATA code), Destination (IATA code), Date
- On submit: `POST /api/v1/flights/search` → display result cards (airline, departure, arrival, price)
- Loading state and error state handled inside the client component

#### 4. `src/app/claims/page.tsx` — Claims (new file)
- Server component: fetches existing claims from `GET /api/v1/claims?user_id=me` (or from PayloadCMS directly via `getPayload`) — renders a claims history table
- `ClaimForm` client component below: flightId, delay minutes → `POST /api/v1/claims` → success card with payout amount

#### 5. `src/app/rides/page.tsx` — Ride Request (new file)
- `RideRequestForm` client component: pickup, dropoff, luggage volume (L), luggage weight (lbs)
- On submit: `POST /api/v1/rides/request` → confirmation card (vehicle matched, fee, booking confirmed)

#### 6. `src/app/meals/page.tsx` — Meals (new file)
- Server component: `GET /api/v1/meals` to fetch available meals list → render meal cards server-side
- Each card has a "Reserve" button → `MealReserveForm` client component (flight ID + seat number input → `POST /api/v1/meals/reserve` → booking reference)

#### 7. `src/app/pets/page.tsx` — Pet Checklist (new file)
- `PetChecklistForm` client component: origin, destination, owner name, pet name
- On submit: `POST /api/v1/pets/checklist` returns a PDF binary → trigger browser download via `URL.createObjectURL`

#### 8. `src/app/dashboard/page.tsx` — Dashboard Rebuild
- Keep existing auth guard + `getPayload` session check
- Add quick-action service tiles (same 5 services)
- Add recent claims section: fetch `GET /api/v1/claims?user_id={user.id}` and display last 5 in a status table

### File Structure

```
src/app/
├── layout.tsx                  ← MODIFIED  (dark theme, auth nav)
├── page.tsx                    ← MODIFIED  (hero + service grid)
├── globals.css                 ← unchanged
├── flights/page.tsx            ← MODIFIED  (real search UI)
├── dashboard/page.tsx          ← MODIFIED  (richer dashboard)
├── login/page.tsx              ← minor style polish
├── signup/page.tsx             ← minor style polish
├── claims/
│   └── page.tsx                ← NEW
├── rides/
│   └── page.tsx                ← NEW
├── meals/
│   └── page.tsx                ← NEW
└── pets/
    └── page.tsx                ← NEW
```

# Testing

### Validation Approach
After each stage, run `tsc --noEmit --skipLibCheck` to confirm zero TypeScript errors. Then verify routing and rendering.

### Key Scenarios

 Page | What to verify |
---|---|
 `/` | Hero renders, service cards visible, CTA links correct |
 `/flights` | Form submits to `/api/v1/flights/search`, mock results card appears |
 `/claims` | New claim form submits and shows payout amount; existing claims list renders |
 `/rides` | Form submits, matched vehicle + fee shown in confirmation |
 `/meals` | Meal cards render from API; reserve form returns booking ref |
 `/pets` | Form submits, PDF download is triggered in the browser |
 `/dashboard` | Redirects to `/login` without token; shows welcome + recent claims with token |
 Nav (logged in) | Header shows email + Logout, hides Login/Sign Up |
 Nav (logged out) | Header shows Login + Sign Up, hides email/Logout |

### Edge Cases
- Flight search with invalid IATA codes → API returns 400, UI shows error message
- Claim with delay < 60 minutes → API returns 422, UI shows "doesn't qualify" message
- Ride with luggage too large → API returns 400, UI shows "no vehicle matched"
- Pet checklist PDF download in Safari (needs `<a download>` workaround)
- Dashboard accessed without a cookie → immediate redirect to `/login`

# Delivery Steps

### ✓ Step 1: Fix layout shell: dark theme + auth-aware navigation
`src/app/layout.tsx` is updated to a consistent dark theme with a server-side auth check that renders different nav items based on the session cookie.

- Change header from `bg-white` to `bg-gray-900 border-b border-gray-800` with white text
- Change footer to `bg-gray-900 border-t border-gray-800 text-gray-400`
- Read `cookies()` from `next/headers` inside the layout (it's already a server component)
- Call `payload.auth()` with the cookie — if valid, render user email + a POST-form Logout button; if not, render Login and Sign Up nav links
- Add navigation links for all new pages: Flights, Claims, Rides, Meals, Pets, Dashboard
- Run `tsc --noEmit --skipLibCheck` → zero errors

### ✓ Step 2: Rebuild home page hero and flight search page
`src/app/page.tsx` becomes a polished landing page; `src/app/flights/page.tsx` becomes a real flight search UI connected to the existing API.

**Home page (`src/app/page.tsx`):**
- Replace the 4-button link grid with a hero section: full-width dark gradient, large headline, sub-headline, two CTA buttons (Search Flights → `/flights`, My Dashboard → `/dashboard`)
- Below the hero: 2×3 service card grid — Flights ✈️, Claims 💼, Rides 🚗, Meals 🍽, Pets 🐾, Admin 🛠 — each with icon, one-line description, and a link

**Flights page (`src/app/flights/page.tsx`):**
- Server component wrapper + `FlightSearchForm` `'use client'` component
- Form fields: Origin (IATA code), Destination (IATA code), Departure Date
- On submit: `POST /api/v1/flights/search` → show result cards (airline, departure, arrival, price with concierge fee label)
- Loading spinner and API error message states
- Run `tsc --noEmit --skipLibCheck` → zero errors

### ✓ Step 3: Build claims page and enrich the dashboard
`src/app/claims/page.tsx` is created (new file); `src/app/dashboard/page.tsx` is upgraded to a rich overview page.

**Claims page (`src/app/claims/page.tsx`):**
- Server component shell reads `payload-token` cookie; if missing, redirects to `/login`
- `ClaimForm` `'use client'` component: Flight ID text input, Delay Minutes number input → `POST /api/v1/claims` → success card showing payout amount and claim status
- Handles 422 "delay too short" error with a clear user message

**Dashboard (`src/app/dashboard/page.tsx`):**
- Keep existing auth guard
- Add 5 quick-action service tiles (Flights, Claims, Rides, Meals, Pets) with dark card styling
- Add "Recent Claims" section: server-side fetch from `getPayload` for the user's latest 5 claims, rendered as a status table with color-coded badges (pending=yellow, paid=green, failed=red)
- Run `tsc --noEmit --skipLibCheck` → zero errors

### ✓ Step 4: Build rides, meals, and pet checklist pages
Three new pages are created — each connected to its existing backend API endpoint.

**Rides page (`src/app/rides/page.tsx`):**
- `RideRequestForm` `'use client'` component: Pickup, Dropoff, Luggage Volume (L), Luggage Weight (lbs)
- `POST /api/v1/rides/request` → confirmation card: vehicle matched, total fee, pickup/dropoff summary
- Error state for "no vehicle matched" (luggage too large)

**Meals page (`src/app/meals/page.tsx`):**
- Server component fetches `GET /api/v1/meals` at render time and passes docs to the template
- Meal cards rendered server-side (name, description, available badge)
- Each card has a "Reserve" button that expands a `MealReserveForm` `'use client'` component (flight ID + seat number → `POST /api/v1/meals/reserve` → booking reference)

**Pet checklist page (`src/app/pets/page.tsx`):**
- `PetChecklistForm` `'use client'` component: Origin, Destination, Owner Name, Pet Name
- `POST /api/v1/pets/checklist` returns a PDF binary → trigger download via `URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))` + programmatic `<a download>` click
- Loading state while PDF generates; error state if API fails
- Run `tsc --noEmit --skipLibCheck` → zero errors

### ✓ Step 5: Polish login, signup pages and final type-check
Login and signup pages are brought visually in line with the rest of the dark theme, and a final build check confirms everything compiles.

- Update `src/app/login/page.tsx`: change the white `border rounded-lg` card to a dark `bg-gray-900 border border-gray-700 rounded-xl` card; style inputs with `bg-gray-800 border-gray-700 text-white placeholder-gray-400`
- Same treatment for `src/app/signup/page.tsx`
- Verify all inter-page links are correct (nav → new pages, CTA buttons → correct routes)
- Run `tsc --noEmit --skipLibCheck` → zero errors (final gate)
- Confirm `next build` completes without error
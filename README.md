# EcoChain 2.0 — Smart Recycling Platform

A full-stack, Uzbek-first gamified recycling platform. Citizens scan waste, drop it at a
recycling station, earn **EcoTokens** through a server-validated reward flow, and spend
them in a rewards marketplace — all backed by a real database with atomic, auditable
token accounting.

This evolved from a single static HTML prototype (`../index.html`, kept for reference)
into a Next.js App Router application with a Prisma-backed database, real auth, and
server-enforced business rules.

## What's real vs. demo-labeled

Being upfront about this matters more than it looks impressive in a screenshot.

| Feature | Status |
|---|---|
| Auth, sessions, roles (USER/PARTNER/ADMIN) | **Real** — bcrypt hashing, httpOnly session cookies, server-side role checks on every protected route |
| Token ledger (earn/spend/balance) | **Real** — every change goes through one ledger function (`src/lib/ledger.js`), balances are server-computed, redemptions/rewards are atomic Prisma transactions, balance can never go negative |
| Ledger integrity chain | **Real but not a blockchain** — each ledger entry is SHA-256 hashed together with the previous entry's hash (`prevHash` → `integrityHash`). Tampering with or deleting a past row breaks every hash after it. There is no network, no wallet address, no blockchain submission — see §17 below |
| Recycling verification flow | **Real** — a scan opens a `PENDING` event; it only pays out once the station's QR/demo code is confirmed server-side; duplicate/replay submissions are rejected (`src/app/api/scan/verify/route.js`) |
| AI waste classification | **Demo mode** — there is no real image-classification model wired up. The UI never claims otherwise: `scan.demoLabel` is shown at all times. Classification = whatever material the user selects/confirms, with a plausible confidence score for UI purposes. Swap in a real model via `src/lib/classifier.js` + `AI_CLASSIFIER_MODE=model` |
| Recycling stations | **Demo locations in Tashkent** — plausible districts/coordinates, clearly labeled `map.demoLocations`, not verified real GPS or live capacity data |
| Rewards / coupons | **Demo vouchers** — redemption, stock, and token debit are fully real and atomic; the coupons themselves are not accepted by an actual business (`rewards.demoVoucher`) |
| Challenges & achievements | **Real** — progress is recomputed server-side from verified recycling events, never trusted from the client |
| Admin panel | **Real** — stations/rewards CRUD, user suspension, event review with compensating ledger reversal, CSV export, all role-gated server-side |
| Partner portal | **Not implemented** — out of scope for this pass; `PartnerProfile`/`Reward.partnerId` exist in the schema so it can be added without a data model change |
| Blockchain | **Not implemented** — see the integrity-chain note above instead of a fake chain |

## Stack

- Next.js 16 (App Router, JavaScript, Turbopack) — **Cache Components is intentionally
  disabled** (`next.config.mjs`) because this app is session-authenticated and
  database-driven end to end; opting into it would require restructuring nearly every
  page around `<Suspense>` for no benefit here.
- Tailwind CSS v4, `lucide-react` icons, Recharts, Leaflet/OpenStreetMap via
  `react-leaflet`, TanStack React Query.
- Prisma ORM + **SQLite** for local dev (zero external services to stand up for a
  hackathon). The schema has no SQLite-specific types — switching `datasource.provider`
  to `postgresql` and pointing `DATABASE_URL` at a Postgres instance is the only change
  needed to run this in production. The build generates Prisma Client first so its query
  engine matches the deployment platform.
- Custom session-cookie auth (bcrypt + httpOnly cookie + `Session` table) — no
  third-party auth dependency.

## Getting started

```bash
cp .env.example .env     # defaults work out of the box for local dev
npm install
npm run db:migrate       # create the SQLite schema
npm run db:seed          # demo users, stations, rewards, challenges, sample ledger history
npm run dev
```

Open http://localhost:3000.

**Demo logins** (also shown on the login screen):
- `demo@ecochain.uz` / `demo1234` — regular user, pre-seeded with recycling history
- `admin@ecochain.uz` / `admin1234` — admin panel access

### Resetting demo data

From the admin panel, **Reset Demo Data** re-runs the seed script. This deletes and
recreates all users (including sessions), so you'll be logged out afterward — log back
in with either demo account. Equivalent from the CLI: `npm run db:reset`.

## Demo script (end-to-end)

1. Log in as `demo@ecochain.uz`. Dashboard shows recycled kg, token balance, CO2 avoided,
   rank, a trend chart, and material breakdown — all computed from real rows.
2. Go to **Scan & Earn**, pick a material (or upload/take a photo and then confirm a
   material — demo mode never auto-labels from pixels). Set an estimated weight and a
   station.
3. Click **Enter verification code** → **Scan** (auto-fills the station's demo QR code,
   simulating a physical scan) → **Submit & Earn Tokens**. The server computes the
   reward from the admin-configurable `RewardRule` table and credits the ledger.
4. **Wallet** shows the new transaction with its integrity hash. **Dashboard** and
   **Leaderboard** update immediately (same underlying data, no mocked numbers).
5. **Rewards** → redeem something affordable → **My Coupons** shows the generated coupon
   code; wallet balance drops by exactly the reward's cost.
6. **Map** → find stations by material/district, use "Find nearby" for
   geolocation-based distance sorting.
7. **Challenges** → join one → it's already progressing from the events above.
8. Log in as `admin@ecochain.uz` → **Admin**: review the event feed, flag an event as
   fraudulent (reverses its token reward via a compensating ledger entry, not a delete),
   manage stations/rewards, export CSV, suspend a user.

## Project structure

```
src/
  app/                  routes (App Router) — each protected page is a thin server
                         component that checks auth/role, then renders a client
                         component that does the data fetching via React Query
  app/api/              all backend logic — every mutation is validated + authorized
                         server-side; the client never dictates a token amount
  components/           AppShell (nav/theme/lang), shared UI primitives, API client
  lib/                  auth, ledger, reward rules, challenges, i18n, constants
prisma/
  schema.prisma         data model
  seed.js               demo data (also powers the admin "reset" button)
```

## Known limitations / next steps

- No automated test suite — flows above were verified manually end-to-end (curl +
  browser) during development, including the duplicate-reward and insufficient-balance
  paths.
- Partner portal, a real image-classification integration, and a genuine blockchain
  anchor are deliberately out of scope for this pass (see table above) rather than
  half-built.
- i18n covers all navigation and the core screens (dashboard, scan, wallet, rewards,
  map, leaderboard, challenges, profile, admin); a few admin-only labels are
  English-only since that surface is internal tooling, not the citizen-facing product.

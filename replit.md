# CryptoCore — Professional Crypto Trading Platform

## Overview

CryptoCore is a full-stack professional algorithmic crypto trading command center. It's a pnpm workspace monorepo using TypeScript throughout.

## Architecture

```
artifacts/
  api-server/        — Express 5 REST API server
  crypto-platform/   — React + Vite frontend (SaaS app)
lib/
  db/               — PostgreSQL + Drizzle ORM schema & queries
  api-spec/         — OpenAPI spec (openapi.yaml)
  api-client-react/ — Auto-generated React Query hooks + Zod schemas (via Orval)
```

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24
- **TypeScript**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec → React Query hooks)
- **Frontend**: React 19 + Vite 7, Tailwind CSS v4, shadcn/ui
- **Charts**: Recharts
- **Routing**: Wouter
- **Auth**: Token-based (Bearer token in localStorage via `lib/auth.ts`)

## Partner Ecosystem (STRICT BOUNDARIES)

| Partner | Role | Notes |
|---------|------|-------|
| BTCC | Primary Crypto Exchange | Order execution, balance custody |
| Bitget | Secondary Crypto Exchange | Overflow routing, arbitrage, failover |
| Forex.com | Broker / Execution Partner | Account data only, NOT a crypto exchange, NOT auth provider |
| Yahoo Finance | Market Data Partner | Price feeds only, NOT execution or auth |
| Investopedia | Education Partner | Content only, NOT execution or auth |

**None of the partners are authentication providers. Auth is handled internally.**

## Key Pages

- `/` — Landing page
- `/login` — Login (demo: demo@cryptocore.io / demo1234)
- `/register` — Registration
- `/onboarding` — 3-step onboarding wizard
- `/dashboard` — Command center: metrics, PnL chart, positions, guardian, market overview, audit log, kill-switch
- `/signals` — Trading signals with confidence scores
- `/trades` — Trade history and stats
- `/risk` — Risk metrics and configurable limits
- `/logs` — System log viewer
- `/settings` — Platform configuration
- `/partners` — Partner ecosystem with role boundaries
- `/education` — Education hub (via Investopedia)

## Kill Switch

The kill switch is a prominent feature on the dashboard. It requires AlertDialog confirmation before activating or deactivating. When active, a red banner appears at the top of the dashboard.

## Database Tables

- `users` — Accounts with role and onboardingCompleted flag
- `sessions` — Token-based auth sessions
- `positions` — Open and closed trading positions
- `orders` — Order records
- `signals` — Trading signals
- `trades` — Trade history
- `audit_log` — Immutable audit trail
- `system_logs` — Platform system logs
- `guardian_state` — Guardian monitor state and checks
- `risk_limits` — Configurable risk limit settings
- `platform_settings` — User/platform settings

## Key Commands

- `pnpm run typecheck` — Full typecheck
- `pnpm run build` — Build all packages
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — Push DB schema changes
- `pnpm --filter @workspace/api-server run dev` — Run API server
- `pnpm --filter @workspace/crypto-platform run dev` — Run frontend

## CSS Theme

Dark mode by default (`document.documentElement.classList.add("dark")` in main.tsx).
- Background: `222 47% 7%` (deep navy)
- Primary: `217 91% 60%` (electric blue)
- chart-2: green (positive PnL)
- chart-3: amber (warnings)
- chart-5: red (danger/negative PnL)

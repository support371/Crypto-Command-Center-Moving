# Local Development

## Windows-first quick start

1. Copy `.env.example` to `.env`
2. Keep the default embedded database or update `DATABASE_URL` to a reachable Postgres instance
3. Install dependencies with `pnpm install`
4. Start the API:
   - `pnpm --filter @workspace/api-server run build`
   - `pnpm --filter @workspace/api-server run start`
5. Start the frontend:
   - `pnpm --filter @workspace/crypto-platform run dev`

## Defaults in this repo

- The API start script loads `.env.local` or `.env` from the repo root or `artifacts/api-server`
- API default port is `3001` when `PORT` is unset
- API default database is embedded `pglite:memory://cryptocore` when `DATABASE_URL` is unset
- Frontend default port is `4173`
- Frontend dev requests to `/api/*` are proxied to `http://127.0.0.1:3001` unless `API_TARGET` is overridden

## Verified on this machine

- `pnpm install`
- `pnpm run typecheck`
- `pnpm run build`

## Demo login

- Email: `demo@cryptocore.io`
- Password: `demo1234`

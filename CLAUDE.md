# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See [AGENTS.md](./AGENTS.md) for tooling list and code quality rules.

## Commands

```sh
bun run dev          # dev server on :5173
bun run build        # production build → build/
bun run migrate      # run pending DB migrations
bun run test         # unit tests (*.test.ts)
bun run test:integration  # integration tests against real DB (*.integration.spec.ts)
bun run lint         # prettier + eslint check
bun run format       # auto-format
```

Run a single test file:
```sh
bun test src/lib/dao/places/index.test.ts
```

Run Docker (full stack: app + postgres + nginx):
```sh
cp .env.example .env   # fill in secrets first
docker compose up --build
```

## Architecture

**Full-stack SvelteKit app** (SSR + API routes) backed by PostgreSQL, with Discord OAuth for auth.

### Request flow
```
nginx :80 → app :3000 (SvelteKit/adapter-node)
                ↓
          +layout.server.ts  ← verifies HMAC session cookie → loads User
                ↓
          page/route server load or +server.ts endpoint
                ↓
          DAO classes → Bun SQL (tagged template literals) → PostgreSQL
```

### Key directories

- `src/lib/dao/` — Data access objects for `users`, `places`, `visits`. Each DAO takes a `SQL` instance (or `TransactionSQL` for tx support) and returns Zod-validated domain types. Domain errors (e.g. `DuplicateGooglePlaceIdError`) are thrown from DAOs; callers narrow them.
- `src/lib/db/` — `index.ts` exports the global `sql` singleton; `migrations/` holds timestamped `*.up.sql` files; `scripts/migrate.ts` applies them idempotently at startup.
- `src/lib/server/` — Server-only utilities: `cookie.ts` (HMAC-signed session tokens), `discord.ts` (OAuth + guild membership check), `google-places.ts` (Places API v1 search).
- `src/lib/result.ts` — Custom `Result<T, E>` type. **Synchronous functions must return `Result` instead of throwing.** Async functions may throw.
- `src/routes/` — SvelteKit routes. Auth flow: `/auth/discord/callback` → exchange code → upsert user → set cookie → redirect. `/places/search` — hybrid search combining full-text Postgres query + Google Places API.

### Data model (Postgres)
`users` → `places` (submitted_by FK) → `visits` → `visit_photos`

`places` has a GIN index on `name` for full-text search (`to_tsvector / plainto_tsquery`).

### Auth
Session cookie format: `userId:expiresAt.<HMAC-SHA256-base64>` signed with `SESSION_SECRET`. Verified in `+layout.server.ts` on every request; `user` (or `null`) is available to all pages via layout data.

Discord OAuth checks guild membership and optionally a "goated" role for tiered access.

### Environment variables
`PUBLIC_GOOGLE_MAPS_API_KEY` is baked into the client bundle at Vite build time (`$env/static/public`). All other secrets are runtime-only. See `.env.example` for the full list.

### Testing
- Unit tests mock the SQL layer via `src/lib/dao/mock.ts`.
- Integration tests use a real `sc_map_test` database (connection via `SQL_URL` env, set automatically in the `test:integration` script).
- `src/lib/test/setup.ts` runs migrations before each integration suite.

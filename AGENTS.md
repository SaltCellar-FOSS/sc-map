# Tools

- **Runtime**: [Bun](https://bun.sh/) - JavaScript runtime and package manager
- **Framework**: [SvelteKit](https://kit.svelte.dev/) - Web application framework (adapter: `@sveltejs/adapter-node`)
- **Language**: [TypeScript](https://www.typescriptlang.org/) - strict mode enabled
- **Database**: Bun SQL (native PostgreSQL driver, tagged template literals)
- **Validation**: [Zod](https://zod.dev/) - runtime schema validation
- **Linting**: [ESLint](https://eslint.org/) with `eslint-plugin-svelte`
- **Formatting**: [Prettier](https://prettier.io/) with `prettier-plugin-svelte` (tabs, single quotes, 100-char width)
- **Testing**: Bun's built-in test runner
- **Unused exports**: [Knip](https://knip.dev/) (`bun run knip`)
- **Pre-commit hooks**: [prek](https://github.com/j178/prek)

# Docker

The app runs via Docker Compose with three services: `db` (Postgres 17), `app` (SvelteKit/Bun), and `nginx` (reverse proxy on port 80).

- **Adapter**: `@sveltejs/adapter-node` — produces `build/index.js` started with `node build/index.js`
- **Migrations**: run automatically at container startup via `docker-entrypoint.sh` before the server starts
- **Public env vars**: `PUBLIC_GOOGLE_MAPS_API_KEY` is baked into the client bundle at build time — must be set in `.env` before `docker compose build`
- **All other secrets**: runtime env vars loaded from `.env` at `docker compose up` time
- **`.env.example`**: documents every required variable — copy to `.env` and fill in before first run

```sh
cp .env.example .env
# fill in .env
docker compose up --build
```

# Architecture

**Full-stack SvelteKit app** (SSR + API routes) backed by PostgreSQL, with Discord OAuth for auth.

## Request flow

```
nginx :80 → app :3000 (SvelteKit/adapter-node)
                ↓
          +layout.server.ts  ← verifies HMAC session cookie → loads User
                ↓
          page/route server load or +server.ts endpoint
                ↓
          DAO classes → Bun SQL (tagged template literals) → PostgreSQL
```

## Key directories

- `src/lib/` — Shared utilities and types. See [src/lib/AGENTS.md](src/lib/AGENTS.md).
- `src/lib/db/` — Global `sql` singleton, migrations. See [src/lib/db/AGENTS.md](src/lib/db/AGENTS.md).
- `src/lib/server/` — Server-only utilities. See [src/lib/server/AGENTS.md](src/lib/server/AGENTS.md).
- `src/lib/server/dao/` — Data access objects. See [src/lib/server/dao/AGENTS.md](src/lib/server/dao/AGENTS.md).
- `src/routes/` — SvelteKit routes. See [src/routes/AGENTS.md](src/routes/AGENTS.md).

## Data model

```
users → saved_places (submitted_by FK) → visits → visit_photos
```

`saved_places` has a GIN index on `name` for full-text search (`to_tsvector` / `plainto_tsquery`).

## Auth

Session cookie format: `userId:expiresAt.<HMAC-SHA256-base64>` signed with `SESSION_SECRET`. Verified on every request in `+layout.server.ts`; `user` (or `null`) is available to all pages via layout data.

Discord OAuth checks guild membership and optionally a "goated" role for tiered access. A user has access when `user.has_lifetime_access || user.is_current_server_member` — always check both conditions together, never just one.

## Environment variables

| Variable                     | Notes                                               |
| ---------------------------- | --------------------------------------------------- |
| `PUBLIC_GOOGLE_MAPS_API_KEY` | Baked into the client bundle at Vite build time     |
| `PUBLIC_DISCORD_CLIENT_ID`   | Discord OAuth app client ID                         |
| `SESSION_SECRET`             | HMAC signing key for session cookies                |
| `DISCORD_CLIENT_SECRET`      | Discord OAuth secret                                |
| `DISCORD_REDIRECT_URI`       | OAuth callback URL                                  |
| `DISCORD_GUILD_ID`           | Discord server to gate access against               |
| `DISCORD_GOATED_ROLE_ID`     | Role ID conferring lifetime access                  |
| `ORIGIN`                     | Full app URL (used for cookie/redirect validation)  |
| `SQL_URL`                    | PostgreSQL connection string                        |
| `IMAGES_DIR`                 | Directory for uploaded images (default: `./images`) |

# Code Quality

- TypeScript, ESLint, and Prettier warnings are not allowed. All code must be warning-free.
- Synchronous functions must return the `Result` type (see `src/lib/result.ts`). Do not throw errors from synchronous functions.
- Asynchronous functions must NOT use `Result` — a `Promise` is already a result; use `throw`/rejection for async errors.
- All database results must be parsed through a Zod schema — never cast with `as`.
- Run `bun run check && bun run lint` before committing. CI enforces both.
- Run `bun run knip` to detect unused exports before marking work complete.

# Testing

- **Unit tests** (`*.test.ts`): mock the SQL layer; no real database needed. Located alongside the source file.
- **Integration tests** (`*.integration.spec.ts`): run against a real `sc_map_test` database. `src/lib/test/setup.ts` runs migrations and truncates tables before each suite.
- Run a single file: `bun test src/lib/server/dao/saved-places/index.test.ts`
- Integration tests require `SQL_URL` set — the `test:integration` script sets this automatically.

# Salt Cellar Map

A Discord-gated web app for Salt Cellar members to discover, submit, and review food & drink venues on an interactive map.

Access is tied to Discord guild membership. Members can browse and submit places; "Goated" role holders get permanent lifetime access.

## Tech Stack

- **Framework**: SvelteKit (SSR + API routes)
- **Runtime**: Bun
- **Database**: PostgreSQL 17
- **Auth**: Discord OAuth with HMAC-signed session cookies
- **Reverse proxy**: nginx (Docker) / Traefik (production)

## Quick Start

### Option A — Native Bun (recommended for development)

```sh
git clone <repo-url> && cd sc-map
bun install
cp .env.example .env   # fill in your secrets
docker compose -f docker-compose.dev.yml up -d   # start Postgres only
bun run migrate
bun run dev              # http://localhost:5173
```

### Option B — Full Docker stack

```sh
cp .env.example .env   # fill in your secrets
docker compose -f docker-compose.local.yml up --build
# app available at http://localhost:3000
```

## Environment Variables

Copy `.env.example` to `.env` and fill in every value before running. Required variables:

| Variable | Description |
|---|---|
| `PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JS API key (baked into client bundle at build time) |
| `PUBLIC_DISCORD_CLIENT_ID` | Discord OAuth application client ID |
| `SESSION_SECRET` | Long random string for HMAC cookie signing |
| `DISCORD_CLIENT_SECRET` | Discord OAuth secret |
| `DISCORD_REDIRECT_URI` | OAuth callback URL (e.g. `http://localhost:5173/auth/discord/callback`) |
| `DISCORD_GUILD_ID` | Your Discord server ID |
| `DISCORD_GOATED_ROLE_ID` | Role ID that grants permanent access |
| `ORIGIN` | Full origin URL the app is served from (e.g. `http://localhost:5173`) |

> `PUBLIC_*` variables are baked into the client bundle at build time — set them before running `docker compose build` or `bun run build`.

## Commands

```sh
bun run dev               # dev server on :5173
bun run build             # production build → build/
bun run migrate           # run pending DB migrations
bun run test              # unit tests
bun run test:integration  # integration tests (requires real DB)
bun run lint              # prettier + eslint check
bun run format            # auto-format
```

## Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) — how to set up a local environment and contribute
- [DESIGN_DOC.md](./DESIGN_DOC.md) — architecture decisions and data model
- [AGENTS.md](./AGENTS.md) — tooling list and code quality rules

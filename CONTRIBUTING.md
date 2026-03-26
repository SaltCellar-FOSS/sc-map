# Contributing to Salt Cellar Map

Thanks for your interest in contributing! This guide will get you from zero to a running local environment.

## Prerequisites

- **[Bun](https://bun.sh/)** ≥ 1.x — used for the runtime, package manager, and test runner
- **[Docker](https://docs.docker.com/get-docker/) + Docker Compose** — used to run PostgreSQL locally
- **A Discord application** — required for OAuth login to work (see [Discord Setup](#discord-setup) below)
- **A Google Maps API key** — required to load the map and search places

## Local Development

There are two ways to run the app locally. **Option A is recommended** for active development because hot-reload is faster and you can run tests directly.

### Option A — Native Bun + Docker DB

This runs the SvelteKit dev server on your machine and only containerises the database.

```sh
# 1. Clone and install dependencies
git clone <repo-url>
cd sc-map
bun install

# 2. Set up environment
cp .env.example .env
# Edit .env — see "Environment Variables" below

# 3. Start the database
docker compose -f docker-compose.dev.yml up -d

# 4. Run database migrations
bun run migrate

# 5. Start the dev server
bun run dev
# → http://localhost:5173
```

### Option B — Full Docker Stack

This builds and runs the entire application (app + database) in Docker, closest to how it runs in production.

```sh
# 1. Clone
git clone <repo-url>
cd sc-map

# 2. Set up environment
cp .env.example .env
# Edit .env — see "Environment Variables" below

# 3. Build and start everything
docker compose up --build
# → http://localhost:3000
```

> Migrations run automatically on container startup via `docker-entrypoint.sh`.

## Environment Variables

Copy `.env.example` to `.env` and fill in each value:

| Variable | Description |
|---|---|
| `PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JS API key |
| `PUBLIC_DISCORD_CLIENT_ID` | Discord OAuth app client ID |
| `SESSION_SECRET` | Long random string, e.g. `openssl rand -hex 32` |
| `DISCORD_CLIENT_SECRET` | Discord OAuth app secret |
| `DISCORD_REDIRECT_URI` | OAuth callback URL — must also be registered in the [Discord Developer Portal](#discord-setup) |
| `DISCORD_GUILD_ID` | Your Discord server's ID |
| `DISCORD_GOATED_ROLE_ID` | Role ID for permanent access tier |
| `ORIGIN` | Full URL the app is served from |

For **Option A**, set:
```
DISCORD_REDIRECT_URI=http://localhost:5173/auth/discord/callback
ORIGIN=http://localhost:5173
```

For **Option B**, set:
```
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
ORIGIN=http://localhost:3000
```

> `PUBLIC_*` variables are baked into the client bundle at **build time**. If you change them, you must rebuild (`bun run build` or `docker compose build`).

## Discord Setup

You need a Discord application to use OAuth login:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. Under **OAuth2 → Redirects**, add your callback URL (e.g. `http://localhost:5173/auth/discord/callback`).
3. Copy the **Client ID** and **Client Secret** into `.env`.
4. Set `DISCORD_GUILD_ID` to the ID of the Discord server you want to gate access to.
5. Set `DISCORD_GOATED_ROLE_ID` to a role ID for the elevated access tier (or any role if you don't need tiered access).

## Running Tests

```sh
bun run test               # unit tests — fast, no DB required
bun run test:integration   # integration tests — uses a real sc_map_test database
```

Unit tests mock the database layer via `src/lib/dao/mock.ts`. Integration tests connect to a real database; the test script handles setup automatically.

To run a single test file:

```sh
bun test src/lib/dao/places/index.test.ts
```

## Code Standards

All code must pass lint and formatting checks with **zero warnings**:

```sh
bun run lint     # check
bun run format   # auto-fix
```

Key rules (enforced by pre-commit hooks via `prek`):

- **TypeScript**: no `any`, no unused variables, strict mode
- **Synchronous functions** must return `Result<T, E>` (see `src/lib/result.ts`) instead of throwing
- **Asynchronous functions** may throw
- Every database migration `.up.sql` file must have a corresponding `.down.sql` file

## Making a PR

1. Branch from `staging`:
   ```sh
   git checkout staging && git pull
   git checkout -b your-feature-name
   ```
2. Make your changes and ensure `bun run lint` passes.
3. If you're adding or changing database schema, create a migration:
   ```
   src/lib/db/migrations/<timestamp>_description.up.sql
   src/lib/db/migrations/<timestamp>_description.down.sql
   ```
4. Open a pull request against `staging` with a clear description of what changed and why.
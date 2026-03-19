# Tools

- **Runtime**: [Bun](https://bun.sh/) - JavaScript runtime
- **Framework**: [SvelteKit](https://kit.svelte.dev/) - Web application framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Linting**: [ESLint](https://eslint.org/) with [eslint-plugin-svelte](https://github.com/sveltejs/eslint-plugin-svelte)
- **Formatting**: [Prettier](https://prettier.io/) with [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte)
- **Testing**: Bun's built-in test runner
- **Pre-commit Hooks**: [prek](https://github.com/j178/prek)

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

# Code Quality

- TypeScript, ESLint, and Prettier warnings are not allowed. All code must be warning-free.
- Synchronous functions should use the `Result` type defined in @src/lib/result.ts. Do not throw errors outside of asynchronous functions.

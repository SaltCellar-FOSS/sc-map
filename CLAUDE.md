# CLAUDE.md

See [AGENTS.md](./AGENTS.md) for full project documentation, architecture, and code quality rules.

## Commands

```sh
bun run dev               # dev server on :5173
bun run build             # production build → build/
bun run check             # TypeScript + Svelte type check
bun run migrate           # run pending DB migrations
bun run test              # unit tests (*.test.ts)
bun run test:integration  # integration tests against real DB (*.integration.spec.ts)
bun run lint              # prettier + eslint check
bun run format            # auto-format
bun run knip              # detect unused exports
```

Run a single test file:

```sh
bun test src/lib/server/dao/saved-places/index.test.ts
```

Run Docker (full stack: app + postgres + nginx):

```sh
cp .env.example .env   # fill in secrets first
docker compose up --build
```

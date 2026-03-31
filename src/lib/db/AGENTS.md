# Database

## SQL singleton

`src/lib/db/index.ts` exports the global `sql` singleton (`new SQL({ url: process.env.SQL_URL! })`). Import it as `$lib/db` throughout server code. Never instantiate a second `SQL` connection — pass `sql` into DAOs instead.

## Migrations

Migrations live in `src/lib/db/migrations/` as timestamped `.up.sql` / `.down.sql` pairs.

### Rules

- **Always create both** `.up.sql` and `.down.sql`. The CI pre-commit hook (`scripts/verify-migrations.sh`) will reject a migration without a down file.
- `.up.sql` applies the change; `.down.sql` must fully reverse it.
- The migration runner (`scripts/migrate.ts`) is idempotent — it tracks applied migrations and skips already-applied ones on subsequent runs.
- Migrations run automatically at container startup via `docker-entrypoint.sh`. Run them locally with `bun run migrate`.

### Adding a migration

Use the provided script to create a migration pair with the correct name and timestamp:

```sh
bash src/lib/db/migrations/create-migration.sh <description>
# e.g. bash src/lib/db/migrations/create-migration.sh add_users_table
```

Then fill in the generated `.up.sql` and `.down.sql` files, and run `bun run migrate` to apply locally.

# Database Access Objects (DAOs)

## Directory structure

Each entity gets its own subdirectory under `src/lib/server/dao/`:

```
src/lib/server/dao/<entity>/
  types.ts                   — Zod schemas and inferred TypeScript types
  index.ts                   — DAO class and domain error classes
  index.test.ts              — Unit tests (mocked SQL)
  index.integration.spec.ts  — Integration tests (real database)
```

Shared files in `src/lib/server/dao/`:

- `base.ts` — `BaseDao<T, TInsert, TUpdate>` abstract class; provides `retrieve`, `list`, `insert`, `update`, `delete` and maps Postgres constraint errors to domain errors automatically.
- `errors.ts` — Shared domain error classes: `NotFoundError`, `DuplicateError`, `ForeignKeyError`, `CheckViolationError`.
- `mock.ts` — Test utilities: `createMockSQL(rows)` and `createErrorSQL(pgErrorCode)`.

## types.ts

Define Zod schemas for the entity, then derive TypeScript types with `z.infer<>`.

- Use `z.bigint()` for all bigint columns (`id`, foreign keys). The SQL client returns these as native `bigint` with `bigint: true`.
- Export named schemas (`EntitySchema`, `EntityInsertSchema`, `EntityUpdateSchema`) alongside their inferred types (`Entity`, `EntityInsert`, `EntityUpdate`).
- `InsertSchema` is typically `EntitySchema.omit({ id: true, created_at: true })`.
- `UpdateSchema` is typically `EntitySchema.omit({ id: true }).partial()`.

## index.ts

- Export a single `EntityDao` class. Its constructor takes a `SQL` instance (or `TransactionSQL` for transaction support).
- Extend `BaseDao` for standard CRUD, or implement methods directly for complex queries.
- Parse all database results through the Zod schema (e.g. `EntitySchema.parse(row)`) — never cast with `as`.
- Define and export domain-specific error classes (`EntityNotFoundError`, `DuplicateFieldError`, etc.) in this file, extending the shared base errors from `errors.ts`.
- Export union types for each operation's possible errors (e.g. `InsertEntityError`, `UpdateEntityError`).
- Write methods accept an optional `tx?: TransactionSQL` parameter to support multi-DAO transactions.

## index.test.ts

- Mock the database — do not use a real database connection.
- Use `createMockSQL(rows)` for success cases and `createErrorSQL(pgErrorCode)` for constraint error cases. Both are imported from `../mock`.
- Mock row fixtures must use native `bigint` for bigint columns (e.g. `id: 1n`), matching what the SQL client returns.
- Each test constructs its own DAO instance — no shared state or `beforeEach` DB setup needed.

## index.integration.spec.ts

- Test against a real database using `sql` from `$lib/db`.
- Use `beforeEach` to create a fresh DAO instance and insert required test fixtures (e.g. users, places in FK order).
- Use `afterEach` to delete all inserted data in reverse FK order (e.g. delete visits → saved_places → users).
- File name must be `index.integration.spec.ts` to be picked up by the integration test runner.
- Top-level describe: `describe('Integration', () => { ... })` with nested describes per method.
- Test both success cases and constraint errors (duplicate, not found, invalid FK, check violation).
- Use `.rejects.toBeInstanceOf(ErrorClass)` for error assertions.

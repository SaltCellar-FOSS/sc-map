# Migrations

This folder contains migrations that will be run in order against a SQL database to set it up properly.

New migrations should only be created using `src/lib/db/migrations/create-migration.sh`

Migrations should be idempotent and reversible. They will be run on every push to ensure that the database schema is up to date.

## `.up.sql` files

These files apply new migrations to the database.

## `.down.sql` files

These files revert their corresponding `.up.sql` files' changes to the database.

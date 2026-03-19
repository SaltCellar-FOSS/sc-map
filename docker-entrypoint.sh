#!/bin/sh
set -e

echo "Running migrations..."
bun scripts/migrate.ts

echo "Starting server..."
exec node build/index.js
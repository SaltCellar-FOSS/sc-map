#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

docker compose -f docker-compose.prod.yml run --rm backup \
  bash -c 'ts=$(date -u +%Y%m%dT%H%M%S)
    dest="/backups/sc_map_${ts}.sql.gz"
    pg_dump | gzip -9 > "$dest"
    chmod 644 "$dest"
    echo "[backup] $ts complete ($(du -sh "$dest" | cut -f1))"'

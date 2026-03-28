#!/bin/bash
set -euo pipefail

BACKUP_FILE="${1:?Usage: ./scripts/restore.sh <path/to/sc_map_TIMESTAMP.sql.gz>}"

CONTAINER=$(docker compose -f docker-compose.prod.yml ps -q db 2>/dev/null | head -1)
[[ -z "$CONTAINER" ]] && { echo "ERROR: db container not found — is the stack running?"; exit 1; }

echo "WARNING: this will overwrite the sc_map database with the contents of:"
echo "  $BACKUP_FILE"
read -r -p "Type 'yes' to continue: " confirm
[[ "$confirm" == "yes" ]] || { echo "Aborted."; exit 0; }

echo "[restore] streaming $BACKUP_FILE → db container …"
gunzip -c "$BACKUP_FILE" \
  | docker exec -i "$CONTAINER" psql -U sc_map -d sc_map

echo "[restore] done."

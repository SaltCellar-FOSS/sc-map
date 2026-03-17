#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <title>"
  echo "Example: $0 add_users_table"
  exit 1
fi

TITLE=$(echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr -cd 'a-z0-9_')
TIMESTAMP="$(date +%s)000"
BASE="${TIMESTAMP}_${TITLE}"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "-- Apply migration" > "$DIR/${BASE}.up.sql"
echo "-- Revert migration" > "$DIR/${BASE}.down.sql"

echo "Created:"
echo "  ${BASE}.up.sql"
echo "  ${BASE}.down.sql"

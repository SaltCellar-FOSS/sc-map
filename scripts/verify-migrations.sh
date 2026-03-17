#!/bin/bash

set -e

migrations_dir="src/lib/db/migrations"

for up_file in "$migrations_dir"/*.up.sql; do
  basename=$(basename "$up_file" .up.sql)
  down_file="${basename}.down.sql"
  down_path="$migrations_dir/$down_file"
  
  if [ ! -f "$down_path" ]; then
    echo "Error: $up_file is missing a corresponding $down_file"
    exit 1
  fi
done

echo "All migrations have corresponding down files"

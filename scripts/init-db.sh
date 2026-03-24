#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --host "${PGHOST:-localhost}" --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
    CREATE DATABASE sc_map_test;
    GRANT ALL PRIVILEGES ON DATABASE sc_map_test TO $POSTGRES_USER;
SQL
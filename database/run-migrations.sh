#!/usr/bin/env bash
# Run all database migrations (Bash / Git Bash)
# Usage: ./database/run-migrations.sh
# Requires: DATABASE_URL in env

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -z "$DATABASE_URL" ]; then
  echo "Set DATABASE_URL first, e.g.: export DATABASE_URL='postgresql://user:pass@host:port/railway'"
  exit 1
fi

for f in 001_add_birthday_replace_age.sql 002_add_address.sql 003_generate_queue_number_arr.sql; do
  path="$SCRIPT_DIR/migrations/$f"
  if [ -f "$path" ]; then
    echo "Running $f ..."
    psql "$DATABASE_URL" -f "$path"
  fi
done
echo "Migrations done."

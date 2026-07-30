#!/usr/bin/env bash
set -euo pipefail

db_name="yourbreath-community"
migration_file="drizzle/0002_production_backend.sql"

if npx wrangler d1 execute "$db_name" --remote --command "SELECT name FROM pragma_table_info('profiles') WHERE name = 'apple_subject'" --json | grep -q 'apple_subject'; then
  echo "Production migration already present; no database mutation required."
  exit 0
fi

echo "Applying the single verified production migration to $db_name"
npx wrangler d1 execute "$db_name" --remote --file "$migration_file"


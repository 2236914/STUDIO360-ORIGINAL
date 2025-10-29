#!/usr/bin/env bash
set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
OUT_DIR=${1:-"backups/db"}
mkdir -p "$OUT_DIR"

DB_URL=${DATABASE_URL:-${SUPABASE_DB_URL:-}}
if [ -z "$DB_URL" ]; then
  echo "DATABASE_URL not set" >&2
  exit 1
fi

pg_dump "$DB_URL" > "$OUT_DIR/backup_$DATE.sql"
echo "Database backup saved to $OUT_DIR/backup_$DATE.sql"



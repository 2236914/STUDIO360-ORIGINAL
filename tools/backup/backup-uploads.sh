#!/usr/bin/env bash
set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
SRC=${1:-"uploads"}
OUT_DIR=${2:-"backups/uploads"}
mkdir -p "$OUT_DIR"

tar -czf "$OUT_DIR/uploads_$DATE.tar.gz" "$SRC"
echo "Uploads backup saved to $OUT_DIR/uploads_$DATE.tar.gz"



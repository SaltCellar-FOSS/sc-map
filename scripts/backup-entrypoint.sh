#!/bin/bash
set -euo pipefail

do_backup() {
  local ts dest
  ts=$(date -u +%Y%m%dT%H%M%S)
  dest="/backups/sc_map_${ts}.sql.gz"
  pg_dump | gzip -9 > "$dest"
  chmod 644 "$dest"
  echo "[backup] $ts complete ($(du -sh "$dest" | cut -f1))"
  find /backups -name "sc_map_*.sql.gz" -mtime +"${KEEP_DAYS:-7}" -delete
  # -- Remote upload hook (uncomment + configure when ready) --
  # rclone copy "$dest" remote:sc-map-backups/
  # aws s3 cp "$dest" "s3://your-bucket/sc-map/$(basename "$dest")"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "[backup] service started — fires daily at 02:17 UTC"
  while true; do
    if [[ "$(date -u +%H%M)" == "0217" ]]; then
      do_backup
      sleep 61  # skip remainder of this minute to avoid double-run
    fi
    sleep 55
  done
fi

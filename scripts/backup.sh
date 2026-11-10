#!/usr/bin/env bash
# Nightly backup of the F.QUAD database, media library and private uploads.
#
#   scripts/backup.sh
#
# Settings (environment variables, all optional — defaults match SERVER_SETUP.md):
#   DB_FILE              /var/data/fquad/app.db
#   MEDIA_DIR            /var/data/fquad/media
#   PRIVATE_UPLOAD_DIR   /var/data/fquad/private-uploads
#   BACKUP_DIR           /var/backups/fquad
#   KEEP_DAYS            30
#   BACKUP_REMOTE        an rclone remote, e.g. spaces:fquad-backups (off-server copy)
set -euo pipefail

DB_FILE="${DB_FILE:-/var/data/fquad/app.db}"
MEDIA_DIR="${MEDIA_DIR:-/var/data/fquad/media}"
PRIVATE_UPLOAD_DIR="${PRIVATE_UPLOAD_DIR:-/var/data/fquad/private-uploads}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/fquad}"
KEEP_DAYS="${KEEP_DAYS:-30}"

# sqlite3 happily "backs up" a missing file by creating an empty database, which
# would look like a good backup. Refuse instead.
if [ ! -s "$DB_FILE" ]; then
  echo "$(date -Is) backup FAILED: database not found at $DB_FILE" >&2
  exit 1
fi

stamp="$(date +%Y%m%d-%H%M%S)"
umask 077
mkdir -p "$BACKUP_DIR"

# `.backup` takes a consistent snapshot even while the site is writing; a plain
# `cp` of a live SQLite file can capture it half-written.
sqlite3 "$DB_FILE" ".backup '$BACKUP_DIR/app-$stamp.db'"

# A backup that cannot be read back is worth nothing: check it before keeping it.
if [ "$(sqlite3 "$BACKUP_DIR/app-$stamp.db" 'PRAGMA integrity_check;')" != "ok" ]; then
  echo "$(date -Is) backup FAILED: integrity check did not pass for app-$stamp.db" >&2
  exit 1
fi
gzip -f "$BACKUP_DIR/app-$stamp.db"

for dir in "$MEDIA_DIR" "$PRIVATE_UPLOAD_DIR"; do
  if [ -d "$dir" ]; then
    name="$(basename "$dir")"
    tar -czf "$BACKUP_DIR/$name-$stamp.tar.gz" -C "$(dirname "$dir")" "$name"
  fi
done

# Drop backups older than KEEP_DAYS.
find "$BACKUP_DIR" -type f \( -name 'app-*.db.gz' -o -name '*.tar.gz' \) -mtime +"$KEEP_DAYS" -delete

if [ -n "${BACKUP_REMOTE:-}" ]; then
  rclone copy "$BACKUP_DIR" "$BACKUP_REMOTE" --max-age 2d
fi

echo "$(date -Is) backup ok: $stamp"

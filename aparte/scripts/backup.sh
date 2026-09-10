#!/bin/sh
set -eu

. /scripts/common.sh

require_connection_environment
wait_for_postgres

retention_days="${BACKUP_RETENTION_DAYS:-7}"
case "$retention_days" in
  ''|*[!0-9]*)
    echo "ERROR: BACKUP_RETENTION_DAYS debe ser un numero entero mayor o igual a cero." >&2
    exit 1
    ;;
esac

mkdir -p /backups
timestamp="$(date -u '+%Y%m%dT%H%M%SZ')"
safe_database="$(printf '%s' "$POSTGRES_DB" | tr -c '[:alnum:]_-' '_')"
backup_file="/backups/backup_${safe_database}_${timestamp}.dump"
partial_file="${backup_file}.partial"

cleanup_partial() {
  rm -f -- "$partial_file"
}
trap cleanup_partial 0
trap 'exit 1' 1 2 15

echo "Creando backup de '$POSTGRES_DB'..."
pg_dump \
  --host="$POSTGRES_HOST" \
  --port="$POSTGRES_PORT" \
  --username="$POSTGRES_USER" \
  --dbname="$POSTGRES_DB" \
  --format=custom \
  --compress=6 \
  --file="$partial_file"

# Comprueba que PostgreSQL puede leer el indice interno del archivo.
pg_restore --list "$partial_file" >/dev/null
mv "$partial_file" "$backup_file"
trap - 0 1 2 15

# Borra solamente archivos generados por este script y mas antiguos que la retencion.
find /backups -type f -name 'backup_*.dump' -mtime "+${retention_days}" -exec rm -f {} \;

echo "Backup creado y validado: $backup_file"

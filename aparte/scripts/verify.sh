#!/bin/sh
set -eu

. /scripts/common.sh

require_connection_environment
wait_for_postgres

backup_file="${1:-$(latest_backup)}"
if [ -z "$backup_file" ]; then
  echo "ERROR: No hay backups para verificar." >&2
  exit 1
fi
case "$backup_file" in
  /backups/*) ;;
  *) backup_file="/backups/$backup_file" ;;
esac
if [ ! -f "$backup_file" ]; then
  echo "ERROR: No existe el archivo $backup_file" >&2
  exit 1
fi

verification_database="backup_verify_$(date -u '+%Y%m%d%H%M%S')_$$"
created=0

cleanup() {
  status=$?
  trap - 0 1 2 15
  if [ "$created" -eq 1 ]; then
    dropdb \
      --host="$POSTGRES_HOST" \
      --port="$POSTGRES_PORT" \
      --username="$POSTGRES_USER" \
      --if-exists \
      "$verification_database" >/dev/null 2>&1 || true
  fi
  exit "$status"
}
trap cleanup 0
trap 'exit 1' 1 2 15

echo "Verificando $backup_file mediante una restauracion temporal..."
createdb \
  --host="$POSTGRES_HOST" \
  --port="$POSTGRES_PORT" \
  --username="$POSTGRES_USER" \
  --template=template0 \
  "$verification_database"
created=1

pg_restore \
  --host="$POSTGRES_HOST" \
  --port="$POSTGRES_PORT" \
  --username="$POSTGRES_USER" \
  --dbname="$verification_database" \
  --no-owner \
  --no-privileges \
  --exit-on-error \
  "$backup_file"

table_count="$(psql \
  --host="$POSTGRES_HOST" \
  --port="$POSTGRES_PORT" \
  --username="$POSTGRES_USER" \
  --dbname="$verification_database" \
  --tuples-only \
  --no-align \
  --command="SELECT count(*) FROM pg_catalog.pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema');")"

echo "Verificacion correcta: la restauracion contiene $table_count tabla(s) de usuario."
echo "La base temporal se eliminara automaticamente."

#!/bin/sh
set -eu

. /scripts/common.sh

require_connection_environment
wait_for_postgres

backup_file="${1:-$(latest_backup)}"
if [ -z "$backup_file" ]; then
  echo "ERROR: No hay backups para restaurar." >&2
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

restore_database="${RESTORE_DATABASE:-unidad_educativa_restaurada}"
if [ "$restore_database" = "$POSTGRES_DB" ]; then
  echo "ERROR: RESTORE_DATABASE no puede ser igual a la base de origen." >&2
  exit 1
fi

created=0
cleanup_on_error() {
  status=$?
  trap - 0 1 2 15
  if [ "$status" -ne 0 ] && [ "$created" -eq 1 ]; then
    echo "La restauracion fallo; se eliminara la base incompleta '$restore_database'." >&2
    dropdb \
      --host="$POSTGRES_HOST" \
      --port="$POSTGRES_PORT" \
      --username="$POSTGRES_USER" \
      --if-exists \
      "$restore_database" >/dev/null 2>&1 || true
  fi
  exit "$status"
}
trap cleanup_on_error 0
trap 'exit 1' 1 2 15

echo "Creando la base nueva '$restore_database'..."
echo "Si ya existe, el proceso se detendra sin modificarla."
createdb \
  --host="$POSTGRES_HOST" \
  --port="$POSTGRES_PORT" \
  --username="$POSTGRES_USER" \
  --template=template0 \
  "$restore_database"
created=1

pg_restore \
  --host="$POSTGRES_HOST" \
  --port="$POSTGRES_PORT" \
  --username="$POSTGRES_USER" \
  --dbname="$restore_database" \
  --no-owner \
  --no-privileges \
  --exit-on-error \
  "$backup_file"

trap - 0 1 2 15
echo "Restauracion completada en la base '$restore_database'."

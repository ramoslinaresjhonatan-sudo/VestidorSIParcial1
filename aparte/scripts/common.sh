#!/bin/sh

require_connection_environment() {
  : "${POSTGRES_HOST:?Falta POSTGRES_HOST}"
  : "${POSTGRES_PORT:?Falta POSTGRES_PORT}"
  : "${POSTGRES_DB:?Falta POSTGRES_DB}"
  : "${POSTGRES_USER:?Falta POSTGRES_USER}"
  : "${PGPASSWORD:?Falta PGPASSWORD}"
  export PGPASSWORD
}

wait_for_postgres() {
  attempts=0
  max_attempts=30

  until pg_isready \
    --host="$POSTGRES_HOST" \
    --port="$POSTGRES_PORT" \
    --username="$POSTGRES_USER" \
    --dbname="$POSTGRES_DB" >/dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge "$max_attempts" ]; then
      echo "ERROR: PostgreSQL no estuvo disponible despues de $max_attempts intentos." >&2
      return 1
    fi
    sleep 2
  done
}

latest_backup() {
  find /backups -type f -name 'backup_*.dump' 2>/dev/null | sort | tail -n 1
}

#!/bin/sh
set -u

interval="${BACKUP_INTERVAL_SECONDS:-86400}"
case "$interval" in
  ''|*[!0-9]*|0)
    echo "ERROR: BACKUP_INTERVAL_SECONDS debe ser un numero entero mayor que cero." >&2
    exit 1
    ;;
esac

echo "Automatizacion iniciada: un backup cada $interval segundos."

if [ "${BACKUP_ON_START:-true}" != "true" ]; then
  echo "El primer backup se ejecutara despues del primer intervalo."
  sleep "$interval"
fi

while true; do
  if /bin/sh /scripts/backup.sh; then
    echo "Siguiente ejecucion en $interval segundos."
  else
    echo "ERROR: El backup fallo; se volvera a intentar en $interval segundos." >&2
  fi
  sleep "$interval"
done

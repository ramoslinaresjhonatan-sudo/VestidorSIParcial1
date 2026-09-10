# Prueba de backups PostgreSQL en Docker Linux

Este entorno es independiente del backend principal. Levanta PostgreSQL en un
contenedor Linux, crea backups en formato personalizado de PostgreSQL y permite
comprobarlos mediante una restauracion temporal real.

## Requisitos

- Docker Desktop iniciado y configurado para usar contenedores Linux.
- PowerShell, una terminal Linux o WSL.

Las credenciales incluidas son unicamente para pruebas locales. No deben usarse
en produccion.

## Prueba manual completa

Desde esta carpeta (`aparte/`):

```powershell
docker compose up -d postgres
docker compose ps
docker compose run --rm backup
docker compose run --rm backup /scripts/verify.sh
```

El primer comando inicializa una tabla y dos registros de ejemplo. El tercer
comando crea un archivo `.dump` dentro de `backups/`. El cuarto restaura el
ultimo backup en una base temporal, comprueba que se puede consultar y elimina
esa base temporal al terminar.

Los valores se pueden personalizar copiando `.env.example` a `.env`:

```powershell
Copy-Item .env.example .env
```

## Automatizacion diaria

El intervalo predeterminado es `86400` segundos (24 horas). El contenedor hace
un backup al iniciar y luego repite la operacion en cada intervalo:

```powershell
docker compose --profile automation up -d scheduler
docker compose logs -f scheduler
```

Para observar una prueba rapida, establecer temporalmente
`BACKUP_INTERVAL_SECONDS=60` en `.env` y recrear el servicio:

```powershell
docker compose --profile automation up -d --force-recreate scheduler
```

Después de la prueba, conviene volver a `86400`. Los backups con mas de
`BACKUP_RETENTION_DAYS` dias se eliminan automaticamente; el valor inicial es 7.

## Restauracion conservada para inspeccion

Este comando restaura el ultimo backup en una base nueva llamada
`unidad_educativa_restaurada`:

```powershell
docker compose run --rm backup /scripts/restore.sh
docker compose exec postgres psql -U unidad_admin -d unidad_educativa_restaurada -c "TABLE estudiantes_demo;"
```

La restauracion se detiene sin modificar nada si esa base ya existe, y nunca
permite usar el mismo nombre de la base de origen. Se puede elegir otro nombre:

```powershell
docker compose run --rm -e RESTORE_DATABASE=otra_restauracion backup /scripts/restore.sh
```

## Detener el entorno

```powershell
docker compose --profile automation down
```

Este comando conserva tanto los archivos de `backups/` como el volumen de datos
de PostgreSQL.

## Archivos principales

- `compose.yaml`: define PostgreSQL y los servicios de backup.
- `scripts/backup.sh`: crea y valida cada `.dump`.
- `scripts/verify.sh`: prueba el backup en una base temporal.
- `scripts/restore.sh`: restaura en una base nueva y conservada.
- `scripts/scheduler.sh`: ejecuta el backup en el intervalo configurado.
- `initdb/001_datos_demo.sql`: datos mínimos usados por la prueba.

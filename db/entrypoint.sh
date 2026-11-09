#!/bin/bash
# Entrypoint adaptado de la imagen CloudNativePG para docker-compose dev.
set -euo pipefail

PGDATA=${PGDATA:-/var/lib/postgresql/data/pgdata}
PG_USER=${POSTGRES_USER:-ucilink}
PG_DB=${POSTGRES_DB:-ucilink}
PG_PASS=${POSTGRES_PASSWORD:-ucilink_secret}

# En CNPG el proceso corre como usuario 26 (postgres de Debian).
if [ "$(id -u)" = "0" ]; then
  exec gosu postgres "$0" "$@" 2>/dev/null || exec setpriv --reuid=postgres --regid=postgres --init-groups "$0" "$@"
fi

# En CNPG (Debian) los binarios viven en /usr/lib/postgresql/<v>/bin.
POSTGRES_BIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)
if [ -z "$POSTGRES_BIN" ] || [ ! -x "$POSTGRES_BIN/initdb" ]; then
  echo "[ucilink-db] no encontré binarios postgres en la imagen"; exit 1
fi
export PATH="${POSTGRES_BIN}:${PATH}"

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  echo "[ucilink-db] initdb en $PGDATA..."
  mkdir -p "$PGDATA"
  initdb -D "$PGDATA" --username=postgres --encoding=UTF8 --locale=C --auth=trust
  echo "listen_addresses = '*'" >> "$PGDATA/postgresql.conf"
  echo "unix_socket_directories = '/var/run/postgresql'" >> "$PGDATA/postgresql.conf"
fi

echo "[ucilink-db] iniciando postgres..."
postgres -D "$PGDATA" -c listen_addresses='*' &
PID_POSTGRES=$!

# Esperar el socket para la bootstrap.
export PGHOST=/var/run/postgresql PGUSER=postgres PGPORT=5432
attempts=30
until pg_isready -q; do
  attempts=$((attempts-1)); [ "$attempts" -le 0 ] && { echo "[ucilink-db] postgres no respondió"; exit 1; }
  sleep 1;
done

if ! psql -tA -c "SELECT 1 FROM pg_roles WHERE rolname='${PG_USER}'" | grep -q 1; then
  echo "[ucilink-db] creando rol y base ${PG_DB}/${PG_USER}..."
  psql -v ON_ERROR_STOP=1 -c "CREATE ROLE ${PG_USER} LOGIN SUPERUSER PASSWORD '${PG_PASS}'"
  psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${PG_DB} OWNER ${PG_USER}"
fi

# Esquema base SOLO la primera vez (idempotente: si ya hay tablas, no repite).
if ! psql -d "${PG_DB}" -tA -c "SELECT 1 FROM information_schema.tables WHERE table_name='usuario' LIMIT 1" | grep -q 1; then
  echo "[ucilink-db] aplicando esquema.sql..."
  psql -v ON_ERROR_STOP=1 -d "${PG_DB}" -f /usr/local/share/postgresql/esquema.sql
fi

# Cerrar el proceso en background y esperar a que el comando principal corra
# pg_ctl-style: pasar por delante de postgres definitivamente.
kill $PID_POSTGRES 2>/dev/null || true
wait $PID_POSTGRES 2>/dev/null || true

echo "[ucilink-db] postgres en primer plano (${PG_DB})"
exec postgres -D "$PGDATA" -c listen_addresses='*'

# Imagen db propia sobre la de CloudNativePG (YA descargada de ghcr.io).
# Motivo: esa imagen no trae el flujo docker-entrypoint-initdb.d; este entrypoint:
#   1) si el volumen está vacío → initdb (trust local, encoding UTF8)
#   2) sube postgres escuchando en *
#   3) primer arranque: Apply esquema.sql (usuario, aspirante, ...) y crea el usuario postgrest
# Los cambios ESQUEMATICOS siguientes SOLO por migraciones up()/down().
FROM ghcr.io/cloudnative-pg/postgresql:16

COPY entrypoint.sh /usr/local/bin/ucilink-entrypoint.sh
COPY init/esquema.sql /usr/local/share/postgresql/esquema.sql
RUN chmod +x /usr/local/bin/ucilink-entrypoint.sh

ENV PGDATA=/var/lib/postgresql/data/pgdata
EXPOSE 5432

ENTRYPOINT ["/usr/local/bin/ucilink-entrypoint.sh"]

# ---- deps: npm instalado DENTRO de la imagen (host no descarga nada).
# Base: devcontainers/javascript-node:22 — alcanzable via mcr.microsoft.com
# (Docker Hub bloqueado desde esta red; node:22-alpine no está disponible).
FROM mcr.microsoft.com/devcontainers/javascript-node:22 AS deps
USER root
WORKDIR /app
COPY package.json ./
# Sin lockfile en el primer boot: resolvemos dentro de la imagen.
RUN npm install --no-audit --no-fund

# ---- build: compilar TypeScript (+ migraciones a dist/).
FROM mcr.microsoft.com/devcontainers/javascript-node:22 AS build
USER root
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime: misma base con solo node_modules + dist.
FROM mcr.microsoft.com/devcontainers/javascript-node:22 AS runtime
USER root
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/src/server.js"]

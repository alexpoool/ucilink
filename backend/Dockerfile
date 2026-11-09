# ---- deps: Downing es siempre una fase separada
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
# Sin lockfile en el primer boot: resolver dentro de la imagen (host no descarga nada)
RUN npm install --no-audit --no-fund

# ---- build: compilar TypeScript
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime: imágen final mínima
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
EXPOSE 4000
# Migraciones corren con tsx instalado en la imagen, o pasan dist/migrations ya compilado.
# dist/migrations/runner.js (compilado), se ejecuta vía CMD del docker-compose.
CMD ["node", "dist/src/server.js"]

# media — técnico

Estado: **implementado** (backend/src/features/media).

## Responsabilidad
Subida de archivos del producto: **CV en PDF** (aspirante) y **logo de empresa**.
Persistencia en **VOLUMEN Docker** (`uploads:/data/uploads`) — los archivos
sobreviven recrear del contenedor. Servido público vía `/media/<nombre>`.

## ¿Por qué es un feature y no "infra interna"?
Solo va a crecer (imágenes de ofertas, portafolio). Cumple el molde AGENT:
 domain (puerto) / application (use-case) / infrastructure (impl + controller).

## Flujo del producto (importante para el resto de features)
1. El cliente (webapp) hace `POST /api/media` (multipart, campo `archivo`).
2. Recibe `{ url: '/media/<uuid>-<hash>.<ext>, bytes, tipo }`.
3. Esa URL se guarda en `curriculum.cv_pdf_url` o `empresa.logo_url` (VARCHAR ya existente).
4. **No hay cambio de esquema** → no requiere migración.

## Capas
| Capa | Archivos |
|---|---|
| domain | archivo.port.ts (`Almacenamiento`, whitelist de mimes) · archivo-invalido.exception.ts |
| application | use-cases/subir-archivo.use-case.ts (valida mime + tamaño con `maxBytes` inyectado) |
| infrastructure | repositories/local-storage.almacenamiento.impl.ts (fs + UUID + hash, extensión POR MIME) · controllers/media.controller.ts (multer memory→buffer) · routes/media.routes.ts (multer + requireAuth) · media.module.ts |

## Seguridad
- `requireAuth` en la subida (anónimos no suben nada).
- Whitelist: pdf/png/jpeg/webp/avif. Máx: `UPLOAD_MAX_BYTES` (10MB por defecto).
- Nombres generados por el server (uuid + hash del contenido); la extensión se decide
  por MIME validado, nunca por el nombre del cliente (anti path-traversal/spoofing).
- Servido con `express.static` en app.ts (GET público; los nombres son indescifrables).

## Config de volumen
`docker-compose.yml`: `volumes: uploads:/data/uploads` + `UPLOADS_DIR=/data/uploads`.
En dev sin Docker (`UPLOADS_DIR` default) usa `./uploads` (gitignored).

## Dependencia nueva (justificada)
`multer` (+`@types/multer`): parser estándar de multipart en Express. Se resuelve
DENTRO de la imagen (regla del repo: nada de descargas en el host).

## Endpoints
POST /api/media (rol autenticado, cualquier rol).

## Tests gemelos
tests/features/media/application/use-cases/subir-archivo.use-case.test.ts
tests/features/media/infrastructure/repositories/local-storage.almacenamiento.impl.test.ts (FS real en tmpdir)

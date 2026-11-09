# API — catálogo de endpoints

Base: `http://localhost:4000` (webapi Docker). Autenticación: header
`Authorization: Bearer <JWT>` obtenido de `POST /api/auth/registro` o `POST /api/auth/login`.

Convención de respuesta de error: `{ "message": string, "errores"?: [{campo, detalle}] }`.

Los 11 features están implementados (ver app.ts para el montaje exacto).

## auth (público)
| Método y ruta | Rol | Descripción |
|---|---|---|
| POST /api/auth/registro | — | Crea cuenta (rol: aspirante\|empresa). Devuelve JWT + usuario |
| POST /api/auth/login | — | Devuelve JWT + usuario |

## aspirante (aspirante)
| Método y ruta | Rol | Descripción |
|---|---|---|
| POST /api/aspirante/perfil | aspirante | Crea su perfil (409 si ya existe) |
| GET /api/aspirante/perfil | aspirante | Su propio perfil |
| PUT /api/aspirante/perfil | aspirante | Actualiza su perfil |

## empresa (empresa)
POST/GET/PUT /api/empresa/perfil · GET /api/empresa/metricas (dashboard propio
con COUNT FILTER: ofertas activas, postulaciones recibidas, etc.)

## media (cualquier rol autenticado)
POST /api/media (multipart: CV PDF o logo; whitelist de tipos, máximo
UPLOAD_MAX_BYTES). Los archivos se sirven con `/media/<uuid>-<hash>.<ext>`
desde el VOLUMEN Docker.

## curriculum
POST/GET /api/aspirante/curriculos (propios) · PUT /api/curriculos/:id ·
GET /api/curriculos/:id (público salvo `visible=false`).

## oferta (público + autor)
POST/GET /api/ofertas (feed público SOLO `publicada`, filtros + paginación) ·
GET /api/ofertas/:id (detalle público; BORRADOR y CANCELADA solo a su autor) ·
POST/GET /api/empresa/ofertas (normal\|dash; autor empresa) ·
POST/GET /api/aspirante/ofertas-feat (autor aspirante) ·
PATCH /api/ofertas/:id (solo su autor) · PATCH /api/empresa/ofertas/:id/estado ·
PATCH /api/aspirante/ofertas/:id/estado (VO máquina de estados).

## evaluacion
POST /api/ofertas/:id/postulaciones (aspirante; crea la notificación cv_recibido
EN EL MISMO use-case vía el puerto compartido) ·
GET /api/aspirante/postulaciones · GET /api/empresa/ofertas/:id/postulaciones ·
PATCH /api/empresa/ofertas/:id/evaluaciones/:evalId (transición según VO del
pipeline; comentario/puntuación solo al cerrar con fichado\|rechazado) ·
PATCH /api/aspirante/postulaciones/:evalId/retirar.

## grupo (aspirante)
POST /api/aspirante/grupos (crear; líder = token) ·
GET /api/aspirante/grupos (liderados + míos, dedup) ·
POST /api/aspirante/grupos/:id/miembros (invitar; notifica invitacion_grupo) ·
PATCH /api/aspirante/grupos/:id/invitacion (aceptar\|rechazar; al completar
cupos el grupo pasa a completo) · PATCH /api/aspirante/grupos/:id/salir ·
PATCH /api/aspirante/grupos/:id/cerrar ·
POST /api/aspirante/grupos/:id/postulaciones (ofertaId en body; una fila de
evaluación por miembro con su CV, 422 si falta un CV).

## valoracion (toggle: 1ª inserta · igual quita · distinta reemplaza)
POST /api/ofertas/:id/valoraciones (aspirante; no valora su propia oferta feat) ·
POST /api/empresa/valoraciones/curriculos/:id (empresa) ·
POST /api/aspirante/valoraciones/curriculos/:id (aspirante; no su propio CV).
Respuesta: { likes, dislikes, miReaccion: like|dislike|ninguno }.

## notificacion (cualquier rol autenticado)
GET /api/notificaciones (con noLeidas; ?solo_no_leidas=true) ·
PATCH /api/notificaciones/leer-todas · PATCH /api/notificaciones/:id/leida.

## admin (rol admin)
GET /api/admin/metricas (usuarios por rol, ofertas por estado, postulaciones,
grupos, curriculos) · GET /api/admin/empresas/pendientes ·
PATCH /api/admin/empresas/:id/verificar (body verificada) ·
GET /api/admin/ofertas?estado=· PATCH /api/admin/ofertas/:id/cancelar.

## Códigos HTTP estándar
400 (zod) · 401 (sin token / inválido) · 403 (rol incorrecto / no autor) ·
404 (no encontrado, no revela existencia ajena) · 409 (duplicado) ·
422 (transición/acción inválida según los VOs) · 500 (no controlado).

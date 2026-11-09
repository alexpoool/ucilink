# API — catálogo de endpoints

Base: `http://localhost:4000` (webapi Docker). Autenticación: header
`Authorization: Bearer <JWT>` obtenido de `POST /api/auth/login` o `POST /api/auth/registro`.

Convención de respuesta de error: `{ "message": string, "errores"?: [{campo, detalle}] }`.

## auth (público)
| Método y ruta | Rol | Descripción |
|---|---|---|
| POST /api/auth/registro | — | Crea cuenta (rol: aspirante\|empresa). Devuelve JWT + usuario |
| POST /api/auth/login | — | Devuelve JWT + usuario |

## aspirante (aspirante)
| POST /api/aspirante/perfil | aspirante | Crea su perfil (409 si ya existe) |
| GET /api/aspirante/perfil | aspirante | Su propio perfil |
| PUT /api/aspirante/perfil | aspirante | Actualiza su perfil |

## empresa (empresa) — diseño comprometido
POST/GET/PUT /api/empresa/perfil · GET /api/empresa/metricas

## curriculum — diseño comprometido
POST/GET /api/aspirante/curriculos (propios) · PUT /api/curriculos/:id ·
GET /api/curriculos/:id (público, SEO)

## oferta — diseño comprometido
POST/GET /api/ofertas (feed público con filtros) · GET /api/ofertas/:id (público) ·
POST/GET /api/empresa/ofertas (normal\|dash) · POST/GET /api/aspirante/ofertas-feat ·
PATCH /api/ofertas/:id/estado

## evaluacion — diseño comprometido
POST /api/ofertas/:id/postulaciones (aspirante o grupo) ·
GET /api/aspirante/postulaciones · GET /api/empresa/ofertas/:id/postulaciones ·
PATCH /api/empresa/evaluaciones/:id (transición de estado)

## grupo — diseño comprometido
POST/GET /api/grupos · GET /api/grupos/:id ·
POST/PATCH /api/grupos/:id/miembros (invitar / responder invitación) ·
POST /api/grupos/:id/postular (aplica en equipo)

## valoracion — diseño comprometido
POST /api/ofertas/:id/valoraciones (aspirante, like\|dislike toggle) ·
POST /api/empresa/valoraciones/curriculos/:id (empresa) ·
POST /api/aspirante/valoraciones/curriculos/:id (aspirante)

## notificacion — diseño comprometido
GET /api/notificaciones (polling frontend 30s) · PATCH /api/notificaciones/:id/leida ·
POST /api/notificaciones/leer-todas

## admin (admin)
POST /api/admin/empresas/:id/verificar · GET /api/admin/empresas/pendientes ·
PATCH /api/admin/ofertas/:id (moderar estado) · PATCH /api/admin/usuarios/:id/activo

## Códigos HTTP estándar
400 (zod) · 401 (sin token / inválido) · 403 (rol incorrecto / suspendido) ·
404 (no encontrado) · 409 (conflicto: email/el perfil ya existe) · 500 (no controlado).

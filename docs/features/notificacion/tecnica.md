# notificacion — técnico

Estado: **implementado** (backend/src/features/notificacion).

## Tabla (nueva — via migración, NO esquema.sql)
`notificacion` (migrations/20261109...create_notificacion_table.ts): id, usuario_id→usuario,
tipo enum (cv_recibido|invitacion_grupo|valoracion|respuesta|sistema), referencia_id UUID nullable,
leida, created_at. Índice (usuario_id, leida, created_at DESC) para el polling barato.

## Implementado
- domain: notificacion.entity.ts · tipo-notificacion.vo.ts · notificacion.repository.ts · notificacion-no-encontrada.exception.ts
- application: listar-notificaciones (filtro solo_no_leidas + contador de no leídas) · marcar-leida (marcar UNA con guard de propiedad en el SQL del impl; fallback 404) + MarcarTodasLeidas en el mismo archivo separadas por clase · notificacion.mapper.ts
- infrastructure: notificacion.repository.impl.ts (NotificacionRepository; WHERE usuario_id = en marcarLeida) · creador-notificaciones.impl.ts (IMPL DEL PUERTO compartido — la interfaz vive en shared/ por regla, la impl aquí) · controller (usuario_id SIEMPRE del token) · routes (GET /api/notificaciones, PATCH /leer-todas, PATCH /:id/leida) · notificacion.module.ts
- La creación de notificaciones la disparan los UCs de evaluacion (cv_recibido) y grupo
  (invitacion_grupo) A TRAVÉS del puerto; app.ts construye CreadorNotificacionesImpl y la inyecta.

# notificacion — técnico

Estado: **diseño comprometido** (la migración DEL schema ya está en migrations/ — solo la tabla; la API va en curso).

## Responsabilidad
Avisos simples por evento. MVP de producto para reducir complejidad: SIN websockets —
el frontend politica con TanStack Query (refetchInterval 30s).

## Tabla (nueva — via migración, NO esquema.sql)
`notificacion` (migrations/20261109...create_notificacion_table.ts): id, usuario_id→usuario,
tipo enum (cv_recibido|valoracion|respuesta|invitacion|sistema), referencia_id UUID nullable,
leida, created_at. Índice (usuario_id, leida, created_at DESC) para el polling barato.

## Dónde se crean (regla del producto)
- El use-case de `evaluacion` **postular-oferta** crea la fila `cv_recibido` en el MISMO
  use-case (copia el insert de la evaluación) — vía el puerto compartido
  `shared/domain/creador-notificaciones.port.ts` (interfaz) cuya implementación vive AQUÍ
  (`notificacion.repository.impl.ts` implementa CreadorNotificaciones + NotificacionRepository).

## Capas previstas
- domain: notificacion.entity.ts · tipo-notificacion.vo.ts · notificacion.repository.ts
- application: listar-notificaciones (paginadas + filtro no-leidas) · marcar-notificacion-leida · marcar-todas-leidas · dtos + notificacion.mapper.ts
- infrastructure: notificacion.repository.impl.ts (implements NotificacionRepository & CreadorNotificaciones) · controller · routes /api/notificaciones (requireAuth; usuario del token) · notificacion.module.ts

## Endpoints (autenticado, cualquier rol)
GET /api/notificaciones · PATCH /api/notificaciones/:id/leida · POST /api/notificaciones/leer-todas.

## Tests gemelos previstos
use-cases ×3 · impl (incl. round-trip del puerto compartido).

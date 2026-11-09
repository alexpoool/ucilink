# empresa — técnico

Estado: **implementado** (backend/src/features/empresa).

## Responsabilidad
Perfil de empresa + métricas de su dashboard (ofertas por estado, CVs recibidos, valoraciones).

## Tablas
`empresa` (esquema.sql): id, usuario_id UNIQUE→usuario, nombre, razon_social, ruc UNIQUE, sector,
descripcion, sitio_web, logo_url, ciudad, verificada.

## Capas previstas
- domain: empresa.entity.ts · empresa.repository.ts · empresa-no-encontrado.exception.ts · empresa-no-verificada.exception.ts
- application: dtos empresa (crear/actualizar) · use-cases: crear-perfil-empresa / obtener-perfil-empresa / actualizar-perfil-empresa / obtener-metricas-empresa · empresa.mapper.ts
- infrastructure: empresa.repository.impl.ts · controller · routes (/api/empresa/perfil, /api/empresa/metricas) · empresa.module.ts

## Reglas
- Perfil único por usuario; `verificada` SOLO la cambia el feature `admin`.
- Métricas calculadas en el repositorio (COUNT agrupados), no en controller.
- DTO de respuesta expone `verificada` para que el frontend muestre el badge.

## Endpoints (rol empresa)
POST /api/empresa/perfil · GET /api/empresa/perfil · PUT /api/empresa/perfil · GET /api/empresa/metricas.

## Tests gemelos previstos
use-cases ×4 · empresa.repository.impl.test.ts.

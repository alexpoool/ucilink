# curriculum — técnico

Estado: **diseño comprometido** (implementación en curso).

## Responsabilidad
CVs del aspirante. Varias versiones por aspirante; una es principal y visible.

## Tablas
`curriculum` (esquema.sql): id, aspirante_id→aspirante, titulo, resumen, educacion JSONB,
experiencia JSONB, proyectos JSONB, habilidades TEXT[], idiomas JSONB, cv_pdf_url,
es_principal, visible.

## Capas previstas
- domain: curriculum.entity.ts (sub-tipos JSONB anidados: EducacionItem, ExperienciaItem, ProyectoItem, IdiomaItem) · curriculum.repository.ts · curriculum-no-encontrado.exception.ts
- application: dtos cread. /actualizar (zod valida la forma de los arrays JSONB) · use-cases: crear-curriculum / listar-mis-curriculos / obtener-curriculum-publico / actualizar-curriculum / marcar-curriculum-principal · curriculum.mapper.ts
- infrastructure: curriculum.repository.impl.ts (JSONB stringify/parse) · controller · routes: /api/aspirante/curriculos (propios, aspirante) + GET /api/curriculos/:id (público — alimenta páginas SEO /cvs/:id) · curriculum.module.ts

## Reglas
- `es_principal=true` es exclusivo: al marcar se desmarca el anterior (transacción).
- El CV público REQUIERE visible=true; 404 si no (o si el propietario lo concluso).
- El PDF (cv_pdf_url) nunca se genera en backend: espera URL ya subida por el frontend.

## Endpoints
aspirante: POST|GET /api/aspirante/curriculos, PUT /api/curriculos/:id, PATCH /api/curriculos/:id/principal.
público: GET /api/curriculos/:id (solo visible=true).

## Tests gemelos previstos
use-cases ×5 · curriculum.repository.impl.test.ts (JSONB round-trip).

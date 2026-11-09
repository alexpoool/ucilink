# oferta — técnico

Estado: **implementado** (backend/src/features/oferta).

## Responsabilidad
Tabla ÚNICA `oferta` para ambos autores (espeja el CHECK de esquema.sql):
- empresa → tipo_oferta normal | dash
- aspirante → tipo_oferta feat

## Tablas y enums
`oferta`: autor_tipo, autor_id, tipo_oferta, titulo, descripcion, requisitos, habilidades_req,
modalidad, ubicacion, salario_min/max, tipo_contrato, objetivo, grupo_id (FK grupo), fecha_limite,
cupos, estado (borrador|publicada|cerrada|cancelada).
VOs de dominio: tipo-oferta.vo.ts · estado-oferta.vo.ts (máquina de estados: solo transiciones válidas).

## Capas previstas
- domain: oferta.entity.ts · tipo-oferta.vo.ts · estado-oferta.vo.ts · oferta.repository.ts · oferta-no-encontrada · autor-tipo-incoherente exceptions
- application: dtos (crear: valida coherencia autor_tipo/tipo_oferta y cupos≥grupo_id si dash; listar con filtros tipados) · use-cases: crear-oferta / actualizar-oferta / cambiar-estado-oferta / listar-ofertas-feed / obtener-oferta / listar-mis-ofertas · oferta.mapper.ts
- infrastructure: oferta.repository.impl.ts (JOIN con empresa/aspirante para enriquecer el DTO público: nombre autor, verificada, contadores de valoraciones) · controllers · routes · oferta.module.ts

## Reglas
- duplicar /并肩 el CHECK de DB en zod+VO (falla antes que la DB; la DB Quedar button cinturón).
- permitir dash requiere grupo_id borrado (puedes verlas / sin grupo → normal).
- El feed público solo retorna estado='publicada'.
- cambiar-estado: solo el autor (o admin) y solo transiciones válidas del VO.

## Endpoints
GET /api/ofertas (pblico, filtros) · GET /api/ofertas/:id (público — pagina /ofertas/:id SEO+JSON-LD JobPosting) ·
POST|GET /api/empresa/ofertas · POST|GET /api/aspirante/ofertas-feat · PATCH /api/ofertas/:id/estado.

## Tests gemelos previstos
VOs de estado/tipo · use-cases ×6 · oferta.repository.impl.test.ts (traducciones de filtros).

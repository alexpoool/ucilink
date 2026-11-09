# evaluacion — técnico

Estado: **diseño comprometido** (implementación en curso).

## Responsabilidad
Pipeline de postulaciones: aspira/grupo aplican; empresa evalúa el CV con estados.

## Tabla
`evaluacion_curriculum` (esquema.sql): id, oferta_id→oferta, curriculum_id→curriculum,
aspirante_id→aspirante, grupo_id (nullable), estado
(postulado→en_revision→preseleccionado→fichado|rechazado|retirado), comentario_empresa,
puntuacion (1-5), fecha_postulacion/evaluacion, evaluado_por_empresa. UNIQUE (oferta_id, curriculum_id).

## VO de estados
`estado-evaluacion.vo.ts` valida el transiciones (máquina): cantTransitarA(origen) → array destino.

## Capas previstas
- domain: evaluacion.entity.ts · estado-evaluacion.vo.ts · evaluacion.repository.ts · postulacion-duplicada.exception.ts · transicion-invalida.exception.ts
- application: dtos postular / evaluar · use-cases:
  - postular-oferta (aspirante; crea evaluación + **NOTIFICACIÓN a la empresa** vía el puerto compartido `CreadorNotificaciones` — en el MISMO use-case, versión de MVP)
  - listar-postulaciones-de-oferta (empresa)
  - listar-postulaciones-propias (aspirante)
  - evaluar-postulacion (empresa; valida transición con el VO; fija comentario/puntuación)
  - retirar-postulacion (aspirante; estado retirado)
- infrastructure: evaluacion.repository.impl.ts · controller · routes /api/ofertas/:id/postulaciones, /api/aspirante/postulaciones, /api/empresa/.../evaluaciones · evaluacion.module.ts

## Reglas
- Duplicado (misma oferta+CV) → 409 (UNIQUE DB + ya-validado en el use-case).
- Las transiciones con origen→destino inválidas → 422 TransicionInvalida (prohibidas las saltas).
- Solo cierre (fichado/rechazado) permite comentario/puntuación (en el use-case, no en controller).

## Tests gemelos previstos
VO máquina de estados · use-cases ×5 (incl. verificación de que postular llama a la notificación) · eval impl.

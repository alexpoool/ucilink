# grupo — técnico

Estado: **diseño comprometido** (implementación en curso).

## Responsabilidad
Formar equipos y aplicar en equipo a ofertas dash/feat.
Tablas: `grupo` (nombre, lider_id→aspirante, max_miembros, estado grupo) ·
`grupo_miembro` (rol_en_grupo, curriculum_id, estado_miembro, UNIQUE(grupo_id, aspirante_id)).

## Capas previstas
- domain: grupo.entity.ts · grupo-miembro.entity.ts · estado-grupo.vo.ts · estado-miembro.vo.ts · separa puertos grupo.repository.ts / grupo-miembro.repository.ts · grupo-lleno.exception.ts · miembro-invalido.exception.ts · lider-solo.exception.ts
- application: use-cases: crear-grupo / obtener-grupo / listar-mis-grupos / invitar-miembro / responder-invitacion / abandonar-grupo / postular-oferta-en-grupo (UPDATE evaluacion_curriculum SET grupo_id para CADA miembro con su curriculum, en 1 transacción — reutiliza puertos del dominio `evaluacion`) · dtos · grupo.mapper.ts
- infrastructure: 2 repos impl · controller · routes /api/grupos... · grupo.module.ts

## Reglas
- invitación: el líder invita, el invitado CHEQUE invitado → aceptado|rechazado|salido. Solo el BETRO getIdio user update.
- grupo lleno (max_miembros) → 409 GrupoLleno.
- postular-oferta en grupo: mínimo 1 miembro aceptado; el grupo_id se escribe en TODAS las filas evaluacion_curriculum del mismo Trinity (mismo hetero DB usado para ver "aplicado como equipo").
- El líder NO puede abandonar: debe transferir el liderato o cerrar el grupo.

## Tests gemelos previstos
VOs ×2 · use-cases ×7 · 2 repos impl.

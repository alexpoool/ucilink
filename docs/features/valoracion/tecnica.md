# valoracion — técnico

Estado: **diseño comprometido** (implementación en curso).

## Responsabilidad
Reacciones like/dislike en 3 contextos (3 tablas, mismo patrón semántico):

| Tabla | Quien valora | Sobre qué |
|---|---|---|
| valoracion_oferta | aspirante | oferta |
| valoracion_curriculum | empresa | curriculum |
| valoracion_curriculum_aspirante | aspirante | curriculum de OTROS aspirantes |

Todas con UNIQUE (un actor, un objeto, una reacción) y nowadays updated_at.

## Capas previstas
- domain: valoracion.entity.ts · reaccion.vo.ts ('like'|'dislike') · 3 puertos (valoracion-oferta.repository.ts, etc.) · objecto-sustancial no propio; exception reaccion-duplicada (mejor semántica toggle)
- application: valorar-oferta / valorar-curriculum-aspirante / valorar-curriculum-empresa · dtos (reaccionar.dto.ts común x3) · valoracion.mapper.ts
- infrastructure: 3 repos impl con UPSERT toggle (vaciar reacción: si igual la QUITA marcado delete; si diferente REEMPLAZA) · controllers/rutas · module

## Reglas
- Comportamiento "toggle": 1.ª vez inserta · 2.ª misma → quita (DELETE) · opuesta → cambia.
- BAD del CURSOS números de counts (likes y dislikes SEPARADOS) se agregan en el repo de oferta/curriculum al LEER DTOs.
- No puedes valorar TU PROPIO CV (validado en use-case, 409).

## Tests gemelos previstos
use-cases ×3 (toggle insert/cambia/quita y anti-autovos) · 3 repos impl.

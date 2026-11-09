# aspirante — técnico

Estado: **implementado** (backend/src/features/aspirante).

## Responsabilidad
Perfil profesional del aspirante (datos de contacto/carrera). El CV con medidas JSONB
educación/experiencia/proyectos queda en el feature `curriculum`; aquí solo el perfil base.

## Tablas
`aspirante` (esquema.sql): id, usuario_id UNIQUE→usuario, nombre, apellido, telefono, carrera,
semestre, bio, habilidades TEXT[], linkedin_url, github_url, portafolio_url.

## Capas
| Capa | Archivos |
|---|---|
| domain | aspirante.entity.ts · aspirante.repository.ts (inputs `CrearAspiranteInput`/`ActualizarAspiranteInput` definidos EN domain para respetar dirección de deps) · aspirante-no-encontrado · perfil-ya-existe exceptions |
| application | dtos/crear-aspirante.dto.ts · dtos/actualizar-aspirante.dto.ts (zod; usuarioId inyectado por controller→token) · aspirante.mapper.ts · use-cases: crear-perfil / obtener-perfil / actualizar-perfil |
| infrastructure | repositories/aspirante.repository.impl.ts (mapeo snake_case→camelCase; UPDATE dinámico parametrizado) · controllers/aspirante.controller.ts · routes/aspirante.routes.ts (requireAuth+requireRol('aspirante')) · aspirante.module.ts |

## Reglas
- Perfil único por usuario (UNIQUE usuario_id): 2.º intento → 409 PerfilYaExisteException.
- El cliente NUNCA manda el id del perfil: use-cases resuelven por `usuarioId` del token.
- Actualización parcial: solo campos presentes (undefined = no tocar).
- El DTO de respuesta nunca expone usuarioId.

## Endpoints (prefijo /api/aspirante, rol aspirante)
POST /perfil · GET /perfil · PUT /perfil.

## Tests gemelos
tests/features/aspirante/application/use-cases/{crear-perfil-aspirante,perfiles-aspirante}.use-case.test.ts
(falta: tests/features/aspirante/infrastructure/repositories/aspirante.repository.impl.test.ts — se agrega con el commit del feature completo)

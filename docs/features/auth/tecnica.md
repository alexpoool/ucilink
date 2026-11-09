# auth — técnico

Estado: **implementado** (_backend/src/features/auth_).

## Responsabilidad
Registro de cuentas y login con JWT. Responde: ¿quién eres? No responde: quién es tu perfil
(aspirante/empresa) ni datos de negocio.

## Dependencias
- `shared/domain/http.exception.ts` (base de excepciones)
- `shared/infrastructure/services/`: `jwt.service.ts` (implementa `TokenSigner`),
  `bcrypt.service.ts` (implementa `PasswordHasher`)
- `shared/infrastructure/middlewares/auth.middleware.ts` (consume `JwtService.verificar`)

## Tablas
`usuario` (esquema.sql): id UUID, email UNIQUE, password_hash, rol (aspirante|empresa|admin), activo.

## Capas
| Capa | Archivos |
|---|---|
| domain | usuario.entity.ts · rol.vo.ts · auth.repository.ts · token.port.ts · hash.port.ts · credencial-invalida / email-ya-registrado / usuario-inactivo exceptions |
| application | dtos/login.dto.ts · dtos/registro.dto.ts (zod) · auth.mapper.ts · use-cases/login.use-case.ts · use-cases/registrar-usuario.use-case.ts |
| infrastructure | controllers/auth.controller.ts · repositories/usuario.repository.impl.ts · routes/auth.routes.ts · auth.module.ts |

## Reglas de negocio clave
- `rol: admin` NO registrable por API (regla en `rol.vo.ts` → `ROLES_REGISTRABLES` y zod enum aspirante|empresa).
- El registro crea SOLO `usuario`; el perfil lo crea el feature correspondiente
  (aspirante/crear-perfil, empresa/crear-perfil) → evita acoplamiento auth↔perfiles.
- Login no revela si falló email o contraseña (mismo 401 y mensaje).
- Suspendido (activo=false): 403 UsuarioInactivo.
- passwordHash jamás sale al DTO de respuesta (se verifica en auth.mapper).

## Endpoints
POST /api/auth/registro (201) · POST /api/auth/login (200).

## Tests gemelos
tests/features/auth/application/use-cases/login.use-case.test.ts
tests/features/auth/application/use-cases/registrar-usuario.use-case.test.ts
tests/features/auth/infrastructure/repositories/usuario.repository.impl.test.ts
tests/shared/infrastructure/services/jwt.service.test.ts

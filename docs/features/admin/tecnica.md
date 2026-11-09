# admin — técnico

Estado: **diseño comprometido** (implementación en curso).

## Responsabilidad
Supervisión global: verificar empresas, moderar ofertas, suspender/reactivar usuarios.

## NOTA DE ARQUITECTURA (decisión consciente)
El admin toca tablas de otros dominios (empresa, oferta, usuario). Para NO acoplar features
ni duplicar lógica de negocio: `admin` define su PROPIO puerto `admin.repository.ts`
(admin-domain) con las operaciones de supervisión, implementado con `pg` directo en
infrastructure. Prohibido importar repositories aplicación de otros features.

## Capas previstas
- domain: admin.repository.ts (verificarEmpresa, listarEmpresasPendientes, cambiarEstadoOferta, suspenderUsuario) · operacion-prohibida.exception.ts
- application: verificar-empresa · listar-empresas-pendientes · moderar-oferta (usa el VO estado-oferta de oferta/domain: cross-feature hacia domain permitido) · suspender-usuario · reactivar-usuario · dtos
- infrastructure: admin.repository.impl.ts · controller · routes /api/admin (requireRol('admin')) · admin.module.ts

## Reglas
- TODAS las rutas con requireRol('admin') en routes (defensa en routes + middleware, no en controller).
- Moderar-oferta: transición de estado solo vía eluming VO compartido de la plataforma (estado-oferta).
- Suspender: NO suspende admins (chequeo en use-case). Suspensiones entran por usuario de auth: activo=false; el login guarda un bloqueo ( UsuarioInactivoException).
- Acciones de admin (verificar empresa, suspender) crean notificación 'sistema' al afectado.

## Tests gemelos previstos
use-cases ×5 · impl.

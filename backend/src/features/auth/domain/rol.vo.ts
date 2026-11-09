// Value object del rol de usuario. Espeja el enum `rol_usuario` de esquema.sql.
// Los roles y su validación son lógica de dominio (no HTTP), por eso vive aquí.
export type RolUsuario = 'aspirante' | 'empresa' | 'admin';

export const ROLES_USUARIO: readonly RolUsuario[] = ['aspirante', 'empresa', 'admin'];

export function esRolValido(valor: string): valor is RolUsuario {
  return (ROLES_USUARIO as readonly string[]).includes(valor);
}

// Roles que pueden auto-registrarse (admin solo se crea por seed/migración).
export const ROLES_REGISTRABLES: readonly RolUsuario[] = ['aspirante', 'empresa'];

export function esRolRegistrable(valor: string): valor is RolUsuario {
  return (ROLES_REGISTRABLES as readonly string[]).includes(valor);
}

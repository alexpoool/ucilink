import { z } from 'zod';
import { RolUsuario } from '../../domain/rol.vo';
import { Usuario } from '../../domain/usuario.entity';

// DTO de respuesta de auth: JAMÁS expone passwordHash
// (regla 6.1 de AGENT.md: controllers responden DTOs, no entidades de dominio).
export interface AuthRespuesta {
  token: string;
  usuario: {
    id: string;
    email: string;
    rol: RolUsuario;
  };
}

export const authRespuestaSchema = z.object({
  token: z.string(),
  usuario: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    rol: z.enum(['aspirante', 'empresa', 'admin']),
  }),
});

export type AuthRespuestaDto = z.infer<typeof authRespuestaSchema>;

export function mapearAuthRespuesta(token: string, usuario: Usuario): AuthRespuesta {
  return {
    token,
    usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol },
  };
}

import { z } from 'zod';

// DTO de entrada para PUT /api/aspirante/perfil. Todos los campos opcionales:
// solo se actualizan los presentes (PATCH semant em PUT).
export const actualizarAspiranteSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  apellido: z.string().min(1).max(100).optional(),
  telefono: z.string().min(6).max(30).nullable().optional(),
  carrera: z.string().max(150).nullable().optional(),
  semestre: z.number().int().min(1).max(12).nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  habilidades: z.array(z.string().min(1).max(50)).max(30).optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  portafolioUrl: z.string().url().nullable().optional(),
});

export type ActualizarAspiranteDto = z.infer<typeof actualizarAspiranteSchema>;

export const actualizarPerfilInputSchema = actualizarAspiranteSchema.extend({
  usuarioId: z.string().uuid(),
});

export type ActualizarPerfilAspiranteInput = z.infer<typeof actualizarPerfilInputSchema>;

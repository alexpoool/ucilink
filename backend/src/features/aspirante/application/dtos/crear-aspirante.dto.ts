import { z } from 'zod';

// DTO de entrada para POST /api/aspirante/perfil.
// nombre/apellido obligatorios; el resto opcional (columnas NULL-ables).
export const crearAspiranteSchema = z.object({
  nombre: z.string().min(1).max(100),
  apellido: z.string().min(1).max(100),
  telefono: z.string().min(6).max(30).optional(),
  carrera: z.string().max(150).optional(),
  semestre: z.number().int().min(1).max(12).optional(),
  bio: z.string().max(2000).optional(),
  habilidades: z.array(z.string().min(1).max(50)).max(30).optional(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  portafolioUrl: z.string().url().optional(),
});

export type CrearAspiranteDto = z.infer<typeof crearAspiranteSchema>;

export const crearPerfilInputSchema = crearAspiranteSchema.extend({
  usuarioId: z.string().uuid(),
});

export type CrearPerfilAspiranteInput = z.infer<typeof crearPerfilInputSchema>;

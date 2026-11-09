import { z } from 'zod';

// Cuerpo único de las 3 rutas de valoración.
export const valorarSchema = z.object({
  reaccion: z.enum(['like', 'dislike']),
});

export type ValorarDto = z.infer<typeof valorarSchema>;

// Entrada de use-cases. actorId = ID DEL PERFIL resuelto por el controller
// (aspirante.id o empresa.id según la tabla objetivo) — NUNCA usuario_id.
export const valorarOfertaInputSchema = z.object({
  actorId: z.string().uuid(),
  ofertaId: z.string().uuid(),
  reaccion: z.enum(['like', 'dislike']),
});

export type ValorarOfertaInput = z.infer<typeof valorarOfertaInputSchema>;

export const valorarCurriculumInputSchema = z.object({
  actorId: z.string().uuid(),
  curriculumId: z.string().uuid(),
  reaccion: z.enum(['like', 'dislike']),
});

export type ValorarCurriculumInput = z.infer<typeof valorarCurriculumInputSchema>;

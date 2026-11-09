import { z } from 'zod';

// POST postulación: la identidad se resuelve del token; el CV llega por body.
export const postularSchema = z.object({
  usuarioId: z.string().uuid(), // inyectado por controller
  curriculumId: z.string().uuid(),
  grupoId: z.string().uuid().nullable().optional(), // postulación grupal (feature grupo)
  ofertaId: z.string().uuid(), // inyectado por controller desde params
});

export type PostularInput = z.infer<typeof postularSchema>;

// PATCH evaluar: empresa cambia estado (+opcional comentario/puntuación al cerrar).
export const evaluarSchema = z.object({
  ofertaId: z.string().uuid(), // from params: garantiza que la evaluación pertenece a la oferta
  evaluacionId: z.string().uuid(), // from params
  empresaId: z.string().uuid(), // inyectado por controller del token (rol empresa)
  estado: z.enum(['en_revision', 'preseleccionado', 'fichado', 'rechazado']),
  comentarioEmpresa: z.string().max(2000).nullable().optional(), // al cerrar
  puntuacion: z.number().int().min(1).max(5).nullable().optional(), // al cerrar
});

export type EvaluarInput = z.infer<typeof evaluarSchema>;

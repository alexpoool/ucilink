import { z } from 'zod';

// PATCH de estado de una oferta (autor o admin).
export const cambiarEstadoOfertaInputSchema = z.object({
  ofertaId: z.string().uuid(),
  usuarioId: z.string().uuid().optional(), // presente si lo opera el autor
  esAdmin: z.boolean().default(false),
  estado: z.enum(['borrador', 'publicada', 'cerrada', 'cancelada']),
});

export type CambiarEstadoOfertaInput = z.infer<typeof cambiarEstadoOfertaInputSchema>;

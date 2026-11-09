import { z } from 'zod';

// Filtros del feed público (GET /api/ofertas) — todos alineados al repo.
export const listarOfertasSchema = z.object({
  tipoOferta: z.enum(['normal', 'dash', 'feat']).optional(),
  autorTipo: z.enum(['aspirante', 'empresa']).optional(),
  modalidad: z.string().max(50).optional(),
  ubicacion: z.string().max(150).optional(),
  habilidades: z.array(z.string().min(1).max(50)).max(10).optional(),
  salarioMin: z.number().nonnegative().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListarOfertasDto = z.infer<typeof listarOfertasSchema>;

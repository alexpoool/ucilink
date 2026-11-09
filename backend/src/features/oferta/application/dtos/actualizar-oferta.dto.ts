import { z } from 'zod';

// PUT de una oferta: actualización parcial, SOLO el autor.
export const actualizarOfertaBodySchema = z
  .object({
    titulo: z.string().min(1).max(150).optional(),
    descripcion: z.string().min(1).max(8000).optional(),
    requisitos: z.string().max(4000).nullable().optional(),
    habilidadesReq: z.array(z.string().min(1).max(50)).max(40).optional(),
    modalidad: z.string().max(50).nullable().optional(),
    ubicacion: z.string().max(150).nullable().optional(),
    salarioMin: z.number().nonnegative().nullable().optional(),
    salarioMax: z.number().nonnegative().nullable().optional(),
    tipoContrato: z.string().max(50).nullable().optional(),
    objetivo: z.string().max(200).nullable().optional(),
    fechaLimite: z.string().datetime().nullable().optional(),
    cupos: z.number().int().min(1).max(20).optional(),
  })
  .refine(
    (data) => !(data.salarioMin != null && data.salarioMax != null && data.salarioMin > data.salarioMax),
    { message: 'salarioMin no puede superar salarioMax', path: ['salarioMin'] },
  );

export type ActualizarOfertaBodyDto = z.infer<typeof actualizarOfertaBodySchema>;

export const actualizarOfertaInputSchema = actualizarOfertaBodySchema.extend({
  usuarioId: z.string().uuid(),
  ofertaId: z.string().uuid(),
});

export type ActualizarOfertaUcInput = z.infer<typeof actualizarOfertaInputSchema>;

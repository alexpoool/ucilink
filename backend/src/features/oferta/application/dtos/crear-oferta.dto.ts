import { z } from 'zod';

// Cuerpo de POST de oferta (rol/usuarioId llegan del TOKEN, no del body).
export const crearOfertaBodySchema = z
  .object({
    tipoOferta: z.enum(['normal', 'dash', 'feat']),
    titulo: z.string().min(1).max(150),
    descripcion: z.string().min(1).max(8000),
    requisitos: z.string().max(4000).nullable().optional(),
    habilidadesReq: z.array(z.string().min(1).max(50)).max(40).optional(),
    modalidad: z.string().max(50).optional(),
    ubicacion: z.string().max(150).optional(),
    salarioMin: z.number().nonnegative().optional(),
    salarioMax: z.number().nonnegative().optional(),
    tipoContrato: z.string().max(50).optional(),
    objetivo: z.string().max(200).optional(),
    fechaLimite: z.string().datetime().nullable().optional(),
    cupos: z.number().int().min(1).max(20).default(1),
    estado: z.enum(['borrador', 'publicada']).default('publicada'),
  })
  .refine(
    (data) => !(data.salarioMin !== undefined && data.salarioMax !== undefined && data.salarioMin > data.salarioMax),
    { message: 'salarioMin no puede superar salarioMax', path: ['salarioMin'] },
  );

export type CrearOfertaBodyDto = z.infer<typeof crearOfertaBodySchema>;

// Entrada completa del use-case (controller agrega identidad del token).
export const crearOfertaInputSchema = crearOfertaBodySchema.extend({
  usuarioId: z.string().uuid(),
  rol: z.enum(['aspirante', 'empresa']),
});

export type CrearOfertaUcInput = z.infer<typeof crearOfertaInputSchema>;

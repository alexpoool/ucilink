import { z } from 'zod';

// PUT /api/empresa/perfil — actualización parcial.
export const actualizarEmpresaSchema = z.object({
  nombre: z.string().min(1).max(150).optional(),
  razonSocial: z.string().min(1).max(150).nullable().optional(),
  ruc: z
    .string()
    .regex(/^\d{4}-\d{4}-\d{1,6}$/, 'RUC inválido')
    .nullable()
    .optional(),
  sector: z.string().max(100).nullable().optional(),
  descripcion: z.string().max(3000).nullable().optional(),
  sitioWeb: z.string().url().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  ciudad: z.string().max(100).nullable().optional(),
});

export type ActualizarEmpresaDto = z.infer<typeof actualizarEmpresaSchema>;

export const actualizarPerfilEmpresaInputSchema = actualizarEmpresaSchema.extend({
  usuarioId: z.string().uuid(),
});

export type ActualizarPerfilEmpresaInput = z.infer<typeof actualizarPerfilEmpresaInputSchema>;

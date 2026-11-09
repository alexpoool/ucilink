import { z } from 'zod';

// POST /api/empresa/perfil — nombre obligatorio; resto opcional.
export const crearEmpresaSchema = z.object({
  nombre: z.string().min(1).max(150),
  razonSocial: z.string().min(1).max(150).optional(),
  ruc: z.string().regex(/^\d{4}-\d{4}-\d{1,6}$/, 'RUC inválido').optional(),
  sector: z.string().max(100).optional(),
  descripcion: z.string().max(3000).optional(),
  sitioWeb: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  ciudad: z.string().max(100).optional(),
});

export type CrearEmpresaDto = z.infer<typeof crearEmpresaSchema>;

export const crearPerfilEmpresaInputSchema = crearEmpresaSchema.extend({
  usuarioId: z.string().uuid(),
});

export type CrearPerfilEmpresaInput = z.infer<typeof crearPerfilEmpresaInputSchema>;

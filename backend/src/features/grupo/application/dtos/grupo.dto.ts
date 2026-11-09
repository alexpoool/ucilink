import { z } from 'zod';

// POST crear grupo: el líder viene del token (nunca del body).
export const crearGrupoSchema = z.object({
  nombre: z.string().min(3).max(120),
  descripcion: z.string().max(1000).nullable().optional(),
  maxMiembros: z.number().int().min(2).max(20).optional(), // DB default 4
});

export type CrearGrupoDto = z.infer<typeof crearGrupoSchema>;

// POST invitar miembro: el invitado se referencia por su ID de perfil aspirante.
export const invitarSchema = z.object({
  grupoId: z.string().uuid(), // params
  aspiranteId: z.string().uuid(), // invitado
  rolEnGrupo: z.string().max(60).nullable().optional(),
  curriculumId: z.string().uuid().nullable().optional(), // CV que aporta
});

export type InvitarDto = z.infer<typeof invitarSchema>;

// PATCH responder invitación.
export const responderInvitacionSchema = z.object({
  aceptar: z.boolean(),
});

export type ResponderInvitacionDto = z.infer<typeof responderInvitacionSchema>;

// POST postular grupo a oferta (líder).
export const postularGrupoSchema = z.object({
  grupoId: z.string().uuid(), // params
  ofertaId: z.string().uuid(), // params
  usuarioId: z.string().uuid(), // token (resuelto a perfil en controller)
});

export type PostularGrupoDto = z.infer<typeof postularGrupoSchema>;

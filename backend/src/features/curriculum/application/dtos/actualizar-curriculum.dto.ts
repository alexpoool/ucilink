import { z } from 'zod';
import {
  educacionItemSchema,
  experienciaItemSchema,
  proyectoItemSchema,
  idiomaItemSchema,
} from './crear-curriculum.dto';

// PUT /api/curriculos/:id — actualización parcial (solo campos presentes).
export const actualizarCurriculumSchema = z.object({
  titulo: z.string().min(1).max(150).optional(),
  resumen: z.string().max(5000).nullable().optional(),
  educacion: z.array(educacionItemSchema).max(20).optional(),
  experiencia: z.array(experienciaItemSchema).max(30).optional(),
  proyectos: z.array(proyectoItemSchema).max(20).optional(),
  habilidades: z.array(z.string().min(1).max(50)).max(40).optional(),
  idiomas: z.array(idiomaItemSchema).max(20).optional(),
  cvPdfUrl: z.string().url().nullable().optional(),
  visible: z.boolean().optional(),
});

export type ActualizarCurriculumDto = z.infer<typeof actualizarCurriculumSchema>;

export const actualizarCurriculumInputSchema = actualizarCurriculumSchema.extend({
  usuarioId: z.string().uuid(),
  curriculumId: z.string().uuid(),
});

export type ActualizarCurriculumUcInput = z.infer<typeof actualizarCurriculumInputSchema>;

import { z } from 'zod';
import { EducacionItem, ExperienciaItem, ProyectoItem, IdiomaItem } from '@/features/curriculum/domain/curriculum.entity';

// Esquemas zod 1:1 con los sub-tipos JSONB del dominio (entrada validada).
export const educacionItemSchema = z.object({
  titulo: z.string().min(1).max(150),
  institucion: z.string().min(1).max(150),
  desde: z.string().date(),
  hasta: z.string().date().nullable(),
});

export const experienciaItemSchema = z.object({
  puesto: z.string().min(1).max(150),
  empresa: z.string().min(1).max(150),
  descripcion: z.string().max(2000).nullable(),
  desde: z.string().date(),
  hasta: z.string().date().nullable(),
});

export const proyectoItemSchema = z.object({
  nombre: z.string().min(1).max(150),
  descripcion: z.string().max(2000).nullable(),
  url: z.string().url().nullable(),
  tecnologias: z.array(z.string().min(1).max(50)).max(20),
});

export const idiomaItemSchema = z.object({
  idioma: z.string().min(1).max(50),
  nivel: z.enum(['basico', 'intermedio', 'avanzado', 'nativo']),
});

export const crearCurriculumSchema = z.object({
  titulo: z.string().min(1).max(150),
  resumen: z.string().max(5000).optional(),
  educacion: z.array(educacionItemSchema).max(20).optional(),
  experiencia: z.array(experienciaItemSchema).max(30).optional(),
  proyectos: z.array(proyectoItemSchema).max(20).optional(),
  habilidades: z.array(z.string().min(1).max(50)).max(40).optional(),
  idiomas: z.array(idiomaItemSchema).max(20).optional(),
  cvPdfUrl: z.string().url().optional(),
  visible: z.boolean().optional(),
});

export type CrearCurriculumDto = z.infer<typeof crearCurriculumSchema>;

export const crearCurriculumInputSchema = crearCurriculumSchema.extend({
  usuarioId: z.string().uuid(), // resuelto del token; nunca lo manda el cliente
});

export type CrearCurriculumUcInput = z.infer<typeof crearCurriculumInputSchema>;

export type { EducacionItem, ExperienciaItem, ProyectoItem, IdiomaItem };

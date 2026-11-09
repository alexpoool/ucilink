import { Curriculum } from '../domain/curriculum.entity';

// DTO de respuesta. `aspirante` va incluido para el CV público (SEO).
export interface CurriculumDto {
  id: string;
  titulo: string;
  resumen: string | null;
  educacion: Curriculum['educacion'];
  experiencia: Curriculum['experiencia'];
  proyectos: Curriculum['proyectos'];
  habilidades: string[];
  idiomas: Curriculum['idiomas'];
  cvPdfUrl: string | null;
  esPrincipal: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
  aspirante?: {
    id: string;
    nombre: string;
    apellido: string;
    carrera: string | null;
  };
}

export function mapearCurriculum(
  entity: Curriculum,
  aspirante?: CurriculumDto['aspirante'],
): CurriculumDto {
  const dto: CurriculumDto = {
    id: entity.id,
    titulo: entity.titulo,
    resumen: entity.resumen,
    educacion: entity.educacion,
    experiencia: entity.experiencia,
    proyectos: entity.proyectos,
    habilidades: entity.habilidades,
    idiomas: entity.idiomas,
    cvPdfUrl: entity.cvPdfUrl,
    esPrincipal: entity.esPrincipal,
    visible: entity.visible,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
  if (aspirante) dto.aspirante = aspirante;
  return dto;
}

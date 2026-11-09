import { Aspirante } from '../domain/aspirante.entity';

// DTO de respuesta pública del perfil aspirante. Nunca expone usuarioId
// sensible + separa fechas ISO para serialización limpia a JSON.
export interface AspiranteDto {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  carrera: string | null;
  semestre: number | null;
  bio: string | null;
  habilidades: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  portafolioUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export function mapearAspirante(entity: Aspirante): AspiranteDto {
  return {
    id: entity.id,
    nombre: entity.nombre,
    apellido: entity.apellido,
    telefono: entity.telefono,
    carrera: entity.carrera,
    semestre: entity.semestre,
    bio: entity.bio,
    habilidades: entity.habilidades,
    linkedinUrl: entity.linkedinUrl,
    githubUrl: entity.githubUrl,
    portafolioUrl: entity.portafolioUrl,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

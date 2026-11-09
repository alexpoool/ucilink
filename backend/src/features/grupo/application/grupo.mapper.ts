import { Grupo, GrupoMiembro } from '../domain/grupo.entity';

export interface GrupoDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  liderId: string;
  maxMiembros: number;
  estado: string;
  createdAt: string;
}

export interface GrupoMiembroDto {
  id: string;
  grupoId: string;
  aspiranteId: string;
  rolEnGrupo: string | null;
  curriculumId: string | null;
  estado: string;
}

export function mapearGrupo(g: Grupo): GrupoDto {
  return {
    id: g.id,
    nombre: g.nombre,
    descripcion: g.descripcion,
    liderId: g.liderId,
    maxMiembros: g.maxMiembros,
    estado: g.estado,
    createdAt: g.createdAt.toISOString(),
  };
}

export function mapearMiembro(m: GrupoMiembro): GrupoMiembroDto {
  return {
    id: m.id,
    grupoId: m.grupoId,
    aspiranteId: m.aspiranteId,
    rolEnGrupo: m.rolEnGrupo,
    curriculumId: m.curriculumId,
    estado: m.estado,
  };
}

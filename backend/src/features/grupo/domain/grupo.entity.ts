import { EstadoGrupo } from './estado-grupo.vo';
import { EstadoMiembro } from './estado-miembro.vo';

// Espeja las tablas `grupo` y `grupo_miembro` de esquema.sql.
export interface Grupo {
  id: string;
  nombre: string;
  descripcion: string | null;
  liderId: string; // aspirante_id
  maxMiembros: number;
  estado: EstadoGrupo;
  createdAt: Date;
}

export interface GrupoMiembro {
  id: string;
  grupoId: string;
  aspiranteId: string;
  rolEnGrupo: string | null;
  curriculumId: string | null; // CV que lleva al equipo
  estado: EstadoMiembro;
  createdAt: Date;
}

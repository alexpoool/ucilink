import { Grupo, GrupoMiembro } from './grupo.entity';
import { EstadoMiembro } from './estado-miembro.vo';

export interface CrearGrupoInput {
  nombre: string;
  descripcion: string | null;
  liderId: string;
  maxMiembros: number;
}

// Puerto del grupo + de sus miembros (grupo_miembro.rol_en_grupo / curriculum_id).
export interface GrupoRepository {
  crear(input: CrearGrupoInput): Promise<Grupo>;
  buscarPorId(id: string): Promise<Grupo | null>;
  listarPorLider(liderId: string): Promise<Grupo[]>;
  listarMiosComoMiembro(aspiranteId: string): Promise<Grupo[]>;
  contarMiembrosAceptados(grupoId: string): Promise<number>;
  cambiarEstado(id: string, estado: Grupo['estado']): Promise<Grupo>;
}

export interface GrupoMiembroRepository {
  agregar(grupoId: string, aspiranteId: string, rolEnGrupo: string | null, curriculumId: string | null): Promise<GrupoMiembro>;
  buscar(grupoId: string, aspiranteId: string): Promise<GrupoMiembro | null>;
  listarDeGrupo(grupoId: string): Promise<GrupoMiembro[]>;
  // NOTA: se llama cambiarEstadoMiembro (no cambiarEstado) porque una ÚNICA
  // impl presenta ambos puertos (agregado grupo) y evita colisionar con
  // GrupoRepository.cambiarEstado (estados de grupo ≠ estados de miembro).
  cambiarEstadoMiembro(id: string, estado: EstadoMiembro): Promise<GrupoMiembro>;
}

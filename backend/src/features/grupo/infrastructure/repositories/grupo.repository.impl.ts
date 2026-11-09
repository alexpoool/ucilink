import { GrupoRepository, GrupoMiembroRepository, CrearGrupoInput } from '@/features/grupo/domain/grupo.repository';
import { Grupo, GrupoMiembro } from '@/features/grupo/domain/grupo.entity';
import { EstadoMiembro } from '@/features/grupo/domain/estado-miembro.vo';
import { Database } from '@/config/db';

export type EstadoGrupoDb = 'formando' | 'completo' | 'postulado' | 'cerrado';

interface GrupoRow {
  id: string;
  nombre: string;
  descripcion: string | null;
  lider_id: string;
  max_miembros: number;
  estado: EstadoGrupoDb;
  created_at: Date;
}

interface MiembroRow {
  id: string;
  grupo_id: string;
  aspirante_id: string;
  rol_en_grupo: string | null;
  curriculum_id: string | null;
  estado: EstadoMiembro;
  created_at: Date;
}

function mapearGrupo(row: GrupoRow): Grupo {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    liderId: row.lider_id,
    maxMiembros: Number(row.max_miembros),
    estado: row.estado,
    createdAt: row.created_at,
  };
}

function mapearMiembro(row: MiembroRow): GrupoMiembro {
  return {
    id: row.id,
    grupoId: row.grupo_id,
    aspiranteId: row.aspirante_id,
    rolEnGrupo: row.rol_en_grupo,
    curriculumId: row.curriculum_id,
    estado: row.estado,
    createdAt: row.created_at,
  };
}

// UNA impl para el AGREGADO grupo + grupo_miembro (misma transacción natural).
export class GrupoRepositoryImpl implements GrupoRepository, GrupoMiembroRepository {
  constructor(private readonly db: Database) {}

  async crear(input: CrearGrupoInput): Promise<Grupo> {
    const res = await this.db.query<GrupoRow>(
      `INSERT INTO grupo (nombre, descripcion, lider_id, max_miembros)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, descripcion, lider_id, max_miembros, estado, created_at`,
      [input.nombre, input.descripcion, input.liderId, input.maxMiembros],
    );
    return mapearGrupo(res.rows[0]);
  }

  async buscarPorId(id: string): Promise<Grupo | null> {
    const res = await this.db.query<GrupoRow>(
      'SELECT id, nombre, descripcion, lider_id, max_miembros, estado, created_at FROM grupo WHERE id = $1',
      [id],
    );
    return res.rows[0] ? mapearGrupo(res.rows[0]) : null;
  }

  async listarPorLider(liderId: string): Promise<Grupo[]> {
    const res = await this.db.query<GrupoRow>(
      'SELECT id, nombre, descripcion, lider_id, max_miembros, estado, created_at FROM grupo WHERE lider_id = $1 ORDER BY created_at DESC',
      [liderId],
    );
    return res.rows.map(mapearGrupo);
  }

  async listarMiosComoMiembro(aspiranteId: string): Promise<Grupo[]> {
    const res = await this.db.query<GrupoRow>(
      `SELECT g.id, g.nombre, g.descripcion, g.lider_id, g.max_miembros, g.estado, g.created_at
       FROM grupo g
       JOIN grupo_miembro gm ON gm.grupo_id = g.id
       WHERE gm.aspirante_id = $1 AND gm.estado IN ('aceptado', 'invitado')
       ORDER BY g.created_at DESC`,
      [aspiranteId],
    );
    return res.rows.map(mapearGrupo);
  }

  async contarMiembrosAceptados(grupoId: string): Promise<number> {
    const res = await this.db.query<{ total: string }>(
      "SELECT COUNT(*) AS total FROM grupo_miembro WHERE grupo_id = $1 AND estado = 'aceptado'",
      [grupoId],
    );
    return Number(res.rows[0]?.total ?? 0);
  }

  async cambiarEstado(id: string, estado: EstadoGrupoDb): Promise<Grupo> {
    const res = await this.db.query<GrupoRow>(
      'UPDATE grupo SET estado = $2 WHERE id = $1 RETURNING id, nombre, descripcion, lider_id, max_miembros, estado, created_at',
      [id, estado],
    );
    return mapearGrupo(res.rows[0]);
  }

  async agregar(
    grupoId: string,
    aspiranteId: string,
    rolEnGrupo: string | null,
    curriculumId: string | null,
  ): Promise<GrupoMiembro> {
    const res = await this.db.query<MiembroRow>(
      `INSERT INTO grupo_miembro (grupo_id, aspirante_id, rol_en_grupo, curriculum_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (grupo_id, aspirante_id) DO UPDATE
         SET rol_en_grupo = EXCLUDED.rol_en_grupo, curriculum_id = EXCLUDED.curriculum_id
       RETURNING id, grupo_id, aspirante_id, rol_en_grupo, curriculum_id, estado, created_at`,
      [grupoId, aspiranteId, rolEnGrupo, curriculumId],
    );
    return mapearMiembro(res.rows[0]);
  }

  async buscar(grupoId: string, aspiranteId: string): Promise<GrupoMiembro | null> {
    const res = await this.db.query<MiembroRow>(
      'SELECT id, grupo_id, aspirante_id, rol_en_grupo, curriculum_id, estado, created_at FROM grupo_miembro WHERE grupo_id = $1 AND aspirante_id = $2',
      [grupoId, aspiranteId],
    );
    return res.rows[0] ? mapearMiembro(res.rows[0]) : null;
  }

  async listarDeGrupo(grupoId: string): Promise<GrupoMiembro[]> {
    const res = await this.db.query<MiembroRow>(
      'SELECT id, grupo_id, aspirante_id, rol_en_grupo, curriculum_id, estado, created_at FROM grupo_miembro WHERE grupo_id = $1 ORDER BY created_at ASC',
      [grupoId],
    );
    return res.rows.map(mapearMiembro);
  }

  async cambiarEstadoMiembro(id: string, estado: EstadoMiembro): Promise<GrupoMiembro> {
    const res = await this.db.query<MiembroRow>(
      'UPDATE grupo_miembro SET estado = $2 WHERE id = $1 RETURNING id, grupo_id, aspirante_id, rol_en_grupo, curriculum_id, estado, created_at',
      [id, estado],
    );
    return mapearMiembro(res.rows[0]);
  }
}

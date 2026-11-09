import {
  EvaluacionRepository,
  CrearEvaluacionInput,
} from '@/features/evaluacion/domain/evaluacion.repository';
import { Evaluacion } from '@/features/evaluacion/domain/evaluacion.entity';
import { EstadoEvaluacion } from '@/features/evaluacion/domain/estado-evaluacion.vo';
import { Database } from '@/config/db';

interface EvaluacionRow {
  id: string;
  oferta_id: string;
  curriculum_id: string;
  aspirante_id: string;
  grupo_id: string | null;
  estado: EstadoEvaluacion;
  comentario_empresa: string | null;
  puntuacion: number | null;
  fecha_postulacion: Date;
  fecha_evaluacion: Date | null;
  evaluado_por_empresa: boolean;
}

function mapear(row: EvaluacionRow): Evaluacion {
  return {
    id: row.id,
    ofertaId: row.oferta_id,
    curriculumId: row.curriculum_id,
    aspiranteId: row.aspirante_id,
    grupoId: row.grupo_id,
    estado: row.estado,
    comentarioEmpresa: row.comentario_empresa,
    puntuacion: row.puntuacion,
    fechaPostulacion: row.fecha_postulacion,
    fechaEvaluacion: row.fecha_evaluacion,
    evaluadoPorEmpresa: row.evaluado_por_empresa,
  };
}

const COLUMNAS =
  'id, oferta_id, curriculum_id, aspirante_id, grupo_id, estado, comentario_empresa, puntuacion, fecha_postulacion, fecha_evaluacion, evaluado_por_empresa';

export class EvaluacionRepositoryImpl implements EvaluacionRepository {
  constructor(private readonly db: Database) {}

  async buscarPorId(id: string): Promise<Evaluacion | null> {
    const res = await this.db.query<EvaluacionRow>(`SELECT ${COLUMNAS} FROM evaluacion_curriculum WHERE id = $1`, [
      id,
    ]);
    return res.rows[0] ? mapear(res.rows[0]) : null;
  }

  async existePostulacion(ofertaId: string, curriculumId: string): Promise<boolean> {
    const res = await this.db.query<{ existe: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM evaluacion_curriculum WHERE oferta_id = $1 AND curriculum_id = $2) AS existe',
      [ofertaId, curriculumId],
    );
    return res.rows[0]?.existe === true;
  }

  async crear(input: CrearEvaluacionInput): Promise<Evaluacion> {
    const res = await this.db.query<EvaluacionRow>(
      `INSERT INTO evaluacion_curriculum (oferta_id, curriculum_id, aspirante_id, grupo_id)
       VALUES ($1, $2, $3, $4)
       RETURNING ${COLUMNAS}`,
      [input.ofertaId, input.curriculumId, input.aspiranteId, input.grupoId],
    );
    return mapear(res.rows[0]);
  }

  async listarPorOferta(ofertaId: string): Promise<Evaluacion[]> {
    const res = await this.db.query<EvaluacionRow>(
      `SELECT ${COLUMNAS} FROM evaluacion_curriculum WHERE oferta_id = $1 ORDER BY fecha_postulacion ASC`,
      [ofertaId],
    );
    return res.rows.map(mapear);
  }

  async listarPorAspirante(aspiranteId: string): Promise<Evaluacion[]> {
    const res = await this.db.query<EvaluacionRow>(
      `SELECT ${COLUMNAS} FROM evaluacion_curriculum WHERE aspirante_id = $1 ORDER BY fecha_postulacion DESC`,
      [aspiranteId],
    );
    return res.rows.map(mapear);
  }

  async cambiarEstado(
    id: string,
    estado: EstadoEvaluacion,
    evaluadoPorEmpresa: boolean,
    comentarioEmpresa: string | null = null,
    puntuacion: number | null = null,
  ): Promise<Evaluacion> {
    const res = await this.db.query<EvaluacionRow>(
      `UPDATE evaluacion_curriculum
         SET estado = $2,
             comentario_empresa = COALESCE($3, comentario_empresa),
             puntuacion         = COALESCE($4, puntuacion),
             evaluado_por_empresa = $5,
             fecha_evaluacion   = now()
       WHERE id = $1
       RETURNING ${COLUMNAS}`,
      [id, estado, comentarioEmpresa, puntuacion, evaluadoPorEmpresa],
    );
    return mapear(res.rows[0]);
  }

  async retirar(id: string): Promise<Evaluacion> {
    const res = await this.db.query<EvaluacionRow>(
      `UPDATE evaluacion_curriculum
         SET estado = 'retirado', evaluado_por_empresa = false, fecha_evaluacion = now()
       WHERE id = $1
       RETURNING ${COLUMNAS}`,
      [id],
    );
    return mapear(res.rows[0]);
  }
}

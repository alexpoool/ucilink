import { MetricasRepository, MetricasEmpresa } from '@/features/empresa/domain/metricas.repository';
import { Database } from '@/config/db';

// Agregados del dashboard. Todo con SQL parametrizado y contadores en una sola
// consulta por bloque para minimizar round-trips (el polling del frontend es ligero).
export class MetricasRepositoryImpl implements MetricasRepository {
  constructor(private readonly db: Database) {}

  async obtenerMetricas(empresaId: string): Promise<MetricasEmpresa> {
    const ofertas = await this.db.query<{
      normales: string;
      dash: string;
      cerradas: string;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE tipo_oferta = 'normal' AND estado = 'publicada') AS normales,
         COUNT(*) FILTER (WHERE tipo_oferta = 'dash'    AND estado = 'publicada') AS dash,
         COUNT(*) FILTER (WHERE estado IN ('cerrada','cancelada'))                AS cerradas
       FROM oferta
       WHERE autor_tipo = 'empresa' AND autor_id = $1`,
      [empresaId],
    );

    const cv = await this.db.query<{ recibidos: string; pendientes: string }>(
      `SELECT COUNT(*) AS recibidos,
              COUNT(*) FILTER (WHERE estado = 'postulado') AS pendientes
       FROM evaluacion_curriculum ec
       INNER JOIN oferta o ON o.id = ec.oferta_id
       WHERE o.autor_tipo = 'empresa' AND o.autor_id = $1`,
      [empresaId],
    );

    const valor = await this.db.query<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM valoracion_curriculum vc
       INNER JOIN curriculum c ON c.id = vc.curriculum_id
       INNER JOIN evaluacion_curriculum ec ON ec.curriculum_id = c.id
       INNER JOIN oferta o ON o.id = ec.oferta_id
       WHERE o.autor_tipo = 'empresa' AND o.autor_id = $1`,
      [empresaId],
    );

    const of = ofertas.rows[0];
    const c = cv.rows[0];
    const v = valor.rows[0];

    return {
      ofertasNormalesPublicadas: Number(of?.normales ?? 0),
      ofertasDashPublicadas: Number(of?.dash ?? 0),
      ofertasCerradas: Number(of?.cerradas ?? 0),
      cvsRecibidos: Number(c?.recibidos ?? 0),
      cvsPendientesRevision: Number(c?.pendientes ?? 0),
      valoracionesRecibidas: Number(v?.total ?? 0),
    };
  }
}

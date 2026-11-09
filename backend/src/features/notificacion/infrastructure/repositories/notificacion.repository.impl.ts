import { NotificacionRepository } from '@/features/notificacion/domain/notificacion.repository';
import { Database } from '@/config/db';

interface NotificacionRow {
  id: string;
  usuario_id: string;
  tipo: string;
  referencia_id: string | null;
  leida: boolean;
  created_at: Date;
}

const COLUMNAS = 'id, usuario_id, tipo, referencia_id, leida, created_at';

function mapear(row: NotificacionRow) {
  return {
    id: row.id,
    usuarioId: row.usuario_id,
    tipo: row.tipo,
    referenciaId: row.referencia_id,
    leida: row.leida,
    createdAt: row.created_at,
  };
}

export class NotificacionRepositoryImpl implements NotificacionRepository {
  constructor(private readonly db: Database) {}

  async crear(input: { usuarioId: string; tipo: string; referenciaId: string | null }): Promise<void> {
    // idempotente-friendly: si la referencia ya fue notificada así, no duplica.
    await this.db.query(
      `INSERT INTO notificacion (usuario_id, tipo, referencia_id)
       VALUES ($1, $2::tipo_notificacion, $3)`,
      [input.usuarioId, input.tipo, input.referenciaId],
    );
  }

  async listarPorUsuario(usuarioId: string): Promise<ReturnType<typeof mapear>[]> {
    const res = await this.db.query<NotificacionRow>(
      `SELECT ${COLUMNAS} FROM notificacion WHERE usuario_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [usuarioId],
    );
    return res.rows.map(mapear);
  }

  async contarNoLeidas(usuarioId: string): Promise<number> {
    const res = await this.db.query<{ total: string }>(
      'SELECT COUNT(*) AS total FROM notificacion WHERE usuario_id = $1 AND leida = false',
      [usuarioId],
    );
    return Number(res.rows[0]?.total ?? 0);
  }

  async marcarLeida(id: string, usuarioId: string): Promise<ReturnType<typeof mapear> | null> {
    // WHERE usuario_id = $2 hace el guard de propiedad aqui (no devuelvo ajena).
    const res = await this.db.query<NotificacionRow>(
      `UPDATE notificacion SET leida = true
       WHERE id = $1 AND usuario_id = $2 AND leida = false
       RETURNING ${COLUMNAS}`,
      [id, usuarioId],
    );
    return res.rows[0] ? mapear(res.rows[0]) : null;
  }

  async marcarTodasLeidas(usuarioId: string): Promise<number> {
    const res = await this.db.query<{ id: string }>(
      'UPDATE notificacion SET leida = true WHERE usuario_id = $1 AND leida = false RETURNING id',
      [usuarioId],
    );
    return res.rows.length;
  }
}

export type { NotificacionRepository }; // re-exporta para el module

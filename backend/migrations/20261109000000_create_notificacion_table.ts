import type { Database } from '../src/config/db';

// Migración: crea la tabla `notificacion` (funcionalidad NO incluida en esquema.sql).
// up(): crea el enum tipo_notificacion, la tabla y su índice de consulta habitual.
// down(): revierte exactamente esos pasos en orden inverso.
//
// MVP del producto: la empresa recibe un aviso cuando un CV es postulado.
// Tipos soportados (shared/domain/creador-notificaciones.port.ts): cv_recibido, sistema...
const MIGRACION_NOMBRE = '20261109_000000_create_notificacion_table';

export const nombre = MIGRACION_NOMBRE;

export async function up(db: Database): Promise<void> {
  await db.transaction(async (client) => {
    await client.query(`
      CREATE TYPE tipo_notificacion AS ENUM
        ('cv_recibido', 'invitacion_grupo', 'valoracion', 'respuesta', 'sistema')
    `);

    await client.query(`
      CREATE TABLE notificacion (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id    UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
        tipo          tipo_notificacion NOT NULL DEFAULT 'sistema',
        referencia_id UUID,
        leida         BOOLEAN NOT NULL DEFAULT false,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE INDEX idx_notificacion_usuario
        ON notificacion (usuario_id, leida, created_at DESC)
    `);
  });
}

export async function down(db: Database): Promise<void> {
  await db.transaction(async (client) => {
    await client.query(`DROP INDEX IF EXISTS idx_notificacion_usuario`);
    await client.query(`DROP TABLE IF EXISTS notificacion`);
    await client.query(`DROP TYPE IF EXISTS tipo_notificacion`);
  });
}

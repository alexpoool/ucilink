import { Database } from '@/config/db';
import { NotificacionRepositoryImpl } from '@/features/notificacion/infrastructure/repositories/notificacion.repository.impl';

describe('NotificacionRepositoryImpl', () => {
  let db: jest.Mocked<Database>;
  let repo: NotificacionRepositoryImpl;

  beforeEach(() => {
    db = { query: jest.fn(), transaction: jest.fn() } as jest.Mocked<Database>;
    repo = new NotificacionRepositoryImpl(db);
  });

  it('crear casta el tipo al enum de la migración (::tipo_notificacion)', async () => {
    db.query.mockResolvedValue({ rows: [] } as never);
    await repo.crear({ usuarioId: 'u', tipo: 'cv_recibido', referenciaId: 'r' });
    expect((db.query.mock.calls[0][0] as string)).toContain('tipo::tipo_notificacion');
    expect(db.query.mock.calls[0][1]).toEqual(['u', 'cv_recibido', 'r']);
  });

  it('marcarLeida guarda de propiedad en el WHERE (usuario_id = $2) y solo leida=false', async () => {
    db.query.mockResolvedValue({ rows: [] } as never);
    await repo.marcarLeida('n1', 'u1');
    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toContain('WHERE id = $1 AND usuario_id = $2 AND leida = false');
    expect(sql).toContain('RETURNING');
  });

  it('contarNoLeidas cuenta solo leida=false', async () => {
    db.query.mockResolvedValue({ rows: [{ total: '7' }] } as never);
    expect(await repo.contarNoLeidas('u1')).toBe(7);
    expect((db.query.mock.calls[0][0] as string)).toContain('leida = false');
  });

  it('marcarTodasLeidas cuenta RETURNING ids', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 'a' }, { id: 'b' }] } as never);
    expect(await repo.marcarTodasLeidas('u1')).toBe(2);
  });
});

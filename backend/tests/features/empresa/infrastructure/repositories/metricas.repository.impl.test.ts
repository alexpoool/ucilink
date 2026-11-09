import { MetricasRepositoryImpl } from '@/features/empresa/infrastructure/repositories/metricas.repository.impl';
import { Database } from '@/config/db';

describe('MetricasRepositoryImpl', () => {
  let db: jest.Mocked<Database>;
  let repo: MetricasRepositoryImpl;

  beforeEach(() => {
    db = { query: jest.fn(), transaction: jest.fn() } as jest.Mocked<Database>;
    repo = new MetricasRepositoryImpl(db);
  });

  it('mapea los strings numéricos de pg a numbers', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ normales: '3', dash: '1', cerradas: '2' }] } as never)
      .mockResolvedValueOnce({ rows: [{ recibidos: '12', pendientes: '5' }] } as never)
      .mockResolvedValueOnce({ rows: [{ total: '9' }] } as never);

    const m = await repo.obtenerMetricas('77777777-7777-7777-7777-777777777777');

    expect(m).toEqual({
      ofertasNormalesPublicadas: 3,
      ofertasDashPublicadas: 1,
      ofertasCerradas: 2,
      cvsRecibidos: 12,
      cvsPendientesRevision: 5,
      valoracionesRecibidas: 9,
    });
  });

  it('devuelve ceros si algún COUNT regresó sin filas', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    const m = await repo.obtenerMetricas('77777777-7777-7777-7777-777777777777');
    expect(m).toEqual({
      ofertasNormalesPublicadas: 0,
      ofertasDashPublicadas: 0,
      ofertasCerradas: 0,
      cvsRecibidos: 0,
      cvsPendientesRevision: 0,
      valoracionesRecibidas: 0,
    });
  });
});

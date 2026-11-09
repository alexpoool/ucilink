import { EvaluacionRepositoryImpl } from '@/features/evaluacion/infrastructure/repositories/evaluacion.repository.impl';
import { Database } from '@/config/db';

describe('EvaluacionRepositoryImpl', () => {
  let db: jest.Mocked<Database>;
  let repo: EvaluacionRepositoryImpl;

  const fila = {
    id: 'aaaa1111-0000-0000-0000-000000000003',
    oferta_id: 'aaaa1111-0000-0000-0000-000000000001',
    curriculum_id: 'aaaa1111-0000-0000-0000-000000000002',
    aspirante_id: '55555555-5555-5555-5555-555555555555',
    grupo_id: null,
    estado: 'postulado',
    comentario_empresa: null,
    puntuacion: null,
    fecha_postulacion: new Date('2026-01-02T00:00:00Z'),
    fecha_evaluacion: null,
    evaluado_por_empresa: false,
  };

  beforeEach(() => {
    db = { query: jest.fn(), transaction: jest.fn() } as jest.Mocked<Database>;
    repo = new EvaluacionRepositoryImpl(db);
  });

  it('existePostulacion resuelve EXISTS boolean', async () => {
    db.query.mockResolvedValue({ rows: [{ existe: true }] } as never);
    expect(await repo.existePostulacion(fila.oferta_id, fila.curriculum_id)).toBe(true);
  });

  it('crear con grupo_id nullable', async () => {
    db.query.mockResolvedValue({ rows: [fila] } as never);
    await repo.crear({
      ofertaId: fila.oferta_id,
      curriculumId: fila.curriculum_id,
      aspiranteId: fila.aspirante_id,
      grupoId: null,
    });
    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toContain('INSERT INTO evaluacion_curriculum');
    expect(sql).toContain('grupo_id');
  });

  it('cambiarEstado usa COALESCE para NO pisar comentario/puntuación previos salvo valor nuevo', async () => {
    db.query.mockResolvedValue({ rows: [fila] } as never);
    await repo.cambiarEstado(fila.id, 'preseleccionado', true, null, null);
    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toContain('comentario_empresa = COALESCE($3, comentario_empresa)');
    expect(sql).toContain('puntuacion         = COALESCE($4, puntuacion)');
    expect(sql).toContain('fecha_evaluacion   = now()');
  });

  it('retirar fija estado retirado evaluado_por_empresa = false', async () => {
    db.query.mockResolvedValue({ rows: [fila] } as never);
    await repo.retirar(fila.id);
    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toContain("estado = 'retirado'");
  });
});

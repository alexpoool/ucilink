import { Database } from '@/config/db';
import { AdminRepositoryImpl } from '@/features/admin/infrastructure/repositories/admin.repository.impl';

describe('AdminRepositoryImpl', () => {
  let db: jest.Mocked<Database>;
  let repo: AdminRepositoryImpl;

  const filaContador = (clave: string, total: string) => ({ clave, total });

  beforeEach(() => {
    db = { query: jest.fn(), transaction: jest.fn() } as jest.Mocked<Database>;
    repo = new AdminRepositoryImpl(db);
  });

  it('obtenerMetricas son 5 consultas paralelas y convierte COUNT a number', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [filaContador('aspirante', '10')] } as never)
      .mockResolvedValueOnce({ rows: [filaContador('publicada', '7')] } as never)
      .mockResolvedValueOnce({ rows: [filaContador('postulado', '12')] } as never)
      .mockResolvedValueOnce({ rows: [filaContador('grupos', '3')] } as never)
      .mockResolvedValueOnce({ rows: [filaContador('cvs', '9')] } as never);

    const m = await repo.obtenerMetricas();

    expect(db.query).toHaveBeenCalledTimes(5);
    expect(m.usuariosPorRol[0]).toEqual({ clave: 'aspirante', total: 10 });
    expect(m.ofertasPorEstado[0].total).toBe(7);
    expect(m.postulacionesPorEstado[0].total).toBe(12);
    expect(m.totalGrupos).toBe(3);
    expect(m.totalCurriculos).toBe(9);
  });

  it('listarOfertas SIN estado no envía params ni WHERE', async () => {
    db.query.mockResolvedValue({ rows: [] } as never);
    await repo.listarOfertas(null);
    expect((db.query.mock.calls[0][0] as string)).not.toContain('WHERE');
    expect(db.query.mock.calls[0][1]).toBeUndefined();
  });

  it('listarOfertas CON estado exige alias ::text sobre el enum', async () => {
    db.query.mockResolvedValue({ rows: [] } as never);
    await repo.listarOfertas('publicada');
    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toContain('autor_tipo::text');
    expect(db.query.mock.calls[0][1]).toEqual(['publicada']);
  });

  it('listarEmpresasPendientes filtra verificada=false', async () => {
    db.query.mockResolvedValue({ rows: [] } as never);
    await repo.listarEmpresasPendientes();
    expect((db.query.mock.calls[0][0] as string)).toContain('verificada = false');
  });
});

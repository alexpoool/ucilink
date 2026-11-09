import { EmpresaRepositoryImpl } from '@/features/empresa/infrastructure/repositories/empresa.repository.impl';
import { Database } from '@/config/db';

const fila = {
  id: '77777777-7777-7777-7777-777777777777',
  usuario_id: '22222222-2222-2222-2222-222222222222',
  nombre: 'Fintech Plus',
  razon_social: null,
  ruc: '0000-0000-1',
  sector: 'fintech',
  descripcion: null,
  sitio_web: null,
  logo_url: null,
  ciudad: 'La Habana',
  verificada: false,
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-01-01T00:00:00Z'),
};

describe('EmpresaRepositoryImpl', () => {
  let db: jest.Mocked<Database>;
  let repo: EmpresaRepositoryImpl;

  beforeEach(() => {
    db = { query: jest.fn(), transaction: jest.fn() } as jest.Mocked<Database>;
    repo = new EmpresaRepositoryImpl(db);
  });

  it('buscarPorUsuarioId mapea snake_case → entidad', async () => {
    db.query.mockResolvedValue({ rows: [fila] } as never);

    const e = await repo.buscarPorUsuarioId(fila.usuario_id);

    expect(e?.verificada).toBe(false);
    expect(e?.usuarioId).toBe(fila.usuario_id);
  });

  it('crear inserta columnas y RETURNING mapeado', async () => {
    db.query.mockResolvedValue({ rows: [fila] } as never);

    await repo.crear(
      {
        nombre: 'Fintech Plus',
        razonSocial: null,
        ruc: '0000-0000-1',
        sector: 'fintech',
        descripcion: null,
        sitioWeb: null,
        logoUrl: null,
        ciudad: 'La Habana',
      },
      fila.usuario_id,
    );

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO empresa'),
      expect.arrayContaining([fila.usuario_id, 'Fintech Plus']),
    );
  });

  it('actualizar genera SET solo con campos presentes', async () => {
    db.query.mockResolvedValue({ rows: [fila] } as never);

    await repo.actualizar(fila.id, { ciudad: 'Matanzas' });

    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toMatch(/SET ciudad = \$2/);
    expect(sql).not.toContain('nombre =');
  });
});

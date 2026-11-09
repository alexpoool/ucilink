import { OfertaRepositoryImpl } from '@/features/oferta/infrastructure/repositories/oferta.repository.impl';
import { Database } from '@/config/db';

// Gemelo del impl: verifica el SQL generado (JOIN/valores) y el mapeo.
describe('OfertaRepositoryImpl', () => {
  let db: jest.Mocked<Database>;
  let repo: OfertaRepositoryImpl;

  const rowBase = {
    id: '88888888-8888-8888-8888-888888888888',
    autor_tipo: 'empresa',
    autor_id: '77777777-7777-7777-7777-777777777777',
    tipo_oferta: 'normal',
    titulo: 'Backend TS',
    descripcion: 'd',
    requisitos: null,
    habilidades_req: ['Node'],
    modalidad: null,
    ubicacion: null,
    salario_min: '500',
    salario_max: '900',
    tipo_contrato: null,
    objetivo: null,
    grupo_id: null,
    fecha_limite: new Date('2026-12-01T00:00:00Z'),
    cupos: 1,
    estado: 'publicada',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
    autor_nombre: 'Fintech Plus',
    autor_verificado: true,
    autor_logo_url: null,
    likes: '3',
    dislikes: '1',
  };

  beforeEach(() => {
    db = { query: jest.fn(), transaction: jest.fn() } as jest.Mocked<Database>;
    repo = new OfertaRepositoryImpl(db);
  });

  it('listarFeed fuerza estado publicada + LIMIT parametrizado con techo', async () => {
    db.query.mockResolvedValue({ rows: [rowBase] } as never);

    const lista = await repo.listarFeed({
      estado: 'cancelada' as never, // el impl DEBE ignorarlo: el feed es público
      limit: 100, // intento de override: el impl lo trunca a 50
      offset: 10,
    });

    const sql = db.query.mock.calls[0][0] as string;
    const params = db.query.mock.calls[0][1] as unknown[];

    expect(sql).toMatch(/WHERE o\.estado = \$1 ORDER BY o\.created_at DESC LIMIT \$2 OFFSET \$3/);
    expect(params?.[0]).toBe('publicada'); // el impl ignora el estado pedido
    expect(params?.[1]).toBe(50);
    expect(params?.[2]).toBe(10);
    expect(lista[0].oferta.salarioMin).toBe(500); // NUMERIC string → number
    expect(lista[0].likes).toBe(3);
  });

  it('listarFeed añade filtros @> para habilidades', async () => {
    db.query.mockResolvedValue({ rows: [] } as never);
    await repo.listarFeed({
      habilidadesContiene: ['Node', 'React'],
      limit: 5,
      offset: 0,
    });

    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toContain('habilidades_req @> $2');
    const params = db.query.mock.calls[0][1] as unknown[];
    expect(params?.[1]).toEqual(['Node', 'React']);
  });

  it('buscarPorId reusa el SELECT_BASE con JOINs', async () => {
    db.query.mockResolvedValue({ rows: [rowBase] } as never);

    const r = await repo.buscarPorId(rowBase.id);

    expect((db.query.mock.calls[0][0] as string)).toContain('LEFT JOIN empresa');
    expect((db.query.mock.calls[0][0] as string)).toContain('valoracion_oferta');
    expect(r?.oferta.tipoOferta).toBe('normal');
  });

  it('crear INSERTA y luego leer el resumen con buscarPorId', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: rowBase.id }] } as never) // INSERT RETURNING id
      .mockResolvedValueOnce({ rows: [rowBase] } as never); // SELECT_BASE

    const r = await repo.crear({
      autorTipo: 'empresa',
      autorId: rowBase.autor_id,
      tipoOferta: 'normal',
      titulo: 'Backend TS',
      descripcion: 'd',
      requisitos: null,
      habilidadesReq: ['Node'],
      modalidad: null,
      ubicacion: null,
      salarioMin: 500,
      salarioMax: 900,
      tipoContrato: null,
      objetivo: null,
      grupoId: null,
      fechaLimite: new Date('2026-12-01T00:00:00Z'),
      cupos: 1,
      estado: 'publicada',
    });

    expect(db.query.mock.calls[0][0] as string).toContain('INSERT INTO oferta');
    expect(r.oferta.id).toBe(rowBase.id);
  });

  it('actualizar genera SET solo con los campos presentes', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [rowBase] } as never);

    await repo.actualizar(rowBase.id, { titulo: 'Editado', salarioMin: 600 });

    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toMatch(/titulo = \$2, salario_min = \$3/);
  });

  it('cambiarEstado persiste el estado destino', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [rowBase] } as never);

    await repo.cambiarEstado(rowBase.id, 'cerrada');

    expect(db.query.mock.calls[0][1] as unknown[]).toEqual([rowBase.id, 'cerrada']);
  });
});

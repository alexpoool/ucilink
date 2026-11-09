import { AspiranteRepositoryImpl } from '@/features/aspirante/infrastructure/repositories/aspirante.repository.impl';
import { Database } from '@/config/db';
import { Aspirante } from '@/features/aspirante/domain/aspirante.entity';

const fila = {
  id: '66666666-6666-6666-6666-666666666666',
  usuario_id: '11111111-1111-1111-1111-111111111111',
  nombre: 'Brisa',
  apellido: 'Casas',
  telefono: '+53 5',
  carrera: 'Informática',
  semestre: 6,
  bio: null,
  habilidades: ['React', 'TS'],
  linkedin_url: null,
  github_url: null,
  portafolio_url: null,
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-01-01T00:00:00Z'),
};

describe('AspiranteRepositoryImpl', () => {
  let db: jest.Mocked<Database>;
  let repo: AspiranteRepositoryImpl;

  beforeEach(() => {
    db = { query: jest.fn(), transaction: jest.fn() } as jest.Mocked<Database>;
    repo = new AspiranteRepositoryImpl(db);
  });

  it('buscarPorUsuarioId mapea snake_case → entidad de dominio', async () => {
    db.query.mockResolvedValue({ rows: [fila] } as never);

    const aspirante: Aspirante | null = await repo.buscarPorUsuarioId(fila.usuario_id);

    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM aspirante WHERE usuario_id = $1'), [
      fila.usuario_id,
    ]);
    expect(aspirante?.habilidades).toEqual(['React', 'TS']);
    expect(aspirante?.linkedinUrl).toBeNull();
    expect(aspirante?.createdAt).toEqual(fila.created_at);
  });

  it('buscarPorId devuelve null sin filas', async () => {
    db.query.mockResolvedValue({ rows: [] } as never);
    expect(await repo.buscarPorId(fila.id)).toBeNull();
  });

  it('crear inserta con arrays TEXT[] y devuelve RETURNING mapeado', async () => {
    db.query.mockResolvedValue({ rows: [fila] } as never);

    await repo.crear(
      {
        nombre: 'Brisa',
        apellido: 'Casas',
        telefono: '+53 5',
        carrera: 'Informática',
        semestre: 6,
        bio: null,
        habilidades: ['React', 'TS'],
        linkedinUrl: null,
        githubUrl: null,
        portafolioUrl: null,
      },
      fila.usuario_id,
    );

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO aspirante'),
      expect.arrayContaining([fila.usuario_id, ['React', 'TS']]),
    );
  });

  it('actualizar genera SET solo con campos presentes (parametrizados)', async () => {
    db.query.mockResolvedValue({ rows: [fila] } as never);

    await repo.actualizar(fila.id, { bio: 'nueva', semestre: 7 });

    const [, params] = db.query.mock.calls[0] as [string, unknown[]];
    expect(db.query.mock.calls[0][0] as string).toMatch(/SET bio = \$2, semestre = \$3/);
    expect(params?.[0]).toBe(fila.id);
    expect(params?.[1]).toBe('nueva');
    expect(params?.[2]).toBe(7);
    expect(db.query.mock.calls[0][0] as string).toContain('RETURNING');
  });
});

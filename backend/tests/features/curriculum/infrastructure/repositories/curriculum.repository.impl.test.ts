import { CurriculumRepositoryImpl } from '@/features/curriculum/infrastructure/repositories/curriculum.repository.impl';
import { Database } from '@/config/db';

const fila = {
  id: '66666666-6666-6666-6666-666666666666',
  aspirante_id: '55555555-5555-5555-5555-555555555555',
  titulo: 'Full-stack junior',
  resumen: 'TS + Node',
  educacion: [{ titulo: 'Lic.', institucion: 'UCI', desde: '2022-09-01', hasta: null }],
  experiencia: [],
  proyectos: [],
  habilidades: ['TS'],
  idiomas: [],
  cv_pdf_url: null,
  es_principal: true,
  visible: true,
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-01-01T00:00:00Z'),
};

describe('CurriculumRepositoryImpl', () => {
  let db: jest.Mocked<Database>;
  let repo: CurriculumRepositoryImpl;

  beforeEach(() => {
    db = { query: jest.fn(), transaction: jest.fn() } as jest.Mocked<Database>;
    repo = new CurriculumRepositoryImpl(db);
  });

  it('listarPorAspiranteId mapea JSONB a tipos de dominio', async () => {
    db.query.mockResolvedValue({ rows: [fila] } as never);

    const lista = await repo.listarPorAspiranteId(fila.aspirante_id);

    expect(lista[0].educacion[0].institucion).toBe('UCI');
    expect(lista[0].habilidades).toEqual(['TS']);
    expect(lista[0].createdAt).toEqual(fila.created_at);
  });

  it('crear stringify los bloques JSONB y hora es_primero como es_principal', async () => {
    db.query.mockResolvedValue({ rows: [fila] } as never);

    await repo.crear(
      {
        titulo: 'Full-stack junior',
        resumen: 'TS + Node',
        educacion: [{ titulo: 'Lic.', institucion: 'UCI', desde: '2022-09-01', hasta: null }],
        experiencia: [],
        proyectos: [],
        habilidades: ['TS'],
        idiomas: [],
        cvPdfUrl: null,
        visible: true,
      },
      fila.aspirante_id,
      true,
    );

    const [, params] = db.query.mock.calls[0] as [string, unknown[]];
    expect(params?.[1]).toBe(true); // es_principal = esPrimero
    expect(params?.[3]).toBe(JSON.stringify(fila.educacion)); // educacion stringify
    expect(db.query.mock.calls[0][0] as string).toContain('$4::jsonb');
  });

  it('actualizar usa ::jsonb en campos anidados y snake_map para URLs', async () => {
    db.query.mockResolvedValue({ rows: [fila] } as never);

    await repo.actualizar(fila.id, { cvPdfUrl: 'https://x/y.pdf', habilidades: ['TS'] });

    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toMatch(/cv_pdf_url = \$2/);
    expect(sql).toMatch(/habilidades = \$3::jsonb/);
    const [, params] = db.query.mock.calls[0] as [string, unknown[]];
    expect(params?.[1]).toBe('https://x/y.pdf'); // cv_pdf_url NO es JSON: string plano
    expect(params?.[2]).toBe('["TS"]'); // habilidades SÍ: stringified jsonb
  });

  it('marcarComoPrincipal actualiza EXCLUSIVIDAD con expresión (id = $1)', async () => {
    db.query.mockResolvedValue({ rows: [] } as never);

    await repo.marcarComoPrincipal(fila.id, fila.aspirante_id);

    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toContain('es_principal = (id = $1)');
    expect(db.query.mock.calls[0][1] as unknown[]).toEqual([fila.id, fila.aspirante_id]);
  });
});

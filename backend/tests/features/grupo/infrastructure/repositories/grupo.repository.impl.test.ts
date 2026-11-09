import { Database } from '@/config/db';
import { GrupoRepositoryImpl } from '@/features/grupo/infrastructure/repositories/grupo.repository.impl';

describe('GrupoRepositoryImpl', () => {
  let db: jest.Mocked<Database>;
  let repo: GrupoRepositoryImpl;

  const filaGrupo = {
    id: GRUPO_ID(),
    nombre: 'Equipo Flutter',
    descripcion: null,
    lider_id: '55555555-5555-5555-5555-555555555555',
    max_miembros: 3,
    estado: 'formando',
    created_at: new Date('2026-01-03T00:00:00Z'),
  };

  const filaMiembro = {
    id: '77777777-7777-7777-7777-777777777777',
    grupo_id: GRUPO_ID(),
    aspirante_id: '66666666-6666-6666-6666-666666666666',
    rol_en_grupo: 'dev',
    curriculum_id: null,
    estado: 'invitado',
    created_at: new Date('2026-01-03T00:00:00Z'),
  };

  function GRUPO_ID(): string {
    return '33333333-3333-3333-3333-333333333333';
  }

  beforeEach(() => {
    db = { query: jest.fn(), transaction: jest.fn() } as jest.Mocked<Database>;
    repo = new GrupoRepositoryImpl(db);
  });

  it('crear INSERTA grupo con max_miembros parametrizado', async () => {
    db.query.mockResolvedValueOnce({ rows: [filaGrupo] } as never);
    await repo.crear({ nombre: 'Equipo Flutter', descripcion: null, liderId: filaGrupo.lider_id, maxMiembros: 3 });
    const sql = db.query.mock.calls[0][0] as string;
    const params = db.query.mock.calls[0][1] as unknown[];
    expect(sql).toContain('INSERT INTO grupo (nombre, descripcion, lider_id, max_miembros)');
    expect(params).toEqual(['Equipo Flutter', null, filaGrupo.lider_id, 3]);
  });

  it('agregar resuelve conflicto UNIQUE(grupo,aspirante) con ON CONFLICT UPDATE', async () => {
    db.query.mockResolvedValueOnce({ rows: [filaMiembro] } as never);
    await repo.agregar(GRUPO_ID(), filaMiembro.aspirante_id, 'dev', null);
    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toContain('ON CONFLICT (grupo_id, aspirante_id) DO UPDATE');
  });

  it('listarMiosComoMiembro excluye rechazado/salido', async () => {
    db.query.mockResolvedValueOnce({ rows: [filaGrupo] } as never);
    await repo.listarMiosComoMiembro('mı');
    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toMatch(/estado IN \('aceptado', 'invitado'\)/);
  });

  it('contarMiembrosAceptados convierte COUNT string → number', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ total: '2' }] } as never);
    expect(await repo.contarMiembrosAceptados(GRUPO_ID())).toBe(2);
  });

  it('cambiarEstado de grupo y cambiarEstadoMiembro son SQL distintos', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [filaGrupo] } as never)
      .mockResolvedValueOnce({ rows: [filaMiembro] } as never);

    await repo.cambiarEstado(GRUPO_ID(), 'completo');
    await repo.cambiarEstadoMiembro(filaMiembro.id, 'aceptado');

    expect((db.query.mock.calls[0][0] as string)).toContain('UPDATE grupo SET estado = $2');
    expect((db.query.mock.calls[1][0] as string)).toContain('UPDATE grupo_miembro SET estado = $2');
    expect(db.query.mock.calls[1][1]).toEqual([filaMiembro.id, 'aceptado']);
  });
});

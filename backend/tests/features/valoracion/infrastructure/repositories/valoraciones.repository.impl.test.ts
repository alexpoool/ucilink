import { Database } from '@/config/db';
import { ValoracionesNucleo } from '@/features/valoracion/infrastructure/repositories/valoraciones.repository.impl';

// Gemelo del núcleo toggle (SQL real construido → mock del cliente transaccion).
describe('ValoracionesNucleo', () => {
  let db: jest.Mocked<Database>;
  let cliente: { query: jest.Mock };
  let nucleo: ValoracionesNucleo;

  beforeEach(() => {
    cliente = { query: jest.fn() };
    db = {
      query: jest.fn(),
      transaction: jest.fn().mockImplementation(async (fn) => fn(cliente as never)),
    } as unknown as jest.Mocked<Database>;
    nucleo = new ValoracionesNucleo(db);
  });

  it('INSERTA cuando no existía (tabla oferta, actor aspirante_id)', async () => {
    cliente.query.mockResolvedValueOnce({ rows: [] } as never); // SELECT previo

    const estado = await nucleo.toggle('oferta', 'asp-1', OFERTA_ID(), 'like');

    expect(estado).toBe('like');
    const insert = cliente.query.mock.calls[1];
    expect(insert[0] as string).toMatch(/INSERT INTO valoracion_oferta \(aspirante_id, oferta_id, reaccion\)/);
  });

  it('mismo reaccion previa → DELETE + estado ninguno (toggle OFF)', async () => {
    cliente.query.mockResolvedValueOnce({ rows: [{ reaccion: 'like' }] } as never);

    const estado = await nucleo.toggle('oferta', 'asp-1', OFERTA_ID(), 'like');

    expect(estado).toBe('ninguno');
    expect(cliente.query.mock.calls[1][0] as string).toMatch(/DELETE FROM valoracion_oferta/);
  });

  it('reaccion DISTINTA → UPDATE (like⇄dislike) en tabla empresa', async () => {
    cliente.query.mockResolvedValueOnce({ rows: [{ reaccion: 'like' }] } as never);

    const estado = await nucleo.toggle('curriculum_empresa', 'emp-1', CV_ID(), 'dislike');

    expect(estado).toBe('dislike');
    expect(cliente.query.mock.calls[1][0] as string).toMatch(/UPDATE valoracion_curriculum SET reaccion = \$3/);
  });

  it('contar separa like/dislike de la tabla correcta', async () => {
    db.query.mockResolvedValue({ rows: [{ likes: '3', dislikes: '1' }] } as never);

    const r = await nucleo.contar('curriculum_aspirante', CV_ID());

    expect((db.query.mock.calls[0][0] as string)).toContain('FROM valoracion_curriculum_aspirante');
    expect(r).toEqual({ likes: 3, dislikes: 1 });
  });
});

function OFERTA_ID(): string {
  return 'aaaa1111-0000-0000-0000-000000000001';
}
function CV_ID(): string {
  return 'aaaa1111-0000-0000-0000-000000000002';
}

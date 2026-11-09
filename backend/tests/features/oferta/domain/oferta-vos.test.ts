import { esCoherenteAutorTipo, tiposPorAutor } from '@/features/oferta/domain/tipo-oferta.vo';
import { puedeTransitar } from '@/features/oferta/domain/estado-oferta.vo';

// VOs = lógica de dominio pura. Test del CHECK espejado (3 cinturones).
describe('tipo-oferta.vo', () => {
  it('empresa puede publicar normal y dash', () => {
    expect(esCoherenteAutorTipo('empresa', 'normal')).toBe(true);
    expect(esCoherenteAutorTipo('empresa', 'dash')).toBe(true);
  });

  it('empresa NO puede publicar feat (regla crítica del CHECK)', () => {
    expect(esCoherenteAutorTipo('empresa', 'feat')).toBe(false);
  });

  it('aspirante SOLO puede publicar feat', () => {
    expect(esCoherenteAutorTipo('aspirante', 'feat')).toBe(true);
    expect(esCoherenteAutorTipo('aspirante', 'normal')).toBe(false);
    expect(esCoherenteAutorTipo('aspirante', 'dash')).toBe(false);
  });

  it('tiposPorAutor expone el dominio permitido', () => {
    expect(tiposPorAutor('empresa')).toEqual(['normal', 'dash']);
    expect(tiposPorAutor('aspirante')).toEqual(['feat']);
  });
});

describe('estado-oferta.vo (máquina)', () => {
  it('transiciones legales', () => {
    expect(puedeTransitar('borrador', 'publicada')).toBe(true);
    expect(puedeTransitar('publicada', 'cerrada')).toBe(true);
    expect(puedeTransitar('publicada', 'cancelada')).toBe(true);
    expect(puedeTransitar('cerrada', 'publicada')).toBe(true); // reactivación
  });

  it('transiciones ILEGALES (cancelada es terminal; no hay regresos desde cancelada)', () => {
    expect(puedeTransitar('cancelada', 'publicada')).toBe(false);
    expect(puedeTransitar('cancelada', 'cerrada')).toBe(false);
    expect(puedeTransitar('borrador', 'cerrada')).toBe(false); // saltos
    expect(puedeTransitar('cerrada', 'borrador')).toBe(false);
  });
});

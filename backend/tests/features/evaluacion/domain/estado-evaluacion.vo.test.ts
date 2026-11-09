import { puedeTransitarEvaluacion } from '@/features/evaluacion/domain/estado-evaluacion.vo';

describe('estado-evaluacion.vo (pipeline del producto)', () => {
  it('postulado → en_revision | rechazado | retirado', () => {
    expect(puedeTransitarEvaluacion('postulado', 'en_revision')).toBe(true);
    expect(puedeTransitarEvaluacion('postulado', 'rechazado')).toBe(true);
    expect(puedeTransitarEvaluacion('postulado', 'retirado')).toBe(true);
  });

  it('postulado NO salta directo a preseleccionado/fichado', () => {
    expect(puedeTransitarEvaluacion('postulado', 'preseleccionado')).toBe(false);
    expect(puedeTransitarEvaluacion('postulado', 'fichado')).toBe(false);
  });

  it('en_revision → preseleccionado | rechazado (no vuelta atrás)', () => {
    expect(puedeTransitarEvaluacion('en_revision', 'preseleccionado')).toBe(true);
    expect(puedeTransitarEvaluacion('en_revision', 'rechazado')).toBe(true);
    expect(puedeTransitarEvaluacion('en_revision', 'postulado')).toBe(false);
    expect(puedeTransitarEvaluacion('en_revision', 'retirado')).toBe(false); // aspirante solo retira postulado
  });

  it('preseleccionado → fichado | rechazado; terminales bloqueados', () => {
    expect(puedeTransitarEvaluacion('preseleccionado', 'fichado')).toBe(true);
    expect(puedeTransitarEvaluacion('preseleccionado', 'rechazado')).toBe(true);
    expect(puedeTransitarEvaluacion('fichado', 'rechazado')).toBe(false);
    expect(puedeTransitarEvaluacion('retirado', 'postulado')).toBe(false);
  });
});

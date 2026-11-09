// Espeja el enum estado_evaluacion de esquema.sql con su MÁQUINA DE ESTADOS.
// Pipeline del producto:
//   postulado → en_revision → preseleccionado → fichado | rechazado
//   postulado → retirado (acción del aspirante)
export type EstadoEvaluacion =
  | 'postulado'
  | 'en_revision'
  | 'preseleccionado'
  | 'fichado'
  | 'rechazado'
  | 'retirado';

const TRANSICIONES: Record<EstadoEvaluacion, readonly EstadoEvaluacion[]> = {
  postulado: ['en_revision', 'rechazado', 'retirado'],
  en_revision: ['preseleccionado', 'rechazado'],
  preseleccionado: ['fichado', 'rechazado'],
  fichado: [], // terminal
  rechazado: [], // terminal
  retirado: [], // terminal (única salida por aspirante desde postulado)
};

export function puedeTransitarEvaluacion(desde: EstadoEvaluacion, hacia: EstadoEvaluacion): boolean {
  return TRANSICIONES[desde].includes(hacia);
}

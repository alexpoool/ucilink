// Espeja el enum estado_grupo de esquema.sql.
export type EstadoGrupo = 'formando' | 'completo' | 'postulado' | 'cerrado';

const TRANSICIONES: Record<EstadoGrupo, readonly EstadoGrupo[]> = {
  formando: ['completo', 'postulado', 'cerrado'],
  completo: ['postulado', 'formando', 'cerrado'], // puede reabrirse si un miembro sale
  postulado: ['cerrado'], // ya aplicó: no aceptar cambios excepto cerrarlo
  cerrado: [],
};

export function puedeTransitarGrupo(desde: EstadoGrupo, hacia: EstadoGrupo): boolean {
  return TRANSICIONES[desde].includes(hacia);
}

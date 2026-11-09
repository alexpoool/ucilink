// Espeja el enum estado_oferta de esquema.sql con su máquina de transiciones.
export type EstadoOferta = 'borrador' | 'publicada' | 'cerrada' | 'cancelada';

const TRANSICIONES_VALIDAS: Record<EstadoOferta, readonly EstadoOferta[]> = {
  borrador: ['publicada'],
  publicada: ['cerrada', 'cancelada'],
  cerrada: ['publicada'], // reactivación por autor (o admin)
  cancelada: [], // terminal (solo la modifica admin re-publicando tras revisar)
};

export function puedeTransitar(desde: EstadoOferta, hacia: EstadoOferta): boolean {
  return TRANSICIONES_VALIDAS[desde].includes(hacia);
}

export const ESTADOS_VISIBLES_PUBLICO: readonly EstadoOferta[] = ['publicada'];

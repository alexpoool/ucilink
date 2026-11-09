// Espeja el enum tipo_oferta de esquema.sql.
export type TipoOferta = 'normal' | 'dash' | 'feat';

// Espeja el CHECK oferta_autor_tipo_coherente:
//   empresa  → normal | dash
//   aspirante → feat
export type AutorTipo = 'aspirante' | 'empresa';

const COHERENCIA: Record<AutorTipo, readonly TipoOferta[]> = {
  empresa: ['normal', 'dash'],
  aspirante: ['feat'],
};

export function tiposPorAutor(autorTipo: AutorTipo): readonly TipoOferta[] {
  return COHERENCIA[autorTipo];
}

export function esCoherenteAutorTipo(autorTipo: AutorTipo, tipo: TipoOferta): boolean {
  return COHERENCIA[autorTipo].includes(tipo);
}

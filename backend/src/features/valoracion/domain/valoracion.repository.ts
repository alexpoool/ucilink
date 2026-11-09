import { Reaccion, EstadoReaccion } from './reaccion.vo';
import { ResumenValoraciones } from './valoracion.entity';

// Tres tablas del MISMO patrón (oferta, curriculum de empresa, curriculum
// de aspirante): el toggle es simétrico — 1ª vez inserta · igual otra vez
// quita ('ninguno') · distinta reemplaza.
export interface ValoracionOfertaRepository {
  valorar(aspiranteId: string, ofertaId: string, reaccion: Reaccion): Promise<EstadoReaccion>;
  resumen(ofertaId: string): Promise<ResumenValoraciones>;
}

export interface ValoracionCurriculumRepository {
  valorar(empresaId: string, curriculumId: string, reaccion: Reaccion): Promise<EstadoReaccion>;
  resumen(curriculumId: string): Promise<ResumenValoraciones>;
}

export interface ValoracionCurriculumAspiranteRepository {
  valorar(
    aspiranteValoradorId: string,
    curriculumId: string,
    reaccion: Reaccion,
  ): Promise<EstadoReaccion>;
  resumen(curriculumId: string): Promise<ResumenValoraciones>;
}

export type { Reaccion, EstadoReaccion, ResumenValoraciones };

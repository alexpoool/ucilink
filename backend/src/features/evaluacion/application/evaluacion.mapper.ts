import { Evaluacion } from '../domain/evaluacion.entity';

// DTO de respuesta (para empresa y aspirante).
export interface EvaluacionDto {
  id: string;
  ofertaId: string;
  curriculumId: string;
  aspiranteId: string;
  estado: string;
  comentarioEmpresa: string | null;
  puntuacion: number | null;
  fechaPostulacion: string;
  fechaEvaluacion: string | null;
  evaluadoPorEmpresa: boolean;
}

export function mapearEvaluacion(e: Evaluacion): EvaluacionDto {
  return {
    id: e.id,
    ofertaId: e.ofertaId,
    curriculumId: e.curriculumId,
    aspiranteId: e.aspiranteId,
    estado: e.estado,
    comentarioEmpresa: e.comentarioEmpresa,
    puntuacion: e.puntuacion,
    fechaPostulacion: e.fechaPostulacion.toISOString(),
    fechaEvaluacion: e.fechaEvaluacion ? e.fechaEvaluacion.toISOString() : null,
    evaluadoPorEmpresa: e.evaluadoPorEmpresa,
  };
}

import { EstadoEvaluacion } from './estado-evaluacion.vo';

// Entidad pura. Espeja la tabla `evaluacion_curriculum` de esquema.sql.
// grupo_id marca postulación EN EQUIPO (dado por el feature grupo).
export interface Evaluacion {
  id: string;
  ofertaId: string;
  curriculumId: string;
  aspiranteId: string;
  grupoId: string | null;
  estado: EstadoEvaluacion;
  comentarioEmpresa: string | null;
  puntuacion: number | null; // 1..5 (CHECK en DB)
  fechaPostulacion: Date;
  fechaEvaluacion: Date | null;
  evaluadoPorEmpresa: boolean;
}

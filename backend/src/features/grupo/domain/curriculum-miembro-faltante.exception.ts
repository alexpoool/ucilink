import { HttpException } from '@/shared/domain/http.exception';

// 422: para postular el grupo a una oferta, TODO miembro aceptado necesita
// un curriculum_id asignado (evaluacion_curriculum.curriculum_id es NOT NULL).
export class CurriculumMiembroFaltanteException extends HttpException {
  constructor(nombre?: string) {
    super(
      nombre
        ? `${nombre} no tiene un currículum asignado para postular en equipo`
        : 'Todos los miembros necesitan currículum asignado antes de postular',
      422,
    );
  }
}

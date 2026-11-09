import { HttpException } from '@/shared/domain/http.exception';

// 404: evaluación no encontrada (o no pertenece a la oferta).
export class EvaluacionNoEncontradaException extends HttpException {
  constructor() {
    super('Postulación no encontrada', 404);
  }
}

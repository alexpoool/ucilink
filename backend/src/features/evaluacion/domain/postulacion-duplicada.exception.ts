import { HttpException } from '@/shared/domain/http.exception';

// 409: UNIQUE (oferta_id, curriculum_id) + guard temprano en el use-case.
export class PostulacionDuplicadaException extends HttpException {
  constructor() {
    super('Ya postulaste a esta oferta con este currículum', 409);
  }
}

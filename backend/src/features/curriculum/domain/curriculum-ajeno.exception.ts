import { HttpException } from '@/shared/domain/http.exception';

// 403: intentando editar/eliminar un CV que no es del aspirante del token.
export class CurriculumAjenoException extends HttpException {
  constructor() {
    super('No puedes modificar este currículum', 403);
  }
}

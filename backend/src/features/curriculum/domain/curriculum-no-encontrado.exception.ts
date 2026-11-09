import { HttpException } from '@/shared/domain/http.exception';

// 404 para CV inexistente O no visible (un CV oculto no es visible ni para SEO).
export class CurriculumNoEncontradoException extends HttpException {
  constructor() {
    super('Currículum no encontrado', 404);
  }
}

import { HttpException } from '@/shared/domain/http.exception';

// 404: grupo inexistente.
export class GrupoNoEncontradoException extends HttpException {
  constructor() {
    super('Grupo no encontrado', 404);
  }
}

import { HttpException } from '@/shared/domain/http.exception';

// 404 para perfiles de aspirante inexistentes.
export class AspiranteNoEncontradoException extends HttpException {
  constructor() {
    super('Perfil de aspirante no encontrado', 404);
  }
}

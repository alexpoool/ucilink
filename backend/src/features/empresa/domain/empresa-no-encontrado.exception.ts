import { HttpException } from '@/shared/domain/http.exception';

// 404 para perfiles de empresa inexistentes.
export class EmpresaNoEncontradaException extends HttpException {
  constructor() {
    super('Perfil de empresa no encontrado', 404);
  }
}

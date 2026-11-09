import { HttpException } from '@/shared/domain/http.exception';

// 409: el grupo alcanzó su max_miembros.
export class GrupoLlenoException extends HttpException {
  constructor() {
    super('El grupo está completo', 409);
  }
}

import { HttpException } from '@/shared/domain/http.exception';

// 403: solo el líder gestiona el grupo (invitar, postular, cerrar).
export class NoEsLiderException extends HttpException {
  constructor() {
    super('Solo el líder puede realizar esta acción', 403);
  }
}

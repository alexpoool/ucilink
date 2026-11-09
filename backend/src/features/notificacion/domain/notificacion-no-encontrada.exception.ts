import { HttpException } from '@/shared/domain/http.exception';

// 404: notificación inexistente o de OTRO usuario (protocolo no-revelar).
export class NotificacionNoEncontradaException extends HttpException {
  constructor() {
    super('Notificación no encontrada', 404);
  }
}

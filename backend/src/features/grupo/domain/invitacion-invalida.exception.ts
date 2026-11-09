import { HttpException } from '@/shared/domain/http.exception';

// 422: la invitación no está en estado 'invitado' o no es tuya.
export class InvitacionInvalidaException extends HttpException {
  constructor() {
    super('La invitación no es válida o ya fue respondida', 422);
  }
}

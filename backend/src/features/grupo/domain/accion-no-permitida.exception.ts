import { HttpException } from '@/shared/domain/http.exception';

// 422: acción inválida contra el estado actual (p.ej. líder intenta salir).
export class AccionNoPermitidaException extends HttpException {
  constructor(mensaje: string) {
    super(mensaje, 422);
  }
}

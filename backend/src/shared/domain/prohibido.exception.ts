import { HttpException } from './http.exception';

// 403: autenticado pero sin rol para la operación.
export class ProhibidoException extends HttpException {
  constructor(mensaje = 'No tienes permiso para esta acción') {
    super(mensaje, 403);
  }
}

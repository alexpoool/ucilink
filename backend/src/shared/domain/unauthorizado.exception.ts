import { HttpException } from './http.exception';

// 401: falta autenticación o el token no es válido.
export class UnauthorizadoException extends HttpException {
  constructor() {
    super('No autenticado', 401);
  }
}

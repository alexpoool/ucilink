import { HttpException } from '@/shared/domain/http.exception';

// Lanzada en registro cuando el email ya tiene un usuario (409).
export class EmailYaRegistradoException extends HttpException {
  constructor(email: string) {
    super(`El email ${email} ya está registrado`, 409);
  }
}

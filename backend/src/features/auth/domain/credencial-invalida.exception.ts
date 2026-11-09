import { HttpException } from '@/shared/domain/http.exception';

// Lanzada cuando email no existe o el hash no coincide (público: 401).
export class CredencialInvalidaException extends HttpException {
  constructor() {
    super('Email o contraseña incorrectos', 401);
  }
}

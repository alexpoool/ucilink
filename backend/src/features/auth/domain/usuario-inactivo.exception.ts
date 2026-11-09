import { HttpException } from '@/shared/domain/http.exception';

// Lanzada cuando el usuario existe y la clave coincide, pero el admin lo suspendió.
export class UsuarioInactivoException extends HttpException {
  constructor() {
    super('El usuario está suspendido. Contacta al administrador.', 403);
  }
}

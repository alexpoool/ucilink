import { HttpException } from '@/shared/domain/http.exception';

// Lanzada si el usuario ya tiene perfil (usuario_id es UNIQUE en esquema.sql).
export class PerfilYaExisteException extends HttpException {
  constructor() {
    super('El usuario ya tiene un perfil', 409);
  }
}

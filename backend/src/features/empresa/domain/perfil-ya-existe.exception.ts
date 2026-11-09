import { HttpException } from '@/shared/domain/http.exception';

// usuario_id es UNIQUE en esquema.sql: un segundo intento → 409.
export class PerfilEmpresaYaExisteException extends HttpException {
  constructor() {
    super('El usuario ya tiene un perfil de empresa', 409);
  }
}

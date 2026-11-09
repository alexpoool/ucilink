import { HttpException } from '@/shared/domain/http.exception';

// 400: tipo mime no permitido o archivo que excede UPLOADS_MAX_BYTES.
export class ArchivoInvalidoException extends HttpException {
  constructor(motivo: string) {
    super(`Archivo inválido: ${motivo}`, 400);
  }
}

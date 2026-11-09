import { HttpException } from '@/shared/domain/http.exception';

// 422: transición ilegal según estado-grupo.vo.
export class TransicionGrupoInvalidaException extends HttpException {
  constructor(desde: string, hacia: string) {
    super(`No se puede pasar de "${desde}" a "${hacia}"`, 422);
  }
}

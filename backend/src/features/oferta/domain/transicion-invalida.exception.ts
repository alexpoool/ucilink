import { HttpException } from '@/shared/domain/http.exception';

// 422: transición de estado_oferta no permitida por el VO.
export class TransicionOfertaInvalidaException extends HttpException {
  constructor(desde: string, hacia: string) {
    super(`No se puede pasar de estado "${desde}" a "${hacia}"`, 422);
  }
}

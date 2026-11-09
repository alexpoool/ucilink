import { HttpException } from '@/shared/domain/http.exception';

// 422: transición no permitida por el VO de estados.
export class TransicionInvalidaException extends HttpException {
  constructor(desde: string, hacia: string) {
    super(`No se puede pasar de "${desde}" a "${hacia}"`, 422);
  }
}

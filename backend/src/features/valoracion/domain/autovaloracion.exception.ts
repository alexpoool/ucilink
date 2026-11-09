import { HttpException } from '@/shared/domain/http.exception';

// 403: no puedes valorar TU PROPIO CV (ni tu propia oferta feat).
export class AutopercepcionNoPermitidaException extends HttpException {
  constructor(objeto: string) {
    super(`No puedes valorar tu propio ${objeto}`, 409);
  }
}

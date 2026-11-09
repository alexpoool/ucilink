import { HttpException } from '@/shared/domain/http.exception';

// 403: el intentante NO es el autor (ni admin) de la oferta.
export class NoEsAutorDeOfertaException extends HttpException {
  constructor() {
    super('Solo el autor puede modificar esta oferta', 403);
  }
}

import { HttpException } from '@/shared/domain/http.exception';

// 404 para ofertas inexistentes (o no visibles en el feed público).
export class OfertaNoEncontradaException extends HttpException {
  constructor() {
    super('Oferta no encontrada', 404);
  }
}

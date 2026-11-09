import { Request, Response, NextFunction } from 'express';
import { ListarOfertasFeedUseCase } from '@/features/oferta/application/use-cases/listar-ofertas-feed.use-case';
import { ObtenerOfertaPublicaUseCase } from '@/features/oferta/application/use-cases/obtener-oferta-publica.use-case';

// Controllers de oferta. Cada archivo = un controller; este cubre los
// endpoints PÚBLICOS (feed + detalle), la base SEO del webapp.
export class OfertaPublicaController {
  constructor(
    private readonly feed: ListarOfertasFeedUseCase,
    private readonly detalle: ObtenerOfertaPublicaUseCase,
  ) {}

  async feed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ofertas = await this.feed.execute(req.query);
      res.status(200).json(ofertas);
    } catch (error) {
      next(error);
    }
  }

  async detalle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const oferta = await this.detalle.execute({ ofertaId: req.params.ofertaId });
      res.status(200).json(oferta);
    } catch (error) {
      next(error);
    }
  }
}

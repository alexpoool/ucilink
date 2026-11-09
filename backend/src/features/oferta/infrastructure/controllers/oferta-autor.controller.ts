import { Request, Response, NextFunction } from 'express';
import { CrearOfertaUseCase } from '@/features/oferta/application/use-cases/crear-oferta.use-case';
import { ActualizarOfertaUseCase } from '@/features/oferta/application/use-cases/actualizar-oferta.use-case';
import { CambiarEstadoOfertaUseCase } from '@/features/oferta/application/use-cases/cambiar-estado-oferta.use-case';

// Controller de oferta del AUTOR (empresa o aspirante). Solo traduce HTTP;
// la resolución del perfil del autor la hace el use-case con los puertos
// de los features de perfiles (nunca lógica en controller).
export class OfertaAutorController {
  constructor(
    private readonly crear: CrearOfertaUseCase,
    private readonly actualizar: ActualizarOfertaUseCase,
    private readonly cambiarEstado: CambiarEstadoOfertaUseCase,
  ) {}

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const oferta = await this.crear.execute({ ...req.body, usuarioId: req.usuario!.id, rol: req.usuario!.rol });
      res.status(201).json(oferta);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const oferta = await this.actualizar.execute({
        ...req.body,
        usuarioId: req.usuario!.id,
        ofertaId: req.params.ofertaId,
      });
      res.status(200).json(oferta);
    } catch (error) {
      next(error);
    }
  }

  async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const oferta = await this.cambiarEstado.execute({
        ...req.body,
        usuarioId: req.usuario!.id,
        ofertaId: req.params.ofertaId,
        esAdmin: false,
      });
      res.status(200).json(oferta);
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { ListarNotificacionesUseCase } from '@/features/notificacion/application/use-cases/listar-notificaciones.use-case';
import { MarcarLeidaUseCase, MarcarTodasLeidasUseCase } from '@/features/notificacion/application/use-cases/marcar-leida.use-case';

// Controller de notificaciones: el usuario_id SIEMPRE viene del token.
export class NotificacionController {
  constructor(
    private readonly listar: ListarNotificacionesUseCase,
    private readonly marcarLeida: MarcarLeidaUseCase,
    private readonly marcarTodas: MarcarTodasLeidasUseCase,
  ) {}

  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const salida = await this.listar.execute({
        usuarioId: req.usuario!.id,
        soloNoLeidas: req.query.solo_no_leidas === 'true',
      });
      res.status(200).json(salida);
    } catch (error) {
      next(error);
    }
  }

  async marcarUna(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await this.marcarLeida.execute({
        notificacionId: req.params.notificacionId,
        usuarioId: req.usuario!.id,
      });
      res.status(200).json(dto);
    } catch (error) {
      next(error);
    }
  }

  async marcarTodas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const salida = await this.marcarTodas.execute({ usuarioId: req.usuario!.id });
      res.status(200).json(salida);
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { CrearPerfilAspiranteUseCase } from '@/features/aspirante/application/use-cases/crear-perfil-aspirante.use-case';
import { ObtenerPerfilAspiranteUseCase } from '@/features/aspirante/application/use-cases/obtener-perfil-aspirante.use-case';
import { ActualizarPerfilAspiranteUseCase } from '@/features/aspirante/application/use-cases/actualizar-perfil-aspirante.use-case';

// Controller de aspirante: SOLO traduce HTTP ↔ use-cases. El usuario del token
// (req.usuario) es agregado por requireAuth/requireRol, no por este archivo.
export class AspiranteController {
  constructor(
    private readonly crearPerfil: CrearPerfilAspiranteUseCase,
    private readonly obtenerPerfil: ObtenerPerfilAspiranteUseCase,
    private readonly actualizarPerfil: ActualizarPerfilAspiranteUseCase,
  ) {}

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const perfil = await this.crearPerfil.execute({
        ...req.body,
        usuarioId: req.usuario!.id,
      });
      res.status(201).json(perfil);
    } catch (error) {
      next(error);
    }
  }

  async obtener(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const perfil = await this.obtenerPerfil.execute({ usuarioId: req.usuario!.id });
      res.status(200).json(perfil);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const perfil = await this.actualizarPerfil.execute({
        ...req.body,
        usuarioId: req.usuario!.id,
      });
      res.status(200).json(perfil);
    } catch (error) {
      next(error);
    }
  }
}

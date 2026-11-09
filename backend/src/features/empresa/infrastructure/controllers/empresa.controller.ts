import { Request, Response, NextFunction } from 'express';
import { CrearPerfilEmpresaUseCase } from '@/features/empresa/application/use-cases/crear-perfil-empresa.use-case';
import { ObtenerPerfilEmpresaUseCase } from '@/features/empresa/application/use-cases/obtener-perfil-empresa.use-case';
import { ActualizarPerfilEmpresaUseCase } from '@/features/empresa/application/use-cases/actualizar-perfil-empresa.use-case';
import { ObtenerMetricasEmpresaUseCase } from '@/features/empresa/application/use-cases/obtener-metricas-empresa.use-case';

// Controller de empresa: solo traducción HTTP ↔ use-cases.
export class EmpresaController {
  constructor(
    private readonly crearPerfil: CrearPerfilEmpresaUseCase,
    private readonly obtenerPerfil: ObtenerPerfilEmpresaUseCase,
    private readonly actualizarPerfil: ActualizarPerfilEmpresaUseCase,
    private readonly obtenerMetricas: ObtenerMetricasEmpresaUseCase,
  ) {}

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const perfil = await this.crearPerfil.execute({ ...req.body, usuarioId: req.usuario!.id });
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
      const perfil = await this.actualizarPerfil.execute({ ...req.body, usuarioId: req.usuario!.id });
      res.status(200).json(perfil);
    } catch (error) {
      next(error);
    }
  }

  async metricas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metricas = await this.obtenerMetricas.execute({ usuarioId: req.usuario!.id });
      res.status(200).json(metricas);
    } catch (error) {
      next(error);
    }
  }
}

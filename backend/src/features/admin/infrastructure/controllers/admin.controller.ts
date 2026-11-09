import { Request, Response, NextFunction } from 'express';
import { ObtenerMetricasUseCase } from '@/features/admin/application/use-cases/obtener-metricas.use-case';
import { ListarEmpresasPendientesUseCase } from '@/features/admin/application/use-cases/listar-empresas-pendientes.use-case';
import { VerificarEmpresaUseCase } from '@/features/admin/application/use-cases/verificar-empresa.use-case';
import { ListarOfertasAdminUseCase } from '@/features/admin/application/use-cases/listar-ofertas-admin.use-case';
import { CancelarOfertaAdminUseCase } from '@/features/admin/application/use-cases/cancelar-oferta-admin.use-case';

// Toda la surface exige rol 'admin' (eso ya lo garantiza la ruta).
export class AdminController {
  constructor(
    private readonly metricas: ObtenerMetricasUseCase,
    private readonly empresasPendientes: ListarEmpresasPendientesUseCase,
    private readonly verificarEmpresa: VerificarEmpresaUseCase,
    private readonly listarOfertas: ListarOfertasAdminUseCase,
    private readonly cancelarOferta: CancelarOfertaAdminUseCase,
  ) {}

  async obtenerMetricas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await this.metricas.execute({ adminId: req.usuario!.id }));
    } catch (error) {
      next(error);
    }
  }

  async listarEmpresasPendientes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await this.empresasPendientes.execute({ adminId: req.usuario!.id }));
    } catch (error) {
      next(error);
    }
  }

  async verificarEmpresa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const salida = await this.verificarEmpresa.execute({
        empresaId: req.params.empresaId,
        verificada: req.body.verificada,
      });
      res.status(200).json(salida);
    } catch (error) {
      next(error);
    }
  }

  async listarOfertas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const estado = (req.query.estado as string) || null;
      const lista = await this.listarOfertas.execute({ estado });
      res.status(200).json(lista);
    } catch (error) {
      next(error);
    }
  }

  async cancelarOferta(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const oferta = await this.cancelarOferta.execute({ ofertaId: req.params.ofertaId });
      res.status(200).json(oferta);
    } catch (error) {
      next(error);
    }
  }
}

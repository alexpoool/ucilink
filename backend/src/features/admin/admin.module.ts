import { Router } from 'express';
import { Database } from '@/config/db';
import { CreadorNotificaciones } from '@/shared/domain/creador-notificaciones.port';
import { EmpresaRepositoryImpl } from '@/features/empresa/infrastructure/repositories/empresa.repository.impl';
import { OfertaRepositoryImpl } from '@/features/oferta/infrastructure/repositories/oferta.repository.impl';
import { AdminRepositoryImpl } from './infrastructure/repositories/admin.repository.impl';
import { ObtenerMetricasUseCase } from './application/use-cases/obtener-metricas.use-case';
import { ListarEmpresasPendientesUseCase } from './application/use-cases/listar-empresas-pendientes.use-case';
import { VerificarEmpresaUseCase } from './application/use-cases/verificar-empresa.use-case';
import { ListarOfertasAdminUseCase } from './application/use-cases/listar-ofertas-admin.use-case';
import { CancelarOfertaAdminUseCase } from './application/use-cases/cancelar-oferta-admin.use-case';
import { AdminController } from './infrastructure/controllers/admin.controller';
import { adminRoutes } from './infrastructure/routes/admin.routes';

export function adminModule(db: Database, creadorNotificaciones: CreadorNotificaciones): Router {
  const adminRepository = new AdminRepositoryImpl(db);
  const empresaRepository = new EmpresaRepositoryImpl(db);
  const ofertaRepository = new OfertaRepositoryImpl(db);

  const metricas = new ObtenerMetricasUseCase(adminRepository);
  const empresasPendientes = new ListarEmpresasPendientesUseCase(adminRepository);
  const verificarEmpresa = new VerificarEmpresaUseCase(empresaRepository, creadorNotificaciones);
  const listarOfertas = new ListarOfertasAdminUseCase(adminRepository);
  const cancelarOferta = new CancelarOfertaAdminUseCase(ofertaRepository);

  const controller = new AdminController(
    metricas,
    empresasPendientes,
    verificarEmpresa,
    listarOfertas,
    cancelarOferta,
  );

  return adminRoutes(controller);
}

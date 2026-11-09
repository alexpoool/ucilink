import { Router } from 'express';
import { Database } from '@/config/db';
import { EmpresaRepositoryImpl } from './infrastructure/repositories/empresa.repository.impl';
import { MetricasRepositoryImpl } from './infrastructure/repositories/metricas.repository.impl';
import { CrearPerfilEmpresaUseCase } from './application/use-cases/crear-perfil-empresa.use-case';
import { ObtenerPerfilEmpresaUseCase } from './application/use-cases/obtener-perfil-empresa.use-case';
import { ActualizarPerfilEmpresaUseCase } from './application/use-cases/actualizar-perfil-empresa.use-case';
import { ObtenerMetricasEmpresaUseCase } from './application/use-cases/obtener-metricas-empresa.use-case';
import { EmpresaController } from './infrastructure/controllers/empresa.controller';
import { empresaRoutes } from './infrastructure/routes/empresa.routes';

// Wiring del feature empresa (DI por constructor).
export function empresaModule(db: Database): Router {
  const empresaRepository = new EmpresaRepositoryImpl(db);
  const metricasRepository = new MetricasRepositoryImpl(db);

  const crearPerfil = new CrearPerfilEmpresaUseCase(empresaRepository);
  const obtenerPerfil = new ObtenerPerfilEmpresaUseCase(empresaRepository);
  const actualizarPerfil = new ActualizarPerfilEmpresaUseCase(empresaRepository);
  const obtenerMetricas = new ObtenerMetricasEmpresaUseCase(empresaRepository, metricasRepository);

  const controller = new EmpresaController(
    crearPerfil,
    obtenerPerfil,
    actualizarPerfil,
    obtenerMetricas,
  );
  return empresaRoutes(controller);
}

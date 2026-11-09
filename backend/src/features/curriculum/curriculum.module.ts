import { Router } from 'express';
import { Database } from '@/config/db';
import { AspiranteRepositoryImpl } from '@/features/aspirante/infrastructure/repositories/aspirante.repository.impl';
import { CurriculumRepositoryImpl } from './infrastructure/repositories/curriculum.repository.impl';
import { CrearCurriculumUseCase } from './application/use-cases/crear-curriculum.use-case';
import { ListarMisCurriculosUseCase } from './application/use-cases/listar-mis-curriculos.use-case';
import { ObtenerCurriculumPublicoUseCase } from './application/use-cases/obtener-curriculum-publico.use-case';
import { ActualizarCurriculumUseCase } from './application/use-cases/actualizar-curriculum.use-case';
import { MarcarCurriculumPrincipalUseCase } from './application/use-cases/marcar-curriculum-principal.use-case';
import { CurriculumController } from './infrastructure/controllers/curriculum.controller';
import { curriculumRoutesPrivadas, curriculumRoutesPublicas } from './infrastructure/routes/curriculum.routes';

// Wiring del feature curriculum (DI por constructor).
// Cross-feature permitido: usa el PUERTO de dominio de aspirante
// (domain → domain); jamás su infraestructura.
export function curriculumModule(db: Database): {
  privadas: Router;
  publicas: Router;
} {
  const aspiranteRepository = new AspiranteRepositoryImpl(db);
  const curriculumRepository = new CurriculumRepositoryImpl(db);

  const crear = new CrearCurriculumUseCase(aspiranteRepository, curriculumRepository);
  const listarMios = new ListarMisCurriculosUseCase(aspiranteRepository, curriculumRepository);
  const obtenerPublico = new ObtenerCurriculumPublicoUseCase(aspiranteRepository, curriculumRepository);
  const actualizar = new ActualizarCurriculumUseCase(aspiranteRepository, curriculumRepository);
  const marcarPrincipal = new MarcarCurriculumPrincipalUseCase(
    aspiranteRepository,
    curriculumRepository,
  );

  const controller = new CurriculumController(
    crear,
    listarMios,
    obtenerPublico,
    actualizar,
    marcarPrincipal,
  );

  return {
    privadas: curriculumRoutesPrivadas(controller),
    publicas: curriculumRoutesPublicas(controller),
  };
}

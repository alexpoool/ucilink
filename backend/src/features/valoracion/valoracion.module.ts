import { Router } from 'express';
import { Database } from '@/config/db';
import { AspiranteRepositoryImpl } from '@/features/aspirante/infrastructure/repositories/aspirante.repository.impl';
import { EmpresaRepositoryImpl } from '@/features/empresa/infrastructure/repositories/empresa.repository.impl';
import { OfertaRepositoryImpl } from '@/features/oferta/infrastructure/repositories/oferta.repository.impl';
import { CurriculumRepositoryImpl } from '@/features/curriculum/infrastructure/repositories/curriculum.repository.impl';
import { ValoracionesNucleo, ValoracionOfertaRepositoryImpl, ValoracionCurriculumRepositoryImpl, ValoracionCurriculumAspiranteRepositoryImpl } from './infrastructure/repositories/valoraciones.repository.impl';
import { ValorarOfertaUseCase } from './application/use-cases/valorar-oferta.use-case';
import { ValorarCurriculumEmpresaUseCase, ValorarCurriculumAspiranteUseCase } from './application/use-cases/valorar-curriculum.use-case';
import { ValoracionController } from './infrastructure/controllers/valoracion.controller';
import { valoracionRoutes } from './infrastructure/routes/valoracion.routes';

// Wiring del feature valoracion. La UNA impl (ValoracionesRepositoryImpl)
// implementa los 3 puertos (misma semántica toggle en 3 tablas).
export function valoracionModule(db: Database): Router {
  const aspiranteRepository = new AspiranteRepositoryImpl(db);
  const empresaRepository = new EmpresaRepositoryImpl(db);
  const ofertaRepository = new OfertaRepositoryImpl(db);
  const curriculumRepository = new CurriculumRepositoryImpl(db);
  const nucleo = new ValoracionesNucleo(db);
  const valoracionOfertaRepo = new ValoracionOfertaRepositoryImpl(nucleo);
  const valoracionCvEmpresaRepo = new ValoracionCurriculumRepositoryImpl(nucleo);
  const valoracionCvAspiranteRepo = new ValoracionCurriculumAspiranteRepositoryImpl(nucleo);

  const valorarOferta = new ValorarOfertaUseCase(ofertaRepository, valoracionOfertaRepo);
  const valorarCvEmpresa = new ValorarCurriculumEmpresaUseCase(curriculumRepository, valoracionCvEmpresaRepo);
  const valorarCvAspirante = new ValorarCurriculumAspiranteUseCase(curriculumRepository, valoracionCvAspiranteRepo);

  const controller = new ValoracionController(
    valorarOferta,
    valorarCvEmpresa,
    valorarCvAspirante,
    aspiranteRepository,
    empresaRepository,
  );

  return valoracionRoutes(controller);
}

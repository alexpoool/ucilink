import { Router } from 'express';
import { Database } from '@/config/db';
import { CreadorNotificaciones } from '@/shared/domain/creador-notificaciones.port';
import { EmpresaRepositoryImpl } from '@/features/empresa/infrastructure/repositories/empresa.repository.impl';
import { AspiranteRepositoryImpl } from '@/features/aspirante/infrastructure/repositories/aspirante.repository.impl';
import { OfertaRepositoryImpl } from '@/features/oferta/infrastructure/repositories/oferta.repository.impl';
import { CurriculumRepositoryImpl } from '@/features/curriculum/infrastructure/repositories/curriculum.repository.impl';
import { EvaluacionRepositoryImpl } from './infrastructure/repositories/evaluacion.repository.impl';
import { PostularOfertaUseCase } from './application/use-cases/postular-oferta.use-case';
import { ListarPostulacionesDeOfertaUseCase } from './application/use-cases/listar-postulaciones-de-oferta.use-case';
import { ListarPostulacionesPropiasUseCase } from './application/use-cases/listar-postulaciones-propias.use-case';
import { EvaluarPostulacionUseCase } from './application/use-cases/evaluar-postulacion.use-case';
import { RetirarPostulacionUseCase } from './application/use-cases/retirar-postulacion.use-case';
import { EvaluacionController } from './infrastructure/controllers/evaluacion.controller';
import { evaluacionRoutes } from './infrastructure/routes/evaluacion.routes';

// Wiring del feature evaluacion. `creadorNotificaciones` es la implementación
// concreta del puert compartido; la construye el composition root (app.ts) a
// partir del impl del feature notificacion y se inyecta por aquí.
export function evaluacionModule(db: Database, creadorNotificaciones: CreadorNotificaciones): Router {
  const ofertaRepository = new OfertaRepositoryImpl(db);
  const curriculumRepository = new CurriculumRepositoryImpl(db);
  const aspiranteRepository = new AspiranteRepositoryImpl(db);
  const empresaRepository = new EmpresaRepositoryImpl(db);
  const evaluacionRepository = new EvaluacionRepositoryImpl(db);

  const postular = new PostularOfertaUseCase(
    ofertaRepository,
    curriculumRepository,
    aspiranteRepository,
    evaluacionRepository,
    empresaRepository,
    creadorNotificaciones,
  );

  const listarDeOferta = new ListarPostulacionesDeOfertaUseCase(ofertaRepository, evaluacionRepository);
  const listarPropias = new ListarPostulacionesPropiasUseCase(evaluacionRepository);
  const evaluar = new EvaluarPostulacionUseCase(ofertaRepository, evaluacionRepository);
  const retirar = new RetirarPostulacionUseCase(evaluacionRepository);

  const controller = new EvaluacionController(
    postular,
    listarDeOferta,
    listarPropias,
    evaluar,
    retirar,
    aspiranteRepository,
    empresaRepository,
  );

  return evaluacionRoutes(controller);
}

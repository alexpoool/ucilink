import { Router } from 'express';
import { Database } from '@/config/db';
import { CreadorNotificaciones } from '@/shared/domain/creador-notificaciones.port';
import { AspiranteRepositoryImpl } from '@/features/aspirante/infrastructure/repositories/aspirante.repository.impl';
import { OfertaRepositoryImpl } from '@/features/oferta/infrastructure/repositories/oferta.repository.impl';
import { CurriculumRepositoryImpl } from '@/features/curriculum/infrastructure/repositories/curriculum.repository.impl';
import { EmpresaRepositoryImpl } from '@/features/empresa/infrastructure/repositories/empresa.repository.impl';
import { EvaluacionRepositoryImpl } from '@/features/evaluacion/infrastructure/repositories/evaluacion.repository.impl';
import { GrupoRepositoryImpl } from './infrastructure/repositories/grupo.repository.impl';
import { CrearGrupoUseCase } from './application/use-cases/crear-grupo.use-case';
import { InvitarMiembroUseCase } from './application/use-cases/invitar-miembro.use-case';
import { ResponderInvitacionUseCase } from './application/use-cases/responder-invitacion.use-case';
import { SalirGrupoUseCase } from './application/use-cases/salir-grupo.use-case';
import { CerrarGrupoUseCase } from './application/use-cases/cerrar-grupo.use-case';
import { PostularGrupoOfertaUseCase } from './application/use-cases/postular-grupo-oferta.use-case';
import { ListarGruposPropiosUseCase } from './application/use-cases/listar-grupos-propios.use-case';
import { GrupoController } from './infrastructure/controllers/grupo.controller';
import { grupoRoutes } from './infrastructure/routes/grupo.routes';

// Wiring del feature grupo. cruza 3 dominios por sus PUERTOS (oferta,
// evaluacion, curriculum) + el puerto compartido de notificaciones —
// la implementación concreta llega inyectada desde app.ts.
export function grupoModule(db: Database, creadorNotificaciones: CreadorNotificaciones): Router {
  const aspiranteRepository = new AspiranteRepositoryImpl(db);
  const ofertaRepository = new OfertaRepositoryImpl(db);
  const curriculumRepository = new CurriculumRepositoryImpl(db);
  const empresaRepository = new EmpresaRepositoryImpl(db);
  const evaluacionRepository = new EvaluacionRepositoryImpl(db);
  const grupoRepository = new GrupoRepositoryImpl(db);

  const crearGrupo = new CrearGrupoUseCase(aspiranteRepository, grupoRepository, grupoRepository);
  const invitarMiembro = new InvitarMiembroUseCase(
    grupoRepository,
    grupoRepository,
    aspiranteRepository,
    creadorNotificaciones,
  );
  const responderInvitacion = new ResponderInvitacionUseCase(grupoRepository, grupoRepository);
  const salirGrupo = new SalirGrupoUseCase(grupoRepository, grupoRepository);
  const cerrarGrupo = new CerrarGrupoUseCase(grupoRepository);
  const postularGrupo = new PostularGrupoOfertaUseCase(
    grupoRepository,
    grupoRepository,
    ofertaRepository,
    evaluacionRepository,
    curriculumRepository,
    empresaRepository,
    creadorNotificaciones,
  );
  const listarPropios = new ListarGruposPropiosUseCase(grupoRepository);

  const controller = new GrupoController(
    crearGrupo,
    invitarMiembro,
    responderInvitacion,
    salirGrupo,
    cerrarGrupo,
    postularGrupo,
    listarPropios,
    aspiranteRepository,
  );

  return grupoRoutes(controller);
}

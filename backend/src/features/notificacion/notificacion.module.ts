import { Router } from 'express';
import { Database } from '@/config/db';
import { NotificacionRepositoryImpl } from './infrastructure/repositories/notificacion.repository.impl';
import { ListarNotificacionesUseCase } from './application/use-cases/listar-notificaciones.use-case';
import { MarcarLeidaUseCase, MarcarTodasLeidasUseCase } from './application/use-cases/marcar-leida.use-case';
import { NotificacionController } from './infrastructure/controllers/notificacion.controller';
import { notificacionRoutes } from './infrastructure/routes/notificacion.routes';

export function notificacionModule(db: Database): Router {
  const notificacionRepository = new NotificacionRepositoryImpl(db);

  const listar = new ListarNotificacionesUseCase(notificacionRepository);
  const marcarLeida = new MarcarLeidaUseCase(notificacionRepository);
  const marcarTodas = new MarcarTodasLeidasUseCase(notificacionRepository);

  const controller = new NotificacionController(listar, marcarLeida, marcarTodas);

  return notificacionRoutes(controller);
}

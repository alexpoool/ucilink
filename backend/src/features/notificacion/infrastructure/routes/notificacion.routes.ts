import { Router } from 'express';
import { requireAuth } from '@/shared/infrastructure/middlewares/auth.middleware';
import { NotificacionController } from '../controllers/notificacion.controller';

// Montajes (cualquier rol autenticado):
//  GET   /api/notificaciones
//  GET   /api/notificaciones?solo_no_leidas=true
//  PATCH /api/notificaciones/:notificacionId/leida
//  PATCH /api/notificaciones/leer-todas
export function notificacionRoutes(controller: NotificacionController): Router {
  const router = Router();

  router.use('/', requireAuth);

  router.get('/', (req, res, next) => controller.listar(req, res, next));
  router.patch('/leer-todas', (req, res, next) => controller.marcarTodas(req, res, next));
  router.patch('/:notificacionId/leida', (req, res, next) => controller.marcarUna(req, res, next));

  return router;
}

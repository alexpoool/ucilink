import { Router } from 'express';
import { requireAuth, requireRol } from '@/shared/infrastructure/middlewares/auth.middleware';
import { GrupoController } from '../controllers/grupo.controller';

// Montajes del feature grupo (todos rol aspirante):
//  POST   /api/aspirante/grupos                          (crear; líder = token)
//  GET    /api/aspirante/grupos                          (propios)
//  POST   /api/aspirante/grupos/:grupoId/miembros        (invitar)
//  PATCH  /api/aspirante/grupos/:grupoId/invitacion      (responder invitación)
//  PATCH  /api/aspirante/grupos/:grupoId/salir           (miembro sale)
//  PATCH  /api/aspirante/grupos/:grupoId/cerrar          (líder cierra)
//  POST   /api/aspirante/grupos/:grupoId/postulaciones   (ofertaId en body)
export function grupoRoutes(controller: GrupoController): Router {
  const router = Router();

  router.use('/aspirante/grupos', requireAuth, requireRol('aspirante'));

  router.post('/', (req, res, next) => controller.crear(req, res, next));
  router.get('/', (req, res, next) => controller.listar(req, res, next));

  router.post('/:grupoId/miembros', (req, res, next) => controller.invitar(req, res, next));
  router.patch('/:grupoId/invitacion', (req, res, next) => controller.responderInvitacion(req, res, next));
  router.patch('/:grupoId/salir', (req, res, next) => controller.salir(req, res, next));
  router.patch('/:grupoId/cerrar', (req, res, next) => controller.cerrar(req, res, next));
  router.post('/:grupoId/postulaciones', (req, res, next) => controller.postular(req, res, next));

  return router;
}

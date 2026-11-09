import { Router } from 'express';
import { requireAuth, requireRol } from '@/shared/infrastructure/middlewares/auth.middleware';
import { EvaluacionController } from '../controllers/evaluacion.controller';

// Montajes del feature evaluacion:
//  aspirante: POST /api/ofertas/:ofertaId/postulaciones (individual o grupo),
//             GET /api/aspirante/postulaciones, PATCH retirar
//  empresa:   GET  /api/empresa/ofertas/:ofertaId/postulaciones,
//             PATCH /api/empresa/evaluaciones/... (avanza el pipeline)
export function evaluacionRoutes(controller: EvaluacionController): Router {
  const router = Router();

  router.use('/ofertas/:ofertaId/postulaciones', requireAuth);
  router.post('/ofertas/:ofertaId/postulaciones', requireRol('aspirante'), (req, res, next) =>
    controller.crear(req, res, next),
  );

  router.get(
    '/empresa/ofertas/:ofertaId/postulaciones',
    requireAuth,
    requireRol('empresa'),
    (req, res, next) => controller.listarDeOferta(req, res, next),
  );

  router.patch(
    '/empresa/ofertas/:ofertaId/evaluaciones/:evaluacionId',
    requireAuth,
    requireRol('empresa'),
    (req, res, next) => controller.evaluar(req, res, next),
  );

  router.get('/aspirante/postulaciones', requireAuth, requireRol('aspirante'), (req, res, next) =>
    controller.propias(req, res, next),
  );

  router.patch('/aspirante/postulaciones/:evaluacionId/retirar', requireAuth, requireRol('aspirante'), (req, res, next) =>
    controller.retirar(req, res, next),
  );

  return router;
}

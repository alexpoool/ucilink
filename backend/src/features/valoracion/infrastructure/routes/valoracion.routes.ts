import { Router } from 'express';
import { requireAuth, requireRol } from '@/shared/infrastructure/middlewares/auth.middleware';
import { ValoracionController } from '../controllers/valoracion.controller';

// Montajes del feature valoracion:
//  funcionalidad 7:  POST /api/ofertas/:ofertaId/valoraciones      (aspirante)
//  funcionalidad 8:  POST /api/aspirante/valoraciones/curriculos/:id (aspirante)
//  funcionalidad 8b: POST /api/empresa/valoraciones/curriculos/:id  (empresa)
export function valoracionRoutes(controller: ValoracionController): Router {
  const router = Router();

  router.post(
    '/ofertas/:ofertaId/valoraciones',
    requireAuth,
    requireRol('aspirante'),
    (req, res, next) => controller.oferta(req, res, next),
  );

  router.post(
    '/empresa/valoraciones/curriculos/:curriculumId',
    requireAuth,
    requireRol('empresa'),
    (req, res, next) => controller.cvEmpresa(req, res, next),
  );

  router.post(
    '/aspirante/valoraciones/curriculos/:curriculumId',
    requireAuth,
    requireRol('aspirante'),
    (req, res, next) => controller.cvAspirante(req, res, next),
  );

  return router;
}

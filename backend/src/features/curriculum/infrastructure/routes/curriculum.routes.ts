import { Router } from 'express';
import { requireAuth, requireRol } from '@/shared/infrastructure/middlewares/auth.middleware';
import { CurriculumController } from '../controllers/curriculum.controller';

// Dos montajes:
//  - rutasPrivadas (/api/aspirante): dueño = token (requireAuth + aspirante).
//  - rutasPúblicas: GET /api/curriculos/:id (alimenta la página SEO /cvs/:id del webapp).
export function curriculumRoutesPrivadas(controller: CurriculumController): Router {
  const router = Router();
  router.use(requireAuth, requireRol('aspirante'));

  router.post('/curriculos', (req, res, next) => controller.crear(req, res, next));
  router.get('/curriculos', (req, res, next) => controller.listarPropios(req, res, next));
  router.put('/curriculos/:curriculumId', (req, res, next) => controller.actualizar(req, res, next));
  router.patch('/curriculos/:curriculumId/principal', (req, res, next) =>
    controller.principal(req, res, next),
  );

  return router;
}

export function curriculumRoutesPublicas(controller: CurriculumController): Router {
  const router = Router();
  router.get('/curriculos/:curriculumId', (req, res, next) => controller.publico(req, res, next));
  return router;
}

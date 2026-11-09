import { Router } from 'express';
import { requireAuth, requireRol } from '@/shared/infrastructure/middlewares/auth.middleware';
import { AspiranteController } from '../controllers/aspirante.controller';

// /api/aspirante — protegido por aspirante autenticado.
export function aspiranteRoutes(controller: AspiranteController): Router {
  const router = Router();
  router.use(requireAuth, requireRol('aspirante'));

  router.post('/perfil', (req, res, next) => controller.crear(req, res, next));
  router.get('/perfil', (req, res, next) => controller.obtener(req, res, next));
  router.put('/perfil', (req, res, next) => controller.actualizar(req, res, next));

  return router;
}

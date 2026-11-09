import { Router } from 'express';
import { requireAuth, requireRol } from '@/shared/infrastructure/middlewares/auth.middleware';
import { EmpresaController } from '../controllers/empresa.controller';

// /api/empresa — protegido por empresa autenticada.
export function empresaRoutes(controller: EmpresaController): Router {
  const router = Router();
  router.use(requireAuth, requireRol('empresa'));

  router.post('/perfil', (req, res, next) => controller.crear(req, res, next));
  router.get('/perfil', (req, res, next) => controller.obtener(req, res, next));
  router.put('/perfil', (req, res, next) => controller.actualizar(req, res, next));
  router.get('/metricas', (req, res, next) => controller.metricas(req, res, next));

  return router;
}

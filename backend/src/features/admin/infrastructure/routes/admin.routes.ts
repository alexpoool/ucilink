import { Router } from 'express';
import { requireAuth, requireRol } from '@/shared/infrastructure/middlewares/auth.middleware';
import { AdminController } from '../controllers/admin.controller';

// Panel admin (todas exigen rol 'admin'):
//  GET   /api/admin/metricas
//  GET   /api/admin/empresas/pendientes          (verificada = false)
//  PATCH /api/admin/empresas/:empresaId/verificar (body: { verificada: boolean })
//  GET   /api/admin/ofertas?estado=publicada     (moderación, todas)
//  PATCH /api/admin/ofertas/:ofertaId/cancelar
export function adminRoutes(controller: AdminController): Router {
  const router = Router();

  router.use('/', requireAuth, requireRol('admin'));

  router.get('/metricas', (req, res, next) => controller.obtenerMetricas(req, res, next));
  router.get('/empresas/pendientes', (req, res, next) => controller.listarEmpresasPendientes(req, res, next));
  router.patch('/empresas/:empresaId/verificar', (req, res, next) => controller.verificarEmpresa(req, res, next));
  router.get('/ofertas', (req, res, next) => controller.listarOfertas(req, res, next));
  router.patch('/ofertas/:ofertaId/cancelar', (req, res, next) => controller.cancelarOferta(req, res, next));

  return router;
}

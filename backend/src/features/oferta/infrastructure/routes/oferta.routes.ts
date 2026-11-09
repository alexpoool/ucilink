import { Router } from 'express';
import { requireAuth, requireRol } from '@/shared/infrastructure/middlewares/auth.middleware';
import { OfertaPublicaController } from '../controllers/oferta-publica.controller';
import { OfertaAutorController } from '../controllers/oferta-autor.controller';
import { OfertasPropiasController } from '../controllers/ofertas-propias.controller';

// 3 montajes para el feature oferta:
//   públicas (/api/ofertas)  · autor (/api/empresa/ofertas, /api/aspirante/ofertas-feat)
//   propias (/api/mis-ofertas para el dashboard de cada rol)
export function ofertaPublicasRoutes(controller: OfertaPublicaController): Router {
  const router = Router();
  router.get('/ofertas', (req, res, next) => controller.feed(req, res, next));
  router.get('/ofertas/:ofertaId', (req, res, next) => controller.detalle(req, res, next));
  return router;
}

export function ofertaAutorRoutes(controller: OfertaAutorController): Router {
  const router = Router();
  router.use(requireAuth);

  // Empresa: normal | dash (PUT + PATCH por id)
  router.post('/empresa/ofertas', requireRol('empresa'), (req, res, next) => controller.crear(req, res, next));
  router.put('/empresa/ofertas/:ofertaId', requireRol('empresa'), (req, res, next) =>
    controller.actualizar(req, res, next),
  );
  router.patch('/empresa/ofertas/:ofertaId/estado', requireRol('empresa'), (req, res, next) =>
    controller.cambiarEstado(req, res, next),
  );

  // Aspirante: feat
  router.post('/aspirante/ofertas-feat', requireRol('aspirante'), (req, res, next) =>
    controller.crear(req, res, next),
  );
  router.put('/aspirante/ofertas-feat/:ofertaId', requireRol('aspirante'), (req, res, next) =>
    controller.actualizar(req, res, next),
  );
  router.patch('/aspirante/ofertas-feat/:ofertaId/estado', requireRol('aspirante'), (req, res, next) =>
    controller.cambiarEstado(req, res, next),
  );

  return router;
}

export function ofertaPropiasRoutes(controller: OfertasPropiasController): Router {
  const router = Router();
  router.get('/mis-ofertas', requireAuth, (req, res, next) => controller.listado(req, res, next));
  return router;
}

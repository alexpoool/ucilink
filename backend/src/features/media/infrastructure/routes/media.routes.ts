import { Router } from 'express';
import multer from 'multer';
import { secrets } from '@/config/secrets';
import { requireAuth } from '@/shared/infrastructure/middlewares/auth.middleware';
import { MediaController } from '../controllers/media.controller';

// POST /api/media (autenticado). Límites mecánicos de multer (el DOBLE del
// máximo de producto actúa como amortiguador; la validación fina es del use-case).
export function mediaRoutes(controller: MediaController): Router {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: secrets.UPLOAD_MAX_BYTES },
    files: 1,
  });

  const router = Router();
  router.use(requireAuth);

  router.post('/', upload.single('archivo'), (req, res, next) => controller.subir(req, res, next));

  return router;
}

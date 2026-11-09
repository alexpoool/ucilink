import { Router } from 'express';
import { AuthController } from '@/features/auth/infrastructure/controllers/auth.controller';

export function authRoutes(controller: AuthController): Router {
  const router = Router();
  router.post('/login', (req, res, next) => controller.login(req, res, next));
  router.post('/registro', (req, res, next) => controller.registro(req, res, next));
  return router;
}

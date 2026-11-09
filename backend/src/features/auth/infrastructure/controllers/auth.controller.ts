import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '@/features/auth/application/use-cases/login.use-case';
import { RegistrarUsuarioUseCase } from '@/features/auth/application/use-cases/registrar-usuario.use-case';

// Controller de auth: SOLO traduce HTTP ↔ casos de uso. Sin lógica de negocio.
// `next` propaga errores (zod / HttpException) al error.middleware global.
export class AuthController {
  constructor(
    private readonly login: LoginUseCase,
    private readonly registro: RegistrarUsuarioUseCase,
  ) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const respuesta = await this.login.execute(req.body);
      res.status(200).json(respuesta);
    } catch (error) {
      next(error);
    }
  }

  async registro(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const respuesta = await this.registro.execute(req.body);
      res.status(201).json(respuesta);
    } catch (error) {
      next(error);
    }
  }
}

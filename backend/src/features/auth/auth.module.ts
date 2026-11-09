import { Router } from 'express';
import { Database } from '@/config/db';
import { UsuarioRepositoryImpl } from '@/features/auth/infrastructure/repositories/usuario.repository.impl';
import { BcryptService } from '@/shared/infrastructure/services/bcrypt.service';
import { JwtService } from '@/shared/infrastructure/services/jwt.service';
import { LoginUseCase } from '@/features/auth/application/use-cases/login.use-case';
import { RegistrarUsuarioUseCase } from '@/features/auth/application/use-cases/registrar-usuario.use-case';
import { AuthController } from '@/features/auth/infrastructure/controllers/auth.controller';
import { authRoutes } from '@/features/auth/infrastructure/routes/auth.routes';

// LA dosis de dependencias del feature auth (wiring/DI, sección 3.4).
// `app.ts` hace: router.use('/api/auth', authModule(db)).
export function authModule(db: Database): Router {
  const usuarioRepository = new UsuarioRepositoryImpl(db);
  const passwordHasher = new BcryptService();
  const tokenSigner = new JwtService();

  const loginUseCase = new LoginUseCase(usuarioRepository, passwordHasher, tokenSigner);
  const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(
    usuarioRepository,
    passwordHasher,
    tokenSigner,
  );

  const controller = new AuthController(loginUseCase, registrarUsuarioUseCase);
  return authRoutes(controller);
}

import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@/shared/infrastructure/services/jwt.service';
import { UnauthorizadoException } from '@/shared/domain/unauthorizado.exception';
import { ProhibidoException } from '@/shared/domain/prohibido.exception';
import { RolUsuario } from '@/features/auth/domain/rol.vo';

// Middlewares de autenticación/autorización. SOLO deciden "pasa o no pasa":
// resuelven el token y adjuntan el usuario al request. Sin lógica de negocio.
const jwtService = new JwtService();

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(new UnauthorizadoException());
    return;
  }

  try {
    const payload = jwtService.verificar(header.slice('Bearer '.length));
    req.usuario = { id: payload.id, rol: payload.rol as RolUsuario };
    next();
  } catch {
    next(new UnauthorizadoException());
  }
}

export function requireRol(...roles: RolUsuario[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      next(new UnauthorizadoException());
      return;
    }
    if (!roles.includes(req.usuario.rol)) {
      next(new ProhibidoException());
      return;
    }
    next();
  };
}

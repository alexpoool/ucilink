import { Request, Response, NextFunction } from 'express';

// Logger único: solo se emiten logs desde config/logs.ts.
import { logger } from '@/config/logs';

import { HttpException } from '@/shared/domain/http.exception';

// Middleware global de errores. Traduce excepciones → HTTP. Sin lógica de negocio.
export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof HttpException) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  // Errores de validación zod (lanzan ZodError).
  const isZodError = typeof error === 'object' && error !== null && 'issues' in error;
  if (isZodError) {
    const issues = (error as { issues: Array<{ path: (string | number)[]; message: string }> }).issues;
    res.status(400).json({
      message: 'Datos de entrada inválidos',
      errores: issues.map((i) => ({ campo: i.path.join('.'), detalle: i.message })),
    });
    return;
  }

  logger.error({ err: error instanceof Error ? error.stack : String(error) }, 'Error no controlado');
  res.status(500).json({ message: 'Error interno del servidor' });
}

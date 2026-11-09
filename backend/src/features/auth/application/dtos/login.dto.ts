import { z } from 'zod';

// DTO de entrada para POST /api/auth/login.
// La validación con zod vive en el DTO (regla 10 de AGENT.md), no en el controller.
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginDto = z.infer<typeof loginSchema>;

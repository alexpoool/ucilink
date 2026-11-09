import { z } from 'zod';

// DTO de entrada para POST /api/auth/registro.
// Solo roles registrables: admin no puede crearse por API pública.
// El perfil (aspirante/empresa) se crea después por su feature con su propio
// use-case; así auth no depiende de aspirante ni empresa.
export const registroSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede exceder 72 caracteres'),
  rol: z.enum(['aspirante', 'empresa']),
});

export type RegistroDto = z.infer<typeof registroSchema>;

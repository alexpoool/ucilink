declare global {
  // biome-ignore lint: augmentación global de Express para adjuntar el usuario autenticado
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        rol: 'aspirante' | 'empresa' | 'admin';
      };
    }
  }
}

export {};

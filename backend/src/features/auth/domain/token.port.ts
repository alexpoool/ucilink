// Puerto de firmado de tokens. La implementación concreta
// (JWT) vive en shared/infrastructure/services/jwt.service.ts.
export interface PayloadToken {
  id: string;
  rol: 'aspirante' | 'empresa' | 'admin';
}

export interface TokenSigner {
  firmar(payload: PayloadToken): Promise<string>;
}

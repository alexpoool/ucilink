import jwt, { SignOptions } from 'jsonwebtoken';
import { secrets } from '@/config/secrets';
import { TokenSigner, PayloadToken } from '@/features/auth/domain/token.port';

// Implementación concreta del puerto TokenSigner (JWT).
// Los secretos se leen SOLO desde config/secrets.ts.
export class JwtService implements TokenSigner {
  firmar(payload: PayloadToken): Promise<string> {
    const opciones: SignOptions = {
      expiresIn: secrets.JWT_EXPIRES_IN,
    } as SignOptions;
    const token = jwt.sign(payload, secrets.JWT_SECRET, opciones);
    return Promise.resolve(token);
  }

  verificar(token: string): PayloadToken {
    return jwt.verify(token, secrets.JWT_SECRET) as PayloadToken;
  }
}

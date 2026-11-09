import * as bcrypt from 'bcryptjs';
import { PasswordHasher } from '@/features/auth/domain/hash.port';

// Implementación concreta del puerto PasswordHasher (bcrypt, 10 rondas).
export class BcryptService implements PasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  comparar(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}

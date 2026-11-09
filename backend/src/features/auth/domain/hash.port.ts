// Puerto de hash de contraseñas. Implementación concreta (bcrypt)
// en shared/infrastructure/services/bcrypt.service.ts.
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  comparar(plain: string, hash: string): Promise<boolean>;
}

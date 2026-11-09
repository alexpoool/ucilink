import { UsuarioRepository, CrearUsuarioInput } from '@/features/auth/domain/auth.repository';
import { Usuario } from '@/features/auth/domain/usuario.entity';
import { RolUsuario } from '@/features/auth/domain/rol.vo';
import { Database } from '@/config/db';

// Implementación concreta del puerto UsuarioRepository con PostgreSQL (pg).
// Nunca sale de infrastructure: devuelve entidades de dominio puro.
export class UsuarioRepositoryImpl implements UsuarioRepository {
  constructor(private readonly db: Database) {}

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const result = await this.db.query<{
      id: string;
      email: string;
      rol: RolUsuario;
      activo: boolean;
      password_hash: string;
    }>('SELECT id, email, rol, activo, password_hash FROM usuario WHERE email = $1', [email]);

    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      rol: row.rol,
      activo: row.activo,
      passwordHash: row.password_hash,
    };
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const result = await this.db.query<{
      id: string;
      email: string;
      rol: RolUsuario;
      activo: boolean;
      password_hash: string;
    }>('SELECT id, email, rol, activo, password_hash FROM usuario WHERE id = $1', [id]);

    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      rol: row.rol,
      activo: row.activo,
      passwordHash: row.password_hash,
    };
  }

  async crear(input: CrearUsuarioInput): Promise<Usuario> {
    const result = await this.db.query<{
      id: string;
      email: string;
      rol: RolUsuario;
      activo: boolean;
      password_hash: string;
    }>(
      'INSERT INTO usuario (email, password_hash, rol) VALUES ($1, $2, $3) RETURNING id, email, rol, activo, password_hash',
      [input.email, input.passwordHash, input.rol],
    );

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      rol: row.rol,
      activo: row.activo,
      passwordHash: row.password_hash,
    };
  }

  async cambiarActivo(id: string, activo: boolean): Promise<void> {
    await this.db.query('UPDATE usuario SET activo = $2, updated_at = now() WHERE id = $1', [id, activo]);
  }
}

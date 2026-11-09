import { RolUsuario } from './rol.vo';
import { Usuario } from './usuario.entity';

// Puerto (interfaz) del repositorio de usuarios. La implementación concreta
// vive en infrastructure/repositories/usuario.repository.impl.ts.
export interface UsuarioRepository {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  crear(input: CrearUsuarioInput): Promise<Usuario>;
  cambiarActivo(id: string, activo: boolean): Promise<void>;
}

export interface CrearUsuarioInput {
  email: string;
  passwordHash: string;
  rol: RolUsuario;
}

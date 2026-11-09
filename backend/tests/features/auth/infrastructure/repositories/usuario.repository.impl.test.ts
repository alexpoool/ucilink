import { UsuarioRepositoryImpl } from '@/features/auth/infrastructure/repositories/usuario.repository.impl';
import { Database } from '@/config/db';
import { Usuario } from '@/features/auth/domain/usuario.entity';

// Test gemelo del repositorio impl. Se mockea `Database` (pg): la lógica a
// probar es el mapeo SQL ↔ entidad de dominio (snake_case → camelCase).
describe('UsuarioRepositoryImpl', () => {
  let db: jest.Mocked<Database>;
  let repo: UsuarioRepositoryImpl;

  const fila = {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'test@uni.edu',
    rol: 'aspirante',
    activo: true,
    password_hash: '$2a$10$x',
  };

  beforeEach(() => {
    db = { query: jest.fn(), transaction: jest.fn() } as jest.Mocked<Database>;
    repo = new UsuarioRepositoryImpl(db);
  });

  describe('buscarPorEmail', () => {
    it('mapea la fila a la entidad de dominio', async () => {
      db.query.mockResolvedValue({ rows: [fila] } as never);

      const usuario = await repo.buscarPorEmail('test@uni.edu');

      expect(db.query).toHaveBeenCalledWith(
        'SELECT id, email, rol, activo, password_hash FROM usuario WHERE email = $1',
        ['test@uni.edu'],
      );
      expect(usuario).toEqual({
        id: fila.id,
        email: fila.email,
        rol: 'aspirante',
        activo: true,
        passwordHash: fila.password_hash,
      });
    });

    it('devuelve null si no hay filas', async () => {
      db.query.mockResolvedValue({ rows: [] } as never);
      expect(await repo.buscarPorEmail('nada@uni.edu')).toBeNull();
    });
  });

  describe('buscarPorId', () => {
    it('mapea la fila por id', async () => {
      db.query.mockResolvedValue({ rows: [fila] } as never);
      const usuario = await repo.buscarPorId(fila.id);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT id, email, rol, activo, password_hash FROM usuario WHERE id = $1',
        [fila.id],
      );
      expect((usuario as Usuario).id).toBe(fila.id);
    });
  });

  describe('crear', () => {
    it('inserta con passwordHasheado y mapea el RETURNING', async () => {
      db.query.mockResolvedValue({ rows: [fila] } as never);

      const usuario = await repo.crear({
        email: fila.email,
        passwordHash: '$2a$10$x',
        rol: 'aspirante',
      });

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO usuario (email, password_hash, rol) VALUES ($1, $2, $3) RETURNING id, email, rol, activo, password_hash',
        [fila.email, '$2a$10$x', 'aspirante'],
      );
      expect(usuario.passwordHash).toBe(fila.password_hash);
    });
  });

  describe('cambiarActivo', () => {
    it('ejecuta el UPDATE con el estado destino', async () => {
      db.query.mockResolvedValue({ rows: [] } as never);
      await repo.cambiarActivo(fila.id, false);
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE usuario SET activo = $2, updated_at = now() WHERE id = $1',
        [fila.id, false],
      );
    });
  });
});

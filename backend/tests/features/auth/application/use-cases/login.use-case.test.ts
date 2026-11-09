import { LoginUseCase } from '@/features/auth/application/use-cases/login.use-case';
import { UsuarioRepository } from '@/features/auth/domain/auth.repository';
import { PasswordHasher } from '@/features/auth/domain/hash.port';
import { TokenSigner } from '@/features/auth/domain/token.port';
import { CredencialInvalidaException } from '@/features/auth/domain/credencial-invalida.exception';
import { UsuarioInactivoException } from '@/features/auth/domain/usuario-inactivo.exception';
import { Usuario } from '@/features/auth/domain/usuario.entity';

const usuarioActivo: Usuario = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'brisa@uni.edu',
  rol: 'aspirante',
  activo: true,
  passwordHash: '$2a$10$hashvalido',
};

describe('LoginUseCase', () => {
  let usuarioRepository: jest.Mocked<UsuarioRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let tokenSigner: jest.Mocked<TokenSigner>;

  beforeEach(() => {
    usuarioRepository = {
      buscarPorEmail: jest.fn(),
      buscarPorId: jest.fn(),
      crear: jest.fn(),
      cambiarActivo: jest.fn(),
    };
    passwordHasher = { hash: jest.fn(), comparar: jest.fn() };
    tokenSigner = { firmar: jest.fn().mockResolvedValue('token-jwt') };
  });

  it('autentica con credenciales correctas y devuelve token + usuario sin passwordHash', async () => {
    usuarioRepository.buscarPorEmail.mockResolvedValue(usuarioActivo);
    passwordHasher.comparar.mockResolvedValue(true);

    const resultado = await new LoginUseCase(
      usuarioRepository,
      passwordHasher,
      tokenSigner,
    ).execute({ email: 'brisa@uni.edu', password: 'secreta123' });

    expect(resultado.token).toBe('token-jwt');
    expect(resultado.usuario).toEqual({
      id: usuarioActivo.id,
      email: usuarioActivo.email,
      rol: usuarioActivo.rol,
    });
    expect(JSON.stringify(resultado)).not.toContain('passwordHash');
    expect(usuarioRepository.buscarPorEmail).toHaveBeenCalledWith('brisa@uni.edu');
    expect(passwordHasher.comparar).toHaveBeenCalledWith('secreta123', usuarioActivo.passwordHash);
    expect(tokenSigner.firmar).toHaveBeenCalledWith({ id: usuarioActivo.id, rol: 'aspirante' });
  });

  it('lanza CredencialInvalidaException si el usuario NO existe', async () => {
    usuarioRepository.buscarPorEmail.mockResolvedValue(null);

    await expect(
      new LoginUseCase(usuarioRepository, passwordHasher, tokenSigner).execute({
        email: 'fantasma@uni.edu',
        password: 'loquesea999',
      }),
    ).rejects.toThrow(CredencialInvalidaException);

    expect(passwordHasher.comparar).not.toHaveBeenCalled();
  });

  it('lanza CredencialInvalidaException si la contraseña NO coincide', async () => {
    usuarioRepository.buscarPorEmail.mockResolvedValue(usuarioActivo);
    passwordHasher.comparar.mockResolvedValue(false);

    await expect(
      new LoginUseCase(usuarioRepository, passwordHasher, tokenSigner).execute({
        email: 'brisa@uni.edu',
        password: 'contramala123',
      }),
    ).rejects.toThrow(CredencialInvalidaException);

    expect(tokenSigner.firmar).not.toHaveBeenCalled();
  });

  it('lanza UsuarioInactivoException si el usuario está suspendido', async () => {
    usuarioRepository.buscarPorEmail.mockResolvedValue({ ...usuarioActivo, activo: false });
    passwordHasher.comparar.mockResolvedValue(true);

    await expect(
      new LoginUseCase(usuarioRepository, passwordHasher, tokenSigner).execute({
        email: 'brisa@uni.edu',
        password: 'secreta123',
      }),
    ).rejects.toThrow(UsuarioInactivoException);
  });

  it('rechaza un email inválido sin tocar el repositorio (validación zod del DTO)', async () => {
    await expect(
      new LoginUseCase(usuarioRepository, passwordHasher, tokenSigner).execute({
        email: 'no-es-email',
        password: 'secreta123',
      }),
    ).rejects.toThrow();

    expect(usuarioRepository.buscarPorEmail).not.toHaveBeenCalled();
  });
});

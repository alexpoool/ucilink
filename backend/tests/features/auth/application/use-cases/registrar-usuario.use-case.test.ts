import { RegistrarUsuarioUseCase } from '@/features/auth/application/use-cases/registrar-usuario.use-case';
import { UsuarioRepository } from '@/features/auth/domain/auth.repository';
import { PasswordHasher } from '@/features/auth/domain/hash.port';
import { TokenSigner } from '@/features/auth/domain/token.port';
import { EmailYaRegistradoException } from '@/features/auth/domain/email-ya-registrado.exception';
import { Usuario } from '@/features/auth/domain/usuario.entity';

describe('RegistrarUsuarioUseCase', () => {
  let usuarioRepository: jest.Mocked<UsuarioRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let tokenSigner: jest.Mocked<TokenSigner>;

  const usuarioCreado: Usuario = {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'nuevo@uni.edu',
    rol: 'empresa',
    activo: true,
    passwordHash: '$2a$10$nuevo',
  };

  beforeEach(() => {
    usuarioRepository = {
      buscarPorEmail: jest.fn().mockResolvedValue(null),
      buscarPorId: jest.fn(),
      crear: jest.fn().mockResolvedValue(usuarioCreado),
      cambiarActivo: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn().mockResolvedValue('$2a$10$nuevo'),
      comparar: jest.fn(),
    };
    tokenSigner = { firmar: jest.fn().mockResolvedValue('token-jwt') };
  });

  it('hashea la contraseña, crea el usuario y devuelve token + DTO público', async () => {
    const resultado = await new RegistrarUsuarioUseCase(
      usuarioRepository,
      passwordHasher,
      tokenSigner,
    ).execute({ email: 'nuevo@uni.edu', password: 'clave-segura', rol: 'empresa' });

    expect(passwordHasher.hash).toHaveBeenCalledWith('clave-segura');
    expect(usuarioRepository.crear).toHaveBeenCalledWith({
      email: 'nuevo@uni.edu',
      passwordHash: '$2a$10$nuevo',
      rol: 'empresa',
    });
    expect(resultado.usuario).toEqual({ id: usuarioCreado.id, email: usuarioCreado.email, rol: 'empresa' });
    expect(JSON.stringify(resultado)).not.toContain('passwordHash');
  });

  it('lanza EmailYaRegistradoException si el email ya existe y no crea usuario', async () => {
    usuarioRepository.buscarPorEmail.mockResolvedValue(usuarioCreado);

    await expect(
      new RegistrarUsuarioUseCase(usuarioRepository, passwordHasher, tokenSigner).execute({
        email: 'nuevo@uni.edu',
        password: 'clave-segura',
        rol: 'empresa',
      }),
    ).rejects.toThrow(EmailYaRegistradoException);

    expect(usuarioRepository.crear).not.toHaveBeenCalled();
  });

  it('rechaza rol admin (no registrable) sin tocar el repositorio', async () => {
    await expect(
      new RegistrarUsuarioUseCase(usuarioRepository, passwordHasher, tokenSigner).execute({
        email: 'villano@uni.edu',
        password: 'clave-segura',
        rol: 'admin' as unknown as 'aspirante',
      }),
    ).rejects.toThrow();

    expect(usuarioRepository.crear).not.toHaveBeenCalled();
  });

  it('rechaza contraseñas de menos de 8 caracteres', async () => {
    await expect(
      new RegistrarUsuarioUseCase(usuarioRepository, passwordHasher, tokenSigner).execute({
        email: 'corto@uni.edu',
        password: 'corta1',
        rol: 'aspirante',
      }),
    ).rejects.toThrow();

    expect(usuarioRepository.crear).not.toHaveBeenCalled();
  });
});

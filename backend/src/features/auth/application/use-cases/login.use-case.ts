import { z } from 'zod';
import { UsuarioRepository } from '@/features/auth/domain/auth.repository';
import { PasswordHasher } from '@/features/auth/domain/hash.port';
import { TokenSigner } from '@/features/auth/domain/token.port';
import { CredencialInvalidaException } from '@/features/auth/domain/credencial-invalida.exception';
import { UsuarioInactivoException } from '@/features/auth/domain/usuario-inactivo.exception';
import { LoginDto, loginSchema } from '@/features/auth/application/dtos/login.dto';
import { AuthRespuesta, mapearAuthRespuesta } from '@/features/auth/application/auth.mapper';

// UC: el usuario autentica con email + password y recibe su JWT.
// La validación fuerte del DTO corre aquí (parse del schema) para que el
// controller quede como simple traductor HTTP (regla 10 de AGENT.md).
export class LoginUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenSigner: TokenSigner,
  ) {}

  async execute(input: unknown): Promise<AuthRespuesta> {
    const dto: LoginDto = loginSchema.parse(input);

    const usuario = await this.usuarioRepository.buscarPorEmail(dto.email);
    if (!usuario) throw new CredencialInvalidaException();

    if (!usuario.activo) throw new UsuarioInactivoException();

    const coincide = await this.passwordHasher.comparar(dto.password, usuario.passwordHash);
    if (!coincide) throw new CredencialInvalidaException();

    const token = await this.tokenSigner.firmar({ id: usuario.id, rol: usuario.rol });
    return mapearAuthRespuesta(token, usuario);
  }
}

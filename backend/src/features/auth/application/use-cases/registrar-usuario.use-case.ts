import { UsuarioRepository } from '@/features/auth/domain/auth.repository';
import { PasswordHasher } from '@/features/auth/domain/hash.port';
import { EmailYaRegistradoException } from '@/features/auth/domain/email-ya-registrado.exception';
import { RegistroDto, registroSchema } from '@/features/auth/application/dtos/registro.dto';
import { AuthRespuesta, mapearAuthRespuesta } from '@/features/auth/application/auth.mapper';
import { TokenSigner } from '@/features/auth/domain/token.port';

// UC: un visitante se registra como aspirante o empresa (admin NO via API pública).
// Crea solo la cuenta `usuario`; el perfil se crea después con el use-case
// del feature correspondiente (aspirante/crear-perfil, empresa/crear-perfil).
export class RegistrarUsuarioUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenSigner: TokenSigner,
  ) {}

  async execute(input: unknown): Promise<AuthRespuesta> {
    const dto: RegistroDto = registroSchema.parse(input);

    const existente = await this.usuarioRepository.buscarPorEmail(dto.email);
    if (existente) throw new EmailYaRegistradoException(dto.email);

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const usuario = await this.usuarioRepository.crear({
      email: dto.email,
      passwordHash,
      rol: dto.rol,
    });

    const token = await this.tokenSigner.firmar({ id: usuario.id, rol: usuario.rol });
    return mapearAuthRespuesta(token, usuario);
  }
}

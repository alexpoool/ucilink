import { AspiranteRepository, CrearAspiranteInput } from '@/features/aspirante/domain/aspirante.repository';
import { PerfilYaExisteException } from '@/features/aspirante/domain/perfil-ya-existe.exception';
import { crearPerfilInputSchema, CrearPerfilAspiranteInput } from '../dtos/crear-aspirante.dto';
import { mapearAspirante, AspiranteDto } from '../aspirante.mapper';

// UC: un usuario con rol aspirante crea su perfil (uno por usuario; UNIQUE usuario_id).
export class CrearPerfilAspiranteUseCase {
  constructor(private readonly aspiranteRepository: AspiranteRepository) {}

  async execute(input: unknown): Promise<AspiranteDto> {
    const dto: CrearPerfilAspiranteInput = crearPerfilInputSchema.parse(input);

    const existente = await this.aspiranteRepository.buscarPorUsuarioId(dto.usuarioId);
    if (existente) throw new PerfilYaExisteException();

    const entidad = await this.aspiranteRepository.crear(
      {
        nombre: dto.nombre,
        apellido: dto.apellido,
        telefono: dto.telefono ?? null,
        carrera: dto.carrera ?? null,
        semestre: dto.semestre ?? null,
        bio: dto.bio ?? null,
        habilidades: dto.habilidades ?? [],
        linkedinUrl: dto.linkedinUrl ?? null,
        githubUrl: dto.githubUrl ?? null,
        portafolioUrl: dto.portafolioUrl ?? null,
      } satisfies CrearAspiranteInput,
      dto.usuarioId,
    );

    return mapearAspirante(entidad);
  }
}

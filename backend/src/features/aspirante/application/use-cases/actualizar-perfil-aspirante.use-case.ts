import { AspiranteRepository, ActualizarAspiranteInput } from '@/features/aspirante/domain/aspirante.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { actualizarPerfilInputSchema, ActualizarPerfilAspiranteInput } from '../dtos/actualizar-aspirante.dto';
import { mapearAspirante, AspiranteDto } from '../aspirante.mapper';

// UC: el propio aspirante actualiza su perfil. Resuelve su id de perfil por
// usuarioId del token (el cliente nunca manda el identificativo del perfil).
export class ActualizarPerfilAspiranteUseCase {
  constructor(private readonly aspiranteRepository: AspiranteRepository) {}

  async execute(input: unknown): Promise<AspiranteDto> {
    const dto: ActualizarPerfilAspiranteInput = actualizarPerfilInputSchema.parse(input);

    const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(dto.usuarioId);
    if (!aspirante) throw new AspiranteNoEncontradoException();

    const { usuarioId, ...cambios } = dto;
    void usuarioId;
    const actualizado = await this.aspiranteRepository.actualizar(
      aspirante.id,
      cambios satisfies ActualizarAspiranteInput,
    );

    return mapearAspirante(actualizado);
  }
}

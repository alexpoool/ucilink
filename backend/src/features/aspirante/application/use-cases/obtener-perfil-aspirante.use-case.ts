import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { z } from 'zod';
import { mapearAspirante, AspiranteDto } from '../aspirante.mapper';

// UC: el propio aspirante obtiene su perfil (usuarioId viene del token sesión).
export class ObtenerPerfilAspiranteUseCase {
  constructor(private readonly aspiranteRepository: AspiranteRepository) {}

  async execute(input: unknown): Promise<AspiranteDto> {
    const { usuarioId } = z.object({ usuarioId: z.string().uuid() }).parse(input);

    const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(usuarioId);
    if (!aspirante) throw new AspiranteNoEncontradoException();

    return mapearAspirante(aspirante);
  }
}

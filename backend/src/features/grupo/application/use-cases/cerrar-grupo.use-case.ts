import { z } from 'zod';
import { GrupoRepository } from '@/features/grupo/domain/grupo.repository';
import { GrupoNoEncontradoException } from '@/features/grupo/domain/grupo-no-encontrado.exception';
import { NoEsLiderException } from '@/features/grupo/domain/no-es-lider.exception';
import { TransicionGrupoInvalidaException } from '@/features/grupo/domain/transicion-grupo-invalida.exception';
import { puedeTransitarGrupo } from '@/features/grupo/domain/estado-grupo.vo';
import { mapearGrupo, GrupoDto } from '../grupo.mapper';

// UC: el líder CIERRA el grupo definitivamente (no admite más miembros ni
// postulaciones). El VO de estados valida la transición.
export class CerrarGrupoUseCase {
  constructor(private readonly grupoRepository: GrupoRepository) {}

  async execute(input: unknown): Promise<GrupoDto> {
    const { grupoId, liderId } = z
      .object({ grupoId: z.string().uuid(), liderId: z.string().uuid() })
      .parse(input);

    const grupo = await this.grupoRepository.buscarPorId(grupoId);
    if (!grupo) throw new GrupoNoEncontradoException();
    if (grupo.liderId !== liderId) throw new NoEsLiderException();

    if (!puedeTransitarGrupo(grupo.estado, 'cerrado')) {
      throw new TransicionGrupoInvalidaException(grupo.estado, 'cerrado');
    }

    return mapearGrupo(await this.grupoRepository.cambiarEstado(grupo.id, 'cerrado'));
  }
}

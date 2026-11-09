import { z } from 'zod';
import { GrupoRepository } from '@/features/grupo/domain/grupo.repository';
import { GrupoDto, mapearGrupo } from '../grupo.mapper';

// UC: el aspirante ve SUS grupos — los que LIDERA y los que integra como
// miembro (dedupe por id: un líder es a la vez miembro implícito).
export class ListarGruposPropiosUseCase {
  constructor(private readonly grupoRepository: GrupoRepository) {}

  async execute(input: unknown): Promise<GrupoDto[]> {
    const { aspiranteId } = z.object({ aspiranteId: z.string().uuid() }).parse(input);

    const [liderados, comoMiembro] = await Promise.all([
      this.grupoRepository.listarPorLider(aspiranteId),
      this.grupoRepository.listarMiosComoMiembro(aspiranteId),
    ]);

    const unicos = new Map<string, ReturnType<typeof mapearGrupo>>();
    for (const grupo of [...liderados, ...comoMiembro]) {
      unicos.set(grupo.id, mapearGrupo(grupo));
    }
    return [...unicos.values()];
  }
}

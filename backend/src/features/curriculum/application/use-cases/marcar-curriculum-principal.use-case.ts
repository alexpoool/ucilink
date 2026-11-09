import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { CurriculumRepository } from '@/features/curriculum/domain/curriculum.repository';
import { CurriculumAjenoException } from '@/features/curriculum/domain/curriculum-ajeno.exception';
import { z } from 'zod';

// UC: marcar el CV PRINCIPAL (excluyente en una sola operación SQL del impl:
// es_principal = (id = $target) para todos los CV del aspirante).
export class MarcarCurriculumPrincipalUseCase {
  constructor(
    private readonly aspiranteRepository: AspiranteRepository,
    private readonly curriculumRepository: CurriculumRepository,
  ) {}

  async execute(input: unknown): Promise<void> {
    const { usuarioId, curriculumId } = z
      .object({ usuarioId: z.string().uuid(), curriculumId: z.string().uuid() })
      .parse(input);

    const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(usuarioId);
    if (!aspirante) throw new AspiranteNoEncontradoException();

    const cv = await this.curriculumRepository.buscarPorId(curriculumId);
    if (!cv || cv.aspiranteId !== aspirante.id) throw new CurriculumAjenoException();

    await this.curriculumRepository.marcarComoPrincipal(cv.id, aspirante.id);
  }
}

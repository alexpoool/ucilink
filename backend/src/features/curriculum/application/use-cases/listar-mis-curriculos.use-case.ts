import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { CurriculumRepository } from '@/features/curriculum/domain/curriculum.repository';
import { z } from 'zod';
import { mapearCurriculum, CurriculumDto } from '../curriculum.mapper';

// UC: listar los currículums PROPIOS del aspirante autenticado.
export class ListarMisCurriculosUseCase {
  constructor(
    private readonly aspiranteRepository: AspiranteRepository,
    private readonly curriculumRepository: CurriculumRepository,
  ) {}

  async execute(input: unknown): Promise<CurriculumDto[]> {
    const { usuarioId } = z.object({ usuarioId: z.string().uuid() }).parse(input);

    const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(usuarioId);
    if (!aspirante) throw new AspiranteNoEncontradoException();

    const lista = await this.curriculumRepository.listarPorAspiranteId(aspirante.id);
    return lista.map((c) => mapearCurriculum(c));
  }
}

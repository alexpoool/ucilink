import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { CurriculumRepository } from '@/features/curriculum/domain/curriculum.repository';
import { CurriculumNoEncontradoException } from '@/features/curriculum/domain/curriculum-no-encontrado.exception';
import { z } from 'zod';
import { mapearCurriculum, CurriculumDto } from '../curriculum.mapper';

// UC: CV Público (alimentan la página SEO /cvs/:id y el JSON-LD Person).
// Requiere visible=true; si está oculto → 404 (no divulgación de existencia).
export class ObtenerCurriculumPublicoUseCase {
  constructor(
    private readonly aspiranteRepository: AspiranteRepository,
    private readonly curriculumRepository: CurriculumRepository,
  ) {}

  async execute(input: unknown): Promise<CurriculumDto> {
    const { curriculumId } = z.object({ curriculumId: z.string().uuid() }).parse(input);

    const cv = await this.curriculumRepository.buscarPorId(curriculumId);
    if (!cv || !cv.visible) throw new CurriculumNoEncontradoException();

    const aspirante = await this.aspiranteRepository.buscarPorId(cv.aspiranteId);
    const dto = mapearCurriculum(cv);
    if (aspirante) {
      dto.aspirante = {
        id: aspirante.id,
        nombre: aspirante.nombre,
        apellido: aspirante.apellido,
        carrera: aspirante.carrera,
      };
    }
    return dto;
  }
}

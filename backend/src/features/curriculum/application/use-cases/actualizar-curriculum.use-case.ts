import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import {
  CurriculumRepository,
  ActualizarCurriculumInput,
} from '@/features/curriculum/domain/curriculum.repository';
import { CurriculumAjenoException } from '@/features/curriculum/domain/curriculum-ajeno.exception';
import {
  actualizarCurriculumInputSchema,
  ActualizarCurriculumUcInput,
} from '../dtos/actualizar-curriculum.dto';
import { mapearCurriculum, CurriculumDto } from '../curriculum.mapper';

// UC: el PROPIETARIO actualiza su CV. Verifica que el CV pertenezca al
// aspirante del token ( CurriculumAjenoException en caso contrario).
export class ActualizarCurriculumUseCase {
  constructor(
    private readonly aspiranteRepository: AspiranteRepository,
    private readonly curriculumRepository: CurriculumRepository,
  ) {}

  async execute(input: unknown): Promise<CurriculumDto> {
    const dto: ActualizarCurriculumUcInput = actualizarCurriculumInputSchema.parse(input);

    const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(dto.usuarioId);
    if (!aspirante) throw new AspiranteNoEncontradoException();

    const cv = await this.curriculumRepository.buscarPorId(dto.curriculumId);
    if (!cv) throw new CurriculumAjenoException(); // pre-4xx sin divulgación de existencia
    if (cv.aspiranteId !== aspirante.id) throw new CurriculumAjenoException();

    const { usuarioId, curriculumId, ...cambios } = dto;
    void usuarioId;
    void curriculumId;
    const actualizado = await this.curriculumRepository.actualizar(
      cv.id,
      cambios satisfies ActualizarCurriculumInput,
    );

    return mapearCurriculum(actualizado, {
      id: aspirante.id,
      nombre: aspirante.nombre,
      apellido: aspirante.apellido,
      carrera: aspirante.carrera,
    });
  }
}

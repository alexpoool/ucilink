import { CurriculumRepository } from '@/features/curriculum/domain/curriculum.repository';
import { CurriculumNoEncontradoException } from '@/features/curriculum/domain/curriculum-no-encontrado.exception';
import { AutopercepcionNoPermitidaException } from '@/features/valoracion/domain/autovaloracion.exception';
import {
  ValoracionCurriculumRepository,
  ValoracionCurriculumAspiranteRepository,
} from '@/features/valoracion/domain/valoracion.repository';
import { valorarCurriculumParamsSchema, ValorarCurriculumInput } from '../dtos/valorar.dto';
import { Reaccion, EstadoReaccion, ResumenValoraciones } from '@/features/valoracion/domain/reaccion.vo';

// UC (funcionalidad 8b): la EMPRESA valora un CV (like/dislike toggle).
// El CV DEBE estar visible (404 si no) y la empresa NO puede valorar
// un CV suyo (no aplica: empresa ≠ aspirante; guard defensivo igualmente).
export class ValorarCurriculumEmpresaUseCase {
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly valoracionRepository: ValoracionCurriculumRepository,
  ) {}

  async execute(input: unknown): Promise<ResumenConReaccionDto> {
    const dto: ValorarCurriculumInput = valorarCurriculumParamsSchema.parse(input);

    const cv = await this.curriculumRepository.buscarPorId(dto.curriculumId);
    if (!cv || !cv.visible) throw new CurriculumNoEncontradoException();

    const estado = await this.valoracionRepository.valorar(
      dto.actorId, // ES empresa_id: el controller inyecta el perfil empresa
      dto.curriculumId,
      dto.reaccion satisfies Reaccion,
    );
    const resumen: ResumenValoraciones = await this.valoracionRepository.resumen(dto.curriculumId);
    return { ...resumen, miReaccion: estado };
  }
}

// UC (funcionalidad 8): el ASPIRANTE valora EL CV de OTROS (toggle).
// Guards: CV visible; NO su propio CV.
export class ValorarCurriculumAspiranteUseCase {
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly valoracionRepository: ValoracionCurriculumAspiranteRepository,
  ) {}

  async execute(input: unknown): Promise<ResumenConReaccionDto> {
    const dto: ValorarCurriculumInput = valorarCurriculumParamsSchema.parse(input);

    const cv = await this.curriculumRepository.buscarPorId(dto.curriculumId);
    if (!cv || !cv.visible) throw new CurriculumNoEncontradoException();
    if (cv.aspiranteId === dto.actorId) throw new AutopercepcionNoPermitidaException('candidatura');

    const estado = await this.valoracionRepository.valorar(
      dto.actorId,
      dto.curriculumId,
      dto.reaccion satisfies Reaccion,
    );
    const resumen: ResumenValoraciones = await this.valoracionRepository.resumen(dto.curriculumId);
    return { ...resumen, miReaccion: estado };
  }
}

export interface ResumenConReaccionDto extends ResumenValoraciones {
  miReaccion: EstadoReaccion;
}

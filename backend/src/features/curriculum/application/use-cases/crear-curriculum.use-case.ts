import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { CurriculumRepository, CrearCurriculumInput } from '@/features/curriculum/domain/curriculum.repository';
import { crearCurriculumInputSchema, CrearCurriculumUcInput } from '../dtos/crear-curriculum.dto';
import { mapearCurriculum, CurriculumDto } from '../curriculum.mapper';

// UC: un aspirante crea un currículum. El PRIMERO del aspirante nace
// es_principal=true y visible=true (así el FEED y las postulaciones tienen base).
export class CrearCurriculumUseCase {
  constructor(
    private readonly aspiranteRepository: AspiranteRepository,
    private readonly curriculumRepository: CurriculumRepository,
  ) {}

  async execute(input: unknown): Promise<CurriculumDto> {
    const dto: CrearCurriculumUcInput = crearCurriculumInputSchema.parse(input);

    const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(dto.usuarioId);
    if (!aspirante) throw new AspiranteNoEncontradoException();

    const existentes = await this.curriculumRepository.listarPorAspiranteId(aspirante.id);
    const esPrimero = existentes.length === 0;

    const creado = await this.curriculumRepository.crear(
      {
        titulo: dto.titulo,
        resumen: dto.resumen ?? null,
        educacion: dto.educacion ?? [],
        experiencia: dto.experiencia ?? [],
        proyectos: dto.proyectos ?? [],
        habilidades: dto.habilidades ?? [],
        idiomas: dto.idiomas ?? [],
        cvPdfUrl: dto.cvPdfUrl ?? null,
        visible: dto.visible ?? true,
      } satisfies CrearCurriculumInput,
      aspirante.id,
      esPrimero,
    );

    return mapearCurriculum(creado, aspiranteParcial(aspirante));
  }
}

function aspiranteParcial(a: {
  id: string;
  nombre: string;
  apellido: string;
  carrera: string | null;
}) {
  return { id: a.id, nombre: a.nombre, apellido: a.apellido, carrera: a.carrera };
}

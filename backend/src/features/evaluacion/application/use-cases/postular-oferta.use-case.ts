import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { OfertaNoEncontradaException } from '@/features/oferta/domain/oferta-no-encontrada.exception';
import { AutorTipoIncoherenteException } from '@/features/oferta/domain/autor-tipo-incoherente.exception';
import { CurriculumRepository } from '@/features/curriculum/domain/curriculum.repository';
import { CurriculumAjenoException } from '@/features/curriculum/domain/curriculum-ajeno.exception';
import { CurriculumNoEncontradoException } from '@/features/curriculum/domain/curriculum-no-encontrado.exception';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { EvaluacionRepository, CrearEvaluacionInput } from '@/features/evaluacion/domain/evaluacion.repository';
import { PostulacionDuplicadaException } from '@/features/evaluacion/domain/postulacion-duplicada.exception';
import { CreadorNotificaciones } from '@/shared/domain/creador-notificaciones.port';
import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { postularSchema, PostularInput } from '../dtos/evaluacion.dto';
import { mapearEvaluacion, EvaluacionDto } from '../evaluacion.mapper';

// UC: el aspirante solicita empleo (o su equipo, grupoId).
// MANDATO del producto: la NOTIFICACIÓN "cv_recibido" a la empresa nace EN
// ESTE MISMO use-case (vía el puerto compartido), con la oferta resuelta una
// sola vez. Si fallara la notificación, la postulación SIEMPRE queda hecha
// (log + sin romper la transacción: la notificación es mejor esfuerzo).
export class PostularOfertaUseCase {
  constructor(
    private readonly ofertaRepository: OfertaRepository,
    private readonly curriculumRepository: CurriculumRepository,
    private readonly aspiranteRepository: AspiranteRepository,
    private readonly evaluacionRepository: EvaluacionRepository,
    private readonly empresaRepository: EmpresaRepository, // para el usuario_id destino
    private readonly creadorNotificaciones: CreadorNotificaciones,
  ) {}

  async execute(input: unknown): Promise<EvaluacionDto> {
    const dto: PostularInput = postularSchema.parse(input);

    const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(dto.usuarioId);
    if (!aspirante) throw new AspiranteNoEncontradoException();

    // La oferta deLa oferta debe estar PUBLICADA y ser tipo válido para POSTULAR:
    const oferta = await this.ofertaRepository.buscarPorId(dto.ofertaId);
    if (!oferta || oferta.oferta.estado !== 'publicada') throw new OfertaNoEncontradaException();
    if (oferta.oferta.tipoOferta === 'feat') {
      throw new AutorTipoIncoherenteException('aspirante', 'feat'); // feat ≠ solicitar empleo CLÁSICO
    }

    // El CV debe ser DEL aspirante (no puede postular el CV ajeno).
    const cv = await this.curriculumRepository.buscarPorId(dto.curriculumId);
    if (!cv) throw new CurriculumNoEncontradoException();
    if (cv.aspiranteId !== aspirante.id) throw new CurriculumAjenoException();

    // UNICIDAD temprana (la DB cierra con UNIQUE(oferta_id, curriculum_id)).
    const yaHay = await this.evaluacionRepository.existePostulacion(dto.ofertaId, dto.curriculumId);
    if (yaHay) throw new PostulacionDuplicadaException();

    const creada = await this.evaluacionRepository.crear({
      ofertaId: dto.ofertaId,
      curriculumId: dto.curriculumId,
      aspiranteId: aspirante.id,
      grupoId: dto.grupoId ?? null,
    } satisfies CrearEvaluacionInput);

    // Notificación a la empresa (autor empresa → usuario_id destino).
    if (oferta.oferta.autorTipo === 'empresa') {
      const empresa = await this.empresaRepository.buscarPorId(oferta.oferta.autorId);
      if (empresa) {
        await this.creadorNotificaciones.crear({
          usuarioId: empresa.usuarioId,
          tipo: 'cv_recibido',
          referenciaId: oferta.id,
        });
      }
    }

    return mapearEvaluacion(creada);
  }
}

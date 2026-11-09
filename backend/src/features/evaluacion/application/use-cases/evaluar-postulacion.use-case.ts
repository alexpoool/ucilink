import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { OfertaNoEncontradaException } from '@/features/oferta/domain/oferta-no-encontrada.exception';
import { NoEsAutorDeOfertaException } from '@/features/oferta/domain/no-es-autor.exception';
import { EvaluacionRepository } from '@/features/evaluacion/domain/evaluacion.repository';
import { EvaluacionNoEncontradaException } from '@/features/evaluacion/domain/evaluacion-no-encontrada.exception';
import { TransicionInvalidaException } from '@/features/evaluacion/domain/transicion-invalida.exception';
import { puedeTransitarEvaluacion, EstadoEvaluacion } from '@/features/evaluacion/domain/estado-evaluacion.vo';
import { evaluarSchema, EvaluarInput } from '../dtos/evaluacion.dto';
import { mapearEvaluacion, EvaluacionDto } from '../evaluacion.mapper';

// UC: la empresa avanza (o rechaza) una postulación. Guards EN el use-case:
//  1) la oferta es SUYA (empresaId del token vs autorId), 403 si no.
//  2) la evaluación existe Y pertenece a ESA oferta del path (404 si no).
// La MÁQUINA DE ESTADOS del VO decide la legalidad de la transición.
// Comentario/puntuación SOLO aceptados al cerrar (fichado | rechazado).
export class EvaluarPostulacionUseCase {
  constructor(
    private readonly ofertaRepository: OfertaRepository,
    private readonly evaluacionRepository: EvaluacionRepository,
  ) {}

  async execute(input: unknown): Promise<EvaluacionDto> {
    const dto: EvaluarInput = evaluarSchema.parse(input);

    const oferta = await this.ofertaRepository.buscarPorId(dto.ofertaId);
    if (!oferta) throw new OfertaNoEncontradaException();
    // Guard de PROPIEDAD: solo el autor de la oferta evalúa (empresa).
    if (oferta.oferta.autorId !== dto.empresaId) throw new NoEsAutorDeOfertaException();

    const evaluacion = await this.evaluacionRepository.buscarPorId(dto.evaluacionId);
    if (!evaluacion || evaluacion.ofertaId !== dto.ofertaId) {
      throw new EvaluacionNoEncontradaException(); // 404: no existe o no es de esta oferta
    }

    const origen = evaluacion.estado as EstadoEvaluacion;
    if (!puedeTransitarEvaluacion(origen, dto.estado)) {
      throw new TransicionInvalidaException(origen, dto.estado);
    }

    // comentario/puntuación SOLO al cerrar el pipeline (fichado|rechazado).
    const cierra = dto.estado === 'fichado' || dto.estado === 'rechazado';

    const evaluada = await this.evaluacionRepository.cambiarEstado(
      evaluacion.id,
      dto.estado,
      true,
      cierra ? (dto.comentarioEmpresa ?? null) : null,
      cierra ? (dto.puntuacion ?? null) : null,
    );
    return mapearEvaluacion(evaluada);
  }
}

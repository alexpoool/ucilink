import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { OfertaNoEncontradaException } from '@/features/oferta/domain/oferta-no-encontrada.exception';
import { AutopercepcionNoPermitidaException } from '@/features/valoracion/domain/autovaloracion.exception';
import { ValoracionOfertaRepository } from '@/features/valoracion/domain/valoracion.repository';
import { valorarOfertaParamsSchema, ValorarOfertaInput } from '../dtos/valorar.dto';
import { Reaccion, EstadoReaccion, ResumenValoraciones } from '@/features/valoracion/domain/reaccion.vo';

// UC (funcionalidad 7): el aspirante valora UNA OFFERTA (like/dislike toggle).
// Guard anti-autopercepción: no se lí puede valorar su propia oferta feat.
export class ValorarOfertaUseCase {
  constructor(
    private readonly ofertaRepository: OfertaRepository,
    private readonly valoracionRepository: ValoracionOfertaRepository,
  ) {}

  async execute(input: unknown): Promise<ValoracionRespuestaDto> {
    const dto: ValorarOfertaInput = valorarOfertaParamsSchema.parse(input);

    const oferta = await this.ofertaRepository.buscarPorId(dto.ofertaId);
    if (!oferta || oferta.oferta.estado !== 'publicada') throw new OfertaNoEncontradaException();

    if (
      oferta.oferta.autorTipo === 'aspirante' &&
      oferta.oferta.autorId === dto.actorId
    ) {
      throw new AutopercepcionNoPermitidaException('candidatura');
    }

    const estado = await this.valoracionRepository.valorar(
      dto.actorId,
      dto.ofertaId,
      dto.reaccion satisfies Reaccion,
    );
    const resumen = await this.valoracionRepository.resumen(dto.ofertaId);

    return { ...resumen, miReaccion: estado };
  }
}

export interface ValoracionRespuestaDto extends ResumenValoraciones {
  miReaccion: EstadoReaccion;
}

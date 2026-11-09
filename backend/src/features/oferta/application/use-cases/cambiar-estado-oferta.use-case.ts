import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { OfertaNoEncontradaException } from '@/features/oferta/domain/oferta-no-encontrada.exception';
import { NoEsAutorDeOfertaException } from '@/features/oferta/domain/no-es-autor.exception';
import { TransicionOfertaInvalidaException } from '@/features/oferta/domain/transicion-invalida.exception';
import { puedeTransitar, EstadoOferta } from '@/features/oferta/domain/estado-oferta.vo';
import { cambiarEstadoOfertaInputSchema, CambiarEstadoOfertaInput } from '../dtos/cambiar-estado-oferta.dto';
import { mapearOferta, OfertaDto } from '../oferta.mapper';

// UC: cambiar el estado de una oferta vía la MÁQUINA DE ESTADOS del VO.
// autor (usuarioId) o admin (esAdmin=true). La única pieza que decide si la
// transición es legal es el VO; el repo solo persiste.
export class CambiarEstadoOfertaUseCase {
  constructor(private readonly ofertaRepository: OfertaRepository) {}

  async execute(input: unknown): Promise<OfertaDto> {
    const dto: CambiarEstadoOfertaInput = cambiarEstadoOfertaInputSchema.parse(input);

    const resumen = await this.ofertaRepository.buscarPorId(dto.ofertaId);
    if (!resumen) throw new OfertaNoEncontradaException();

    if (!dto.esAdmin && resumen.oferta.autorId !== dto.usuarioId) {
      throw new NoEsAutorDeOfertaException();
    }

    const origen = resumen.oferta.estado as EstadoOferta;
    if (!puedeTransitar(origen, dto.estado)) {
      throw new TransicionOfertaInvalidaException(origen, dto.estado);
    }

    const actualizada = await this.ofertaRepository.cambiarEstado(dto.ofertaId, dto.estado);
    return mapearOferta(actualizada);
  }
}

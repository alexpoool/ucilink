import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { OfertaNoEncontradaException } from '@/features/oferta/domain/oferta-no-encontrada.exception';
import { NoEsAutorDeOfertaException } from '@/features/oferta/domain/no-es-autor.exception';
import { actualizarOfertaInputSchema, ActualizarOfertaUcInput } from '../dtos/actualizar-oferta.dto';
import { mapearOferta, OfertaDto } from '../oferta.mapper';

// UC: actualizar MI oferta (parcial). Guard de propiedad en dominio:
// inexistente → 404; existe y no es mía → 403 (no revelación de datos).
// Solo ofertas en borrador/publicada son editables (cerrada/cancelada no).
export class ActualizarOfertaUseCase {
  constructor(private readonly ofertaRepository: OfertaRepository) {}

  async execute(input: unknown): Promise<OfertaDto> {
    const dto: ActualizarOfertaUcInput = actualizarOfertaInputSchema.parse(input);

    const resumen = await this.ofertaRepository.buscarPorId(dto.ofertaId);
    if (!resumen) throw new OfertaNoEncontradaException();
    if (resumen.oferta.autorId !== dto.usuarioId) throw new NoEsAutorDeOfertaException();

    if (resumen.oferta.estado === 'cerrada' || resumen.oferta.estado === 'cancelada') {
      throw new OfertaNoEncontradaException(); // estados terminales no son editables
    }

    const { usuarioId, ofertaId, ...cambios } = dto;
    void usuarioId;
    void ofertaId;
    const { fechaLimite, ...restoCambios } = cambios;
    const actualizada = await this.ofertaRepository.actualizar(dto.ofertaId, {
      ...restoCambios,
      fechaLimite: fechaLimite === undefined ? undefined : fechaLimite ? new Date(fechaLimite) : null,
    });
    return mapearOferta(actualizada);
  }
}

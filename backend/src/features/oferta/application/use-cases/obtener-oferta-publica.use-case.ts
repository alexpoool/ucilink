import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { OfertaNoEncontradaException } from '@/features/oferta/domain/oferta-no-encontrada.exception';
import { z } from 'zod';
import { mapearOferta, OfertaDto } from '../oferta.mapper';

// UC: detalle de una oferta publicada (alimenta página SEO /ofertas/:id +
// JSON-LD JobPosting). Solo estados 'publicada' | 'cerrada' visibles al
// público (cerrada se muestra aviso); borrador/cancelada → 404.
export class ObtenerOfertaPublicaUseCase {
  constructor(private readonly ofertaRepository: OfertaRepository) {}

  async execute(input: unknown): Promise<OfertaDto> {
    const { ofertaId } = z.object({ ofertaId: z.string().uuid() }).parse(input);

    const resumen = await this.ofertaRepository.buscarPorId(ofertaId);
    if (!resumen) throw new OfertaNoEncontradaException();

    if (resumen.oferta.estado === 'borrador' || resumen.oferta.estado === 'cancelada') {
      throw new OfertaNoEncontradaException(); // no revelar existencia
    }

    return mapearOferta(resumen);
  }
}

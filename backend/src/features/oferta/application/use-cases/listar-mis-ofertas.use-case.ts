import { z } from 'zod';
import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { mapearOferta, OfertaDto } from '../oferta.mapper';

// Entrada resuelta desde el token (el controller inyecta ambos valores).
export const listarMisOfertasInputSchema = z.object({
  autorTipo: z.enum(['aspirante', 'empresa']),
  autorId: z.string().uuid(),
});

// UC: listado de MIS ofertas para el dashboard (empresa: normal+dash;
// aspirante: sus featuraciones). Filtrado por autor del token, no por query.
export class ListarMisOfertasUseCase {
  constructor(private readonly ofertaRepository: OfertaRepository) {}

  async execute(input: unknown): Promise<OfertaDto[]> {
    const { autorTipo, autorId } = listarMisOfertasInputSchema.parse(input);

    const lista = await this.ofertaRepository.listarPorAutor(autorTipo, autorId);
    return lista.map(mapearOferta);
  }
}

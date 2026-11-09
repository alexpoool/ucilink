import { z } from 'zod';
import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { OfertaNoEncontradaException } from '@/features/oferta/domain/oferta-no-encontrada.exception';
import { TransicionInvalidaException } from '@/features/oferta/domain/transicion-invalida.exception';
import { OfertaResumen } from '@/features/oferta/domain/oferta.entity';

// UC: moderación — el admin CANCELA una oferta por incumplimiento.
// El VO de la oferta ya garantiza: publicada → cancelada es la ÚNICA ruta
// hacia cancelada (un borrador se cancela por su propio autor, no por admin).
export class CancelarOfertaAdminUseCase {
  constructor(private readonly ofertaRepository: OfertaRepository) {}

  async execute(input: unknown): Promise<OfertaResumen> {
    const { ofertaId } = z.object({ ofertaId: z.string().uuid() }).parse(input);

    const oferta = await this.ofertaRepository.buscarPorId(ofertaId);
    if (!oferta) throw new OfertaNoEncontradaException();

    if (oferta.oferta.estado !== 'publicada') {
      throw new TransicionInvalidaException(oferta.oferta.estado, 'cancelada');
    }

    return this.ofertaRepository.cambiarEstado(ofertaId, 'cancelada');
  }
}

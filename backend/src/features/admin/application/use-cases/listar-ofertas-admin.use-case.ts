import { z } from 'zod';
import { AdminRepository, OfertaAdmin } from '../domain/admin.repository';
import { EstadoOferta } from '@/features/oferta/domain/estado-oferta.vo';

// UC: moderación — el admin ve TODAS las ofertas con su estado y autor
// (visibilidad total, sin filtros de ownership). Filtro de estado opcional.
export class ListarOfertasAdminUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(input: unknown): Promise<OfertaAdmin[]> {
    const { estado } = z
      .object({ estado: z.enum(['borrador', 'publicada', 'cerrada', 'cancelada']).nullable().optional() })
      .parse(input);

    return this.adminRepository.listarOfertas((estado ?? null) as EstadoOferta | null);
  }
}

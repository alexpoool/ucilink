import { OfertaRepository, FiltrosOfertas } from '@/features/oferta/domain/oferta.repository';
import { listarOfertasSchema, ListarOfertasDto } from '../dtos/listar-ofertas.dto';
import { mapearOferta, OfertaDto } from '../oferta.mapper';

// UC: feed público de ofertas (solo estado 'publicada'). Filtros tipados
// por el DTO zod; paginación obligatoria con techo (limit ≤ 50).
export class ListarOfertasFeedUseCase {
  constructor(private readonly ofertaRepository: OfertaRepository) {}

  async execute(input: unknown): Promise<OfertaDto[]> {
    const dto: ListarOfertasDto = listarOfertasSchema.parse(input);

    const filtros: FiltrosOfertas = {
      estado: 'publicada', // INVARIANTE del feed público — no negociable por query
      tipoOferta: dto.tipoOferta,
      autorTipo: dto.autorTipo,
      modalidad: dto.modalidad,
      ubicacionContiene: dto.ubicacion,
      habilidadesContiene: dto.habilidades,
      salarioMinDesde: dto.salarioMin,
      limit: dto.limit,
      offset: dto.offset,
    };

    const lista = await this.ofertaRepository.listarFeed(filtros);
    return lista.map(mapearOferta);
  }
}

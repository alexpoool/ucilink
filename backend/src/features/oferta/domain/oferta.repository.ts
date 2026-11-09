import { Oferta, OfertaResumen, CrearOfertaInput, ActualizarOfertaInput } from './oferta.entity';
import { EstadoOferta } from './estado-oferta.vo';

// Filtros tipados del feed público (application los construye desde zod).
export interface FiltrosOfertas {
  estado?: EstadoOferta; // feed público siempre 'publicada' por defecto
  tipoOferta?: 'normal' | 'dash' | 'feat';
  autorTipo?: 'aspirante' | 'empresa';
  modalidad?: string;
  ubicacionContiene?: string;
  habilidadesContiene?: string[]; // ALL del array habilidades_req
  salarioMinDesde?: number;
  limit: number;
  offset: number;
}

export interface OfertaRepository {
  listarFeed(filtros: FiltrosOfertas): Promise<OfertaResumen[]>;
  listarPorAutor(autorTipo: 'aspirante' | 'empresa', autorId: string): Promise<OfertaResumen[]>;
  buscarPorId(id: string): Promise<OfertaResumen | null>;
  crear(input: CrearOfertaInput): Promise<OfertaResumen>;
  actualizar(id: string, input: ActualizarOfertaInput): Promise<OfertaResumen>;
  cambiarEstado(id: string, estado: EstadoOferta): Promise<OfertaResumen>;
}

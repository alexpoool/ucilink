import { Empresa } from '@/features/empresa/domain/empresa.entity';
import { EstadoOferta } from '@/features/oferta/domain/estado-oferta.vo';

// Puerto EXCLUSIVO del feature admin: lecturas globales de moderación.
// Usa lectura SQL directa sobre tablas de otros features (solo SELECT) —
// las ESCRITuras de moderación van por los puertos de cada dominio.
export interface Contador {
  clave: string;
  total: number;
}

export interface MetricasPlataforma {
  usuariosPorRol: Contador[];
  ofertasPorEstado: Contador[];
  postulacionesPorEstado: Contador[];
  totalGrupos: number;
  totalCurriculos: number;
}

export interface OfertaAdmin {
  id: string;
  titulo: string;
  estado: EstadoOferta;
  autorTipo: string;
  autorNombre: string | null;
  createdAt: Date;
}

export interface AdminRepository {
  obtenerMetricas(): Promise<MetricasPlataforma>;
  listarOfertas(estado: EstadoOferta | null): Promise<OfertaAdmin[]>;
  listarEmpresasPendientes(): Promise<Empresa[]>;
}

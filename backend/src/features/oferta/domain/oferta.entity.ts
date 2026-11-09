import { TipoOferta, AutorTipo } from './tipo-oferta.vo';
import { EstadoOferta } from './estado-oferta.vo';

// Entidad pura. Espeja la tabla única `oferta` de esquema.sql.
export interface Oferta {
  id: string;
  autorTipo: AutorTipo;
  autorId: string;
  tipoOferta: TipoOferta;
  titulo: string;
  descripcion: string;
  requisitos: string | null;
  habilidadesReq: string[];
  modalidad: string | null;
  ubicacion: string | null;
  salarioMin: number | null;
  salarioMax: number | null;
  tipoContrato: string | null;
  objetivo: string | null; // título/lema de la oferta feat o dash
  grupoId: string | null; // oferta dash que un grupo postulará en equipo
  fechaLimite: Date | null;
  cupos: number;
  estado: EstadoOferta;
  createdAt: Date;
  updatedAt: Date;
}

// Vista enriquecida (DTO primitivo del dominio) para detalle/feed:
// nombre del autor, badge de verificación y contadores de valoraciones.
export interface OfertaResumen {
  oferta: Oferta;
  autorNombre: string;
  autorVerificado: boolean;
  autorLogoUrl: string | null;
  likes: number;
  dislikes: number;
}

// Inputs del repositorio, definidos aquí (domain) — mismo patrón de los
// demás features: los DTOs zod de application derivan de estas formas.
export interface CrearOfertaInput {
  autorTipo: AutorTipo;
  autorId: string;
  tipoOferta: TipoOferta;
  titulo: string;
  descripcion: string;
  requisitos: string | null;
  habilidadesReq: string[];
  modalidad: string | null;
  ubicacion: string | null;
  salarioMin: number | null;
  salarioMax: number | null;
  tipoContrato: string | null;
  objetivo: string | null;
  grupoId: string | null;
  fechaLimite: Date | null;
  cupos: number;
  estado: EstadoOferta;
}

export interface ActualizarOfertaInput {
  titulo?: string;
  descripcion?: string;
  requisitos?: string | null;
  habilidadesReq?: string[];
  modalidad?: string | null;
  ubicacion?: string | null;
  salarioMin?: number | null;
  salarioMax?: number | null;
  tipoContrato?: string | null;
  objetivo?: string | null;
  fechaLimite?: Date | null;
  cupos?: number;
}

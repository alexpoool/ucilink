import { Oferta, OfertaResumen } from '../domain/oferta.entity';

// DTO de respuesta del feed/detalle. Ricas pero SEGURAS: id del autor resuelto
// con el dato público del JOIN, NUNCA ids internos sensibles.
export interface OfertaDto {
  id: string;
  autorTipo: 'aspirante' | 'empresa';
  autorId: string;
  autorNombre: string;
  autorVerificado: boolean;
  autorLogoUrl: string | null;
  tipoOferta: 'normal' | 'dash' | 'feat';
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
  fechaLimite: string | null;
  cupos: number;
  estado: string;
  likes: number;
  dislikes: number;
  createdAt: string;
  updatedAt: string;
}

export type OfertaResumenDto = OfertaDto; // misma forma; el detalle trae más campos no filtrados

export function mapearOferta(resumen: OfertaResumen): OfertaDto {
  const { oferta } = resumen;
  return {
    id: oferta.id,
    autorTipo: oferta.autorTipo,
    autorId: oferta.autorId,
    autorNombre: resumen.autorNombre,
    autorVerificado: resumen.autorVerificado,
    autorLogoUrl: resumen.autorLogoUrl,
    tipoOferta: oferta.tipoOferta,
    titulo: oferta.titulo,
    descripcion: oferta.descripcion,
    requisitos: oferta.requisitos,
    habilidadesReq: oferta.habilidadesReq,
    modalidad: oferta.modalidad,
    ubicacion: oferta.ubicacion,
    salarioMin: oferta.salarioMin ? Number(oferta.salarioMin) : null,
    salarioMax: oferta.salarioMax ? Number(oferta.salarioMax) : null,
    tipoContrato: oferta.tipoContrato,
    objetivo: oferta.objetivo,
    fechaLimite: oferta.fechaLimite ? oferta.fechaLimite.toISOString() : null,
    cupos: oferta.cupos,
    estado: oferta.estado,
    likes: resumen.likes,
    dislikes: resumen.dislikes,
    createdAt: oferta.createdAt.toISOString(),
    updatedAt: oferta.updatedAt.toISOString(),
  };
}

export type { Oferta };

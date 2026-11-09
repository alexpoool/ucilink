import { Empresa } from '../domain/empresa.entity';
import { MetricasEmpresa } from '../domain/metricas.repository';

// DTO de respuesta público (incluye verificada para el badge del frontend).
export interface EmpresaDto {
  id: string;
  nombre: string;
  razonSocial: string | null;
  ruc: string | null;
  sector: string | null;
  descripcion: string | null;
  sitioWeb: string | null;
  logoUrl: string | null;
  ciudad: string | null;
  verificada: boolean;
  createdAt: string;
  updatedAt: string;
}

export function mapearEmpresa(entity: Empresa): EmpresaDto {
  return {
    id: entity.id,
    nombre: entity.nombre,
    razonSocial: entity.razonSocial,
    ruc: entity.ruc,
    sector: entity.sector,
    descripcion: entity.descripcion,
    sitioWeb: entity.sitioWeb,
    logoUrl: entity.logoUrl,
    ciudad: entity.ciudad,
    verificada: entity.verificada,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

export function mapearMetricas(m: MetricasEmpresa): MetricasEmpresaDto {
  return {
    ...m,
  };
}

export interface MetricasEmpresaDto extends MetricasEmpresa {}

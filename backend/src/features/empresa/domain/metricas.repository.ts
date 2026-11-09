// Métricas del dashboard de empresa. Puerto separado para mantener una
// responsabilidad por archivo; la impl construye los agregados con SQL (COUNT).
export interface MetricasEmpresa {
  ofertasNormalesPublicadas: number;
  ofertasDashPublicadas: number;
  ofertasCerradas: number;
  cvsRecibidos: number;
  cvsPendientesRevision: number;
  valoracionesRecibidas: number;
}

export interface MetricasRepository {
  obtenerMetricas(empresaId: string): Promise<MetricasEmpresa>;
}

import { z } from 'zod';
import { AdminRepository, MetricasPlataforma } from '../domain/admin.repository';

// UC: métricas agregadas del dashboard admin.
export class ObtenerMetricasUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(input: unknown = {}): Promise<MetricasPlataforma> {
    z.object({ adminId: z.string().uuid() }).parse(input); // solo validación de acceso
    return this.adminRepository.obtenerMetricas();
  }
}

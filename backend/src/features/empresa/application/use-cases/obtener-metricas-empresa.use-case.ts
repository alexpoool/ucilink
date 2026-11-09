import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { MetricasRepository } from '@/features/empresa/domain/metricas.repository';
import { EmpresaNoEncontradaException } from '@/features/empresa/domain/empresa-no-encontrado.exception';
import { z } from 'zod';
import { mapearMetricas, MetricasEmpresaDto } from '../empresa.mapper';

// UC: métricas del dashboard de empresa (ofertas por tipo/estado, pipeline de CVs).
export class ObtenerMetricasEmpresaUseCase {
  constructor(
    private readonly empresaRepository: EmpresaRepository,
    private readonly metricasRepository: MetricasRepository,
  ) {}

  async execute(input: unknown): Promise<MetricasEmpresaDto> {
    const { usuarioId } = z.object({ usuarioId: z.string().uuid() }).parse(input);

    const empresa = await this.empresaRepository.buscarPorUsuarioId(usuarioId);
    if (!empresa) throw new EmpresaNoEncontradaException();

    const metricas = await this.metricasRepository.obtenerMetricas(empresa.id);
    return mapearMetricas(metricas);
  }
}

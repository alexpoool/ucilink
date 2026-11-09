import { EvaluacionRepository } from '@/features/evaluacion/domain/evaluacion.repository';
import { z } from 'zod';
import { mapearEvaluacion, EvaluacionDto } from '../evaluacion.mapper';

// UC: el aspirante ve SUS postulaciones con su estado de pipeline.
export class ListarPostulacionesPropiasUseCase {
  constructor(private readonly evaluacionRepository: EvaluacionRepository) {}

  async execute(input: unknown): Promise<EvaluacionDto[]> {
    const { aspiranteId } = z.object({ aspiranteId: z.string().uuid() }).parse(input);

    const lista = await this.evaluacionRepository.listarPorAspirante(aspiranteId);
    return lista.map(mapearEvaluacion);
  }
}

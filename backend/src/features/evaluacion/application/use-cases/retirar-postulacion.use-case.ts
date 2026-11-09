import { EvaluacionRepository } from '@/features/evaluacion/domain/evaluacion.repository';
import { EvaluacionNoEncontradaException } from '@/features/evaluacion/domain/evaluacion-no-encontrada.exception';
import { TransicionInvalidaException } from '@/features/evaluacion/domain/transicion-invalida.exception';
import { puedeTransitarEvaluacion } from '@/features/evaluacion/domain/estado-evaluacion.vo';
import { z } from 'zod';
import { mapearEvaluacion, EvaluacionDto } from '../evaluacion.mapper';

// UC: el aspirante RETIRA su postulación (solo mientras esté 'postulado').
// Guard de propiedad: la evaluación debe ser de su aspirante_id.
export class RetirarPostulacionUseCase {
  constructor(private readonly evaluacionRepository: EvaluacionRepository) {}

  async execute(input: unknown): Promise<EvaluacionDto> {
    const { evaluacionId, aspiranteId } = z
      .object({ evaluacionId: z.string().uuid(), aspiranteId: z.string().uuid() })
      .parse(input);

    const evaluacion = await this.evaluacionRepository.buscarPorId(evaluacionId);
    if (!evaluacion || evaluacion.aspiranteId !== aspiranteId) {
      throw new EvaluacionNoEncontradaException(); // no revelar existencia ajena
    }

    if (!puedeTransitarEvaluacion(evaluacion.estado, 'retirado')) {
      throw new TransicionInvalidaException(evaluacion.estado, 'retirado');
    }

    const retirada = await this.evaluacionRepository.retirar(evaluacionId);
    return mapearEvaluacion(retirada);
  }
}

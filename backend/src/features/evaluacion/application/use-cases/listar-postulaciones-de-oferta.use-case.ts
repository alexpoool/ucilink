import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { OfertaNoEncontradaException } from '@/features/oferta/domain/oferta-no-encontrada.exception';
import { NoEsAutorDeOfertaException } from '@/features/oferta/domain/no-es-autor.exception';
import { EvaluacionRepository } from '@/features/evaluacion/domain/evaluacion.repository';
import { z } from 'zod';
import { mapearEvaluacion, EvaluacionDto } from '../evaluacion.mapper';

// UC: la empresa ve los CVs recibidos de UNA de sus ofertas (postulaciones).
// Guard de propiedad: si la oferta no le pertenece → 403 (sin filtrar datos).
export class ListarPostulacionesDeOfertaUseCase {
  constructor(
    private readonly ofertaRepository: OfertaRepository,
    private readonly evaluacionRepository: EvaluacionRepository,
  ) {}

  async execute(input: unknown): Promise<EvaluacionDto[]> {
    const { empresaId, ofertaId } = z
      .object({ empresaId: z.string().uuid(), ofertaId: z.string().uuid() })
      .parse(input);

    const oferta = await this.ofertaRepository.buscarPorId(ofertaId);
    if (!oferta) throw new OfertaNoEncontradaException();

    if (oferta.oferta.autorId !== empresaId) throw new NoEsAutorDeOfertaException();

    const lista = await this.evaluacionRepository.listarPorOferta(ofertaId);
    return lista.map(mapearEvaluacion);
  }
}

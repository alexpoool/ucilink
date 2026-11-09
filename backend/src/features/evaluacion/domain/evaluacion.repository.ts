import { Evaluacion } from './evaluacion.entity';
import { EstadoEvaluacion } from './estado-evaluacion.vo';

// Puerto del feature. El set estado / comentario / puntuación lo normaliza
// el use-case (evaluar) — el impl solo persiste.
export interface EvaluacionRepository {
  buscarPorId(id: string): Promise<Evaluacion | null>;
  existePostulacion(ofertaId: string, curriculumId: string): Promise<boolean>;
  crear(input: CrearEvaluacionInput): Promise<Evaluacion>;
  listarPorOferta(ofertaId: string): Promise<Evaluacion[]>;
  listarPorAspirante(aspiranteId: string): Promise<Evaluacion[]>;
  cambiarEstado(
    id: string,
    estado: EstadoEvaluacion,
    evaluadoPorEmpresa: boolean,
    comentarioEmpresa?: string | null,
    puntuacion?: number | null,
  ): Promise<Evaluacion>;
  retirar(id: string): Promise<Evaluacion>;
}

export interface CrearEvaluacionInput {
  ofertaId: string;
  curriculumId: string;
  aspiranteId: string;
  grupoId: string | null;
}

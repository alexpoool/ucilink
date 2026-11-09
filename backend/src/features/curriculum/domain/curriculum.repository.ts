import { Curriculum } from './curriculum.entity';
import {
  EducacionItem,
  ExperienciaItem,
  ProyectoItem,
  IdiomaItem,
} from './curriculum.entity';

// Inputs definidos en domain (convención aplicada también en aspirante/empresa).
export interface CrearCurriculumInput {
  titulo: string;
  resumen: string | null;
  educacion: EducacionItem[];
  experiencia: ExperienciaItem[];
  proyectos: ProyectoItem[];
  habilidades: string[];
  idiomas: IdiomaItem[];
  cvPdfUrl: string | null;
  visible: boolean;
}

export interface ActualizarCurriculumInput {
  titulo?: string;
  resumen?: string | null;
  educacion?: EducacionItem[];
  experiencia?: ExperienciaItem[];
  proyectos?: ProyectoItem[];
  habilidades?: string[];
  idiomas?: IdiomaItem[];
  cvPdfUrl?: string | null;
  visible?: boolean;
}

export interface CurriculumRepository {
  listarPorAspiranteId(aspiranteId: string): Promise<Curriculum[]>;
  buscarPorId(id: string): Promise<Curriculum | null>;
  crear(input: CrearCurriculumInput, aspiranteId: string, esPrimero: boolean): Promise<Curriculum>;
  actualizar(id: string, input: ActualizarCurriculumInput): Promise<Curriculum>;
  // Exclusivo: es_principal = (id = $target) para TODO el aspirante en 1 UPDATE.
  marcarComoPrincipal(id: string, aspiranteId: string): Promise<void>;
}

// Sub-tipos de los bloques JSONB (nacen de esquema.sql: educacion, experiencia,
// proyectos e idiomas). El repositorio impl parse/stringify JSONB; la app
// trabaja SIEMPRE con estos tipos ya desserializados.
export interface EducacionItem {
  titulo: string;
  institucion: string;
  desde: string; // ISO date
  hasta: string | null;
}

export interface ExperienciaItem {
  puesto: string;
  empresa: string;
  descripcion: string | null;
  desde: string;
  hasta: string | null;
}

export interface ProyectoItem {
  nombre: string;
  descripcion: string | null;
  url: string | null;
  tecnologias: string[];
}

export interface IdiomaItem {
  idioma: string;
  nivel: string; // 'basico' | 'intermedio' | 'avanzado' | 'nativo'
}

// Entidad pura. Espeja la tabla `curriculum` de esquema.sql.
export interface Curriculum {
  id: string;
  aspiranteId: string;
  titulo: string;
  resumen: string | null;
  educacion: EducacionItem[];
  experiencia: ExperienciaItem[];
  proyectos: ProyectoItem[];
  habilidades: string[];
  idiomas: IdiomaItem[];
  cvPdfUrl: string | null;
  esPrincipal: boolean;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

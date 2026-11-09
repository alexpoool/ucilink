import { Aspirante } from './aspirante.entity';

// Inputs del repositorio definidos en domain (entidades puras) para NO violar
// la dirección de dependencias domain ← application. Los DTOs zod de
// application derivan 1:1 de estas formas, nunca al revés.
export interface CrearAspiranteInput {
  nombre: string;
  apellido: string;
  telefono: string | null;
  carrera: string | null;
  semestre: number | null;
  bio: string | null;
  habilidades: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  portafolioUrl: string | null;
}

// Solo los campos presentes se actualizan (undefined = no tocar).
export interface ActualizarAspiranteInput {
  nombre?: string;
  apellido?: string;
  telefono?: string | null;
  carrera?: string | null;
  semestre?: number | null;
  bio?: string | null;
  habilidades?: string[];
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portafolioUrl?: string | null;
}

// Puerto del repositorio de aspirantes. Impl en infrastructure/.
export interface AspiranteRepository {
  buscarPorUsuarioId(usuarioId: string): Promise<Aspirante | null>;
  buscarPorId(id: string): Promise<Aspirante | null>;
  crear(input: CrearAspiranteInput, usuarioId: string): Promise<Aspirante>;
  actualizar(id: string, input: ActualizarAspiranteInput): Promise<Aspirante>;
}

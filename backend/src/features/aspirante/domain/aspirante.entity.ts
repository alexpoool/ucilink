// Entidad pura del dominio. Espeja la tabla `aspirante` de esquema.sql
// (usuario_id → usuarioId, linkedin_url → linkedinUrl, ...).
export interface Aspirante {
  id: string;
  usuarioId: string;
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
  createdAt: Date;
  updatedAt: Date;
}

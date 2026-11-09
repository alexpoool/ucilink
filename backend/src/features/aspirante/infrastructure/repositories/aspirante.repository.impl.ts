import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { Aspirante } from '@/features/aspirante/domain/aspirante.entity';
import { CrearAspiranteInput, ActualizarAspiranteInput } from '@/features/aspirante/domain/aspirante.repository';
import { Database } from '@/config/db';

interface AspiranteRow {
  id: string;
  usuario_id: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  carrera: string | null;
  semestre: number | null;
  bio: string | null;
  habilidades: string[] | null;
  linkedin_url: string | null;
  github_url: string | null;
  portafolio_url: string | null;
  created_at: Date;
  updated_at: Date;
}

function mapear(row: AspiranteRow): Aspirante {
  return {
    id: row.id,
    usuarioId: row.usuario_id,
    nombre: row.nombre,
    apellido: row.apellido,
    telefono: row.telefono,
    carrera: row.carrera,
    semestre: row.semestre,
    bio: row.bio,
    habilidades: row.habilidades ?? [],
    linkedinUrl: row.linkedin_url,
    githubUrl: row.github_url,
    portafolioUrl: row.portafolio_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const COLUMNAS = 'id, usuario_id, nombre, apellido, telefono, carrera, semestre, bio, habilidades, linkedin_url, github_url, portafolio_url, created_at, updated_at';

export class AspiranteRepositoryImpl implements AspiranteRepository {
  constructor(private readonly db: Database) {}

  async buscarPorUsuarioId(usuarioId: string): Promise<Aspirante | null> {
    const res = await this.db.query<AspiranteRow>(
      `SELECT ${COLUMNAS} FROM aspirante WHERE usuario_id = $1`,
      [usuarioId],
    );
    return res.rows[0] ? mapear(res.rows[0]) : null;
  }

  async buscarPorId(id: string): Promise<Aspirante | null> {
    const res = await this.db.query<AspiranteRow>(
      `SELECT ${COLUMNAS} FROM aspirante WHERE id = $1`,
      [id],
    );
    return res.rows[0] ? mapear(res.rows[0]) : null;
  }

  async crear(input: CrearAspiranteInput, usuarioId: string): Promise<Aspirante> {
    const res = await this.db.query<AspiranteRow>(
      `INSERT INTO aspirante (usuario_id, nombre, apellido, telefono, carrera, semestre, bio, habilidades, linkedin_url, github_url, portafolio_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${COLUMNAS}`,
      [
        usuarioId,
        input.nombre,
        input.apellido,
        input.telefono,
        input.carrera,
        input.semestre,
        input.bio,
        input.habilidades,
        input.linkedinUrl,
        input.githubUrl,
        input.portafolioUrl,
      ],
    );
    return mapear(res.rows[0]);
  }

  async actualizar(id: string, input: ActualizarAspiranteInput): Promise<Aspirante> {
    // Construcción dinámica de SET a partir SOLO de los campos presentes. Los
    // valores SIEMPRE viajan parametrizados ($n): nunca interpolación textual.
    const entradas = Object.entries(input).filter(([, v]) => v !== undefined);

    const snakeMap: Record<string, string> = {
      nombre: 'nombre',
      apellido: 'apellido',
      telefono: 'telefono',
      carrera: 'carrera',
      semestre: 'semestre',
      bio: 'bio',
      habilidades: 'habilidades',
      linkedinUrl: 'linkedin_url',
      githubUrl: 'github_url',
      portafolioUrl: 'portafolio_url',
    };

    const setSql = entradas
      .map(([campo], i) => `${snakeMap[campo]} = $${i + 2}`)
      .join(', ');
    const valores = entradas.map(([, v]) => v);

    const res = await this.db.query<AspiranteRow>(
      `UPDATE aspirante SET ${setSql}, updated_at = now() WHERE id = $1 RETURNING ${COLUMNAS}`,
      [id, ...valores],
    );
    return mapear(res.rows[0]);
  }
}

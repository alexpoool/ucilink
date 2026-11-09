import {
  CurriculumRepository,
  CrearCurriculumInput,
  ActualizarCurriculumInput,
} from '@/features/curriculum/domain/curriculum.repository';
import { Curriculum } from '@/features/curriculum/domain/curriculum.entity';
import { Database } from '@/config/db';

interface CurriculumRow {
  id: string;
  aspirante_id: string;
  titulo: string;
  resumen: string | null;
  educacion: unknown;
  experiencia: unknown;
  proyectos: unknown;
  habilidades: string[] | null;
  idiomas: unknown;
  cv_pdf_url: string | null;
  es_principal: boolean;
  visible: boolean;
  created_at: Date;
  updated_at: Date;
}

// JSONB llega como objetos JS ya parseados desde pg; casteamos al sub-tipo.
function mapear(row: CurriculumRow): Curriculum {
  return {
    id: row.id,
    aspiranteId: row.aspirante_id,
    titulo: row.titulo,
    resumen: row.resumen,
    educacion: (row.educacion as Curriculum['educacion']) ?? [],
    experiencia: (row.experiencia as Curriculum['experiencia']) ?? [],
    proyectos: (row.proyectos as Curriculum['proyectos']) ?? [],
    habilidades: row.habilidades ?? [],
    idiomas: (row.idiomas as Curriculum['idiomas']) ?? [],
    cvPdfUrl: row.cv_pdf_url,
    esPrincipal: row.es_principal,
    visible: row.visible,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const COLUMNAS =
  'id, aspirante_id, titulo, resumen, educacion, experiencia, proyectos, habilidades, idiomas, cv_pdf_url, es_principal, visible, created_at, updated_at';

export class CurriculumRepositoryImpl implements CurriculumRepository {
  constructor(private readonly db: Database) {}

  async listarPorAspiranteId(aspiranteId: string): Promise<Curriculum[]> {
    const res = await this.db.query<CurriculumRow>(
      `SELECT ${COLUMNAS} FROM curriculum WHERE aspirante_id = $1 ORDER BY created_at ASC`,
      [aspiranteId],
    );
    return res.rows.map(mapear);
  }

  async buscarPorId(id: string): Promise<Curriculum | null> {
    const res = await this.db.query<CurriculumRow>(`SELECT ${COLUMNAS} FROM curriculum WHERE id = $1`, [
      id,
    ]);
    return res.rows[0] ? mapear(res.rows[0]) : null;
  }

  async crear(
    input: CrearCurriculumInput,
    aspiranteId: string,
    esPrimero: boolean,
  ): Promise<Curriculum> {
    const res = await this.db.query<CurriculumRow>(
      `INSERT INTO curriculum
         (aspirante_id, titulo, resumen, educacion, experiencia, proyectos, habilidades, idiomas, cv_pdf_url, es_principal, visible)
       VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb,$7,$8::jsonb,$9,$10,$11)
       RETURNING ${COLUMNAS}`,
      [
        aspiranteId,
        input.titulo,
        input.resumen,
        JSON.stringify(input.educacion),
        JSON.stringify(input.experiencia),
        JSON.stringify(input.proyectos),
        input.habilidades,
        JSON.stringify(input.idiomas),
        input.cvPdfUrl,
        esPrimero, // el primero nace principal
        input.visible,
      ],
    );
    return mapear(res.rows[0]);
  }

  async actualizar(id: string, input: ActualizarCurriculumInput): Promise<Curriculum> {
    const snakeMap: Record<string, string> = {
      titulo: 'titulo',
      resumen: 'resumen',
      educacion: 'educacion',
      experiencia: 'experiencia',
      proyectos: 'proyectos',
      habilidades: 'habilidades',
      idiomas: 'idiomas',
      cvPdfUrl: 'cv_pdf_url',
      visible: 'visible',
    };
    const JsonFields = new Set(['educacion', 'experiencia', 'proyectos', 'idiomas', 'habilidades']);

    const entradas = Object.entries(input).filter(([, v]) => v !== undefined);
    const setSql = entradas
      .map(([campo], i) => `${snakeMap[campo]} = $${i + 2}${JsonFields.has(campo) ? '::jsonb' : ''}`)
      .join(', ');
    const valores = entradas.map(([campo, v]) =>
      JsonFields.has(campo) ? JSON.stringify(v) : v,
    );

    const res = await this.db.query<CurriculumRow>(
      `UPDATE curriculum SET ${setSql}, updated_at = now() WHERE id = $1 RETURNING ${COLUMNAS}`,
      [id, ...valores],
    );
    return mapear(res.rows[0]);
  }

  async marcarComoPrincipal(id: string, aspiranteId: string): Promise<void> {
    await this.db.query(
      `UPDATE curriculum
       SET es_principal = (id = $1), updated_at = now()
       WHERE aspirante_id = $2`,
      [id, aspiranteId],
    );
  }
}

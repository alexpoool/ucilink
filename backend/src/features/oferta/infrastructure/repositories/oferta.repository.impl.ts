import { OfertaRepository, FiltrosOfertas } from '@/features/oferta/domain/oferta.repository';
import { Oferta, OfertaResumen, CrearOfertaInput, ActualizarOfertaInput } from '@/features/oferta/domain/oferta.entity';
import { EstadoOferta } from '@/features/oferta/domain/estado-oferta.vo';
import { Database } from '@/config/db';

// SELECT unificado: JOIN condicional del nombre del autor (empresa o aspirante)
// + subconsulta de contadores de valoraciones (likes/dislikes = los dos emojis).
const SELECT_BASE = `
  SELECT o.id, o.autor_tipo, o.autor_id, o.tipo_oferta, o.titulo, o.descripcion,
         o.requisitos, o.habilidades_req, o.modalidad, o.ubicacion, o.salario_min,
         o.salario_max, o.tipo_contrato, o.objetivo, o.grupo_id, o.fecha_limite,
         o.cupos, o.estado, o.created_at, o.updated_at,
         COALESCE(e.nombre, a.nombre) AS autor_nombre,
         COALESCE(e.verificada, false) AS autor_verificado,
         e.logo_url AS autor_logo_url,
         COALESCE(v.likes, 0)    AS likes,
         COALESCE(v.dislikes, 0) AS dislikes
  FROM oferta o
  LEFT JOIN empresa   e ON o.autor_tipo = 'empresa'   AND e.id = o.autor_id
  LEFT JOIN aspirante a ON o.autor_tipo = 'aspirante' AND a.id = o.autor_id
  LEFT JOIN (
    SELECT oferta_id,
           COUNT(*) FILTER (WHERE reaccion = 'like')    AS likes,
           COUNT(*) FILTER (WHERE reaccion = 'dislike') AS dislikes
    FROM valoracion_oferta
    GROUP BY oferta_id
  ) v ON v.oferta_id = o.id
`;

interface OfertaRow {
  id: string;
  autor_tipo: 'aspirante' | 'empresa';
  autor_id: string;
  tipo_oferta: 'normal' | 'dash' | 'feat';
  titulo: string;
  descripcion: string;
  requisitos: string | null;
  habilidades_req: string[] | null;
  modalidad: string | null;
  ubicacion: string | null;
  salario_min: string | null;
  salario_max: string | null;
  tipo_contrato: string | null;
  objetivo: string | null;
  grupo_id: string | null;
  fecha_limite: Date | null;
  cupos: number;
  estado: EstadoOferta;
  created_at: Date;
  updated_at: Date;
  autor_nombre: string | null;
  autor_verificado: boolean;
  autor_logo_url: string | null;
  likes: string;
  dislikes: string;
}

function mapear(row: OfertaRow): OfertaResumen {
  return {
    oferta: {
      id: row.id,
      autorTipo: row.autor_tipo,
      autorId: row.autor_id,
      tipoOferta: row.tipo_oferta,
      titulo: row.titulo,
      descripcion: row.descripcion,
      requisitos: row.requisitos,
      habilidadesReq: row.habilidades_req ?? [],
      modalidad: row.modalidad,
      ubicacion: row.ubicacion,
      salarioMin: row.salario_min ? Number(row.salario_min) : null,
      salarioMax: row.salario_max ? Number(row.salario_max) : null,
      tipoContrato: row.tipo_contrato,
      objetivo: row.objetivo,
      grupoId: row.grupo_id,
      fechaLimite: row.fecha_limite,
      cupos: row.cupos,
      estado: row.estado,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    autorNombre: row.autor_nombre ?? '',
    autorVerificado: row.autor_verificado,
    autorLogoUrl: row.autor_logo_url,
    likes: Number(row.likes ?? 0),
    dislikes: Number(row.dislikes ?? 0),
  };
}

const INSERT_SQL = `
  INSERT INTO oferta
    (autor_tipo, autor_id, tipo_oferta, titulo, descripcion, requisitos,
     habilidades_req, modalidad, ubicacion, salario_min, salario_max,
     tipo_contrato, objetivo, grupo_id, fecha_limite, cupos, estado)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
`;

export class OfertaRepositoryImpl implements OfertaRepository {
  constructor(private readonly db: Database) {}

  async listarFeed(filtros: FiltrosOfertas): Promise<OfertaResumen[]> {
    // INVARIANTE: este método es el FEED PÚBLICO — siempre estado publicada,
    // sin importar lo que llegue en filtros.estado (defensa del impl).
    const where: string[] = ['o.estado = $1'];
    const params: unknown[] = ['publicada'];

    if (filtros.tipoOferta) { where.push(`o.tipo_oferta = $${params.length + 1}`); params.push(filtros.tipoOferta); }
    if (filtros.autorTipo) { where.push(`o.autor_tipo = $${params.length + 1}`); params.push(filtros.autorTipo); }
    if (filtros.modalidad) { where.push(`o.modalidad = $${params.length + 1}`); params.push(filtros.modalidad); }
    if (filtros.ubicacionContiene) {
      where.push(`o.ubicacion ILIKE $${params.length + 1}`);
      params.push(`%${filtros.ubicacionContiene}%`);
    }
    if (filtros.salarioMinDesde !== undefined) {
      where.push(`o.salario_max >= $${params.length + 1}`);
      params.push(filtros.salarioMinDesde);
    }
    if (filtros.habilidadesContiene?.length) {
      // @>: el array pedido DEBE estar contenido en habilidades_req
      where.push(`o.habilidades_req @> $${params.length + 1}`);
      params.push(filtros.habilidadesContiene);
    }

    const limit = Math.min(filtros.limit, 50);
    const limitParam = params.length + 1;
    const offsetParam = limitParam + 1;
    params.push(limit, filtros.offset);

    const res = await this.db.query<OfertaRow>(
      `${SELECT_BASE} WHERE ${where.join(' AND ')}
       ORDER BY o.created_at DESC LIMIT $${limitParam} OFFSET $${offsetParam}`,
      params,
    );
    return res.rows.map(mapear);
  }

  async listarPorAutor(autorTipo: 'aspirante' | 'empresa', autorId: string): Promise<OfertaResumen[]> {
    const res = await this.db.query<OfertaRow>(
      `${SELECT_BASE} WHERE o.autor_tipo = $1 AND o.autor_id = $2 ORDER BY o.created_at DESC`,
      [autorTipo, autorId],
    );
    return res.rows.map(mapear);
  }

  async buscarPorId(id: string): Promise<OfertaResumen | null> {
    const res = await this.db.query<OfertaRow>(`${SELECT_BASE} WHERE o.id = $1`, [id]);
    return res.rows[0] ? mapear(res.rows[0]) : null;
  }

  async crear(input: CrearOfertaInput): Promise<OfertaResumen> {
    const res = await this.db.query<{ id: string }>(
      `${INSERT_SQL}
       RETURNING id`,
      [
        input.autorTipo, input.autorId, input.tipoOferta, input.titulo,
        input.descripcion, input.requisitos, input.habilidadesReq, input.modalidad,
        input.ubicacion, input.salarioMin, input.salarioMax, input.tipoContrato,
        input.objetivo, input.grupoId, input.fechaLimite, input.cupos, input.estado,
      ],
    );

    const resumen = await this.buscarPorId(res.rows[0].id);
    if (!resumen) throw new Error('No fue posible recuperar la oferta recién creada');
    return resumen;
  }

  async actualizar(id: string, input: ActualizarOfertaInput): Promise<OfertaResumen> {
    const snakeMap: Record<string, string> = {
      titulo: 'titulo',
      descripcion: 'descripcion',
      requisitos: 'requisitos',
      habilidadesReq: 'habilidades_req',
      modalidad: 'modalidad',
      ubicacion: 'ubicacion',
      salarioMin: 'salario_min',
      salarioMax: 'salario_max',
      tipoContrato: 'tipo_contrato',
      objetivo: 'objetivo',
      fechaLimite: 'fecha_limite',
      cupos: 'cupos',
    };

    const entradas = Object.entries(input).filter(([, v]) => v !== undefined);
    if (entradas.length > 0) {
      const setSql = entradas.map(([campo], i) => `${snakeMap[campo]} = $${i + 2}`).join(', ');
      await this.db.query(`UPDATE oferta SET ${setSql}, updated_at = now() WHERE id = $1`, [
        id,
        ...entradas.map(([, v]) => v),
      ]);
    }

    const res = await this.db.query<OfertaRow>(`${SELECT_BASE} WHERE o.id = $1`, [id]);
    if (!res.rows[0]) throw new Error('No fue posible recuperar la oferta recién actualizada');
    return mapear(res.rows[0]);
  }

  async cambiarEstado(id: string, estado: EstadoOferta): Promise<OfertaResumen> {
    await this.db.query(`UPDATE oferta SET estado = $2, updated_at = now() WHERE id = $1`, [
      id,
      estado,
    ]);
    const res = await this.db.query<OfertaRow>(`${SELECT_BASE} WHERE o.id = $1`, [id]);
    if (!res.rows[0]) throw new Error('No fue posible recuperar la oferta tras cambiar de estado');
    return mapear(res.rows[0]);
  }
}

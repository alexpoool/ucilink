import {
  AdminRepository,
  MetricasPlataforma,
  Contador,
  OfertaAdmin,
} from '@/features/admin/domain/admin.repository';
import { Empresa } from '@/features/empresa/domain/empresa.entity';
import { EstadoOferta } from '@/features/oferta/domain/estado-oferta.vo';
import { Database } from '@/config/db';

// Lecturas GLOBALES del panel admin (SELECTs sobre tablas de otros features
// — el feature admin es el único que cruza tablas para métricas; las escrituras
// de moderación viven en los puertos de cada dominio (empresa/oferta)).
interface ContadorRow {
  clave: string;
  total: string;
}

interface OfertaAdminRow {
  id: string;
  titulo: string;
  estado: EstadoOferta;
  autor_tipo: string;
  autor_nombre: string | null;
  created_at: Date;
}

function numero(row: ContadorRow | undefined): number {
  return Number(row?.total ?? 0);
}

export class AdminRepositoryImpl implements AdminRepository {
  constructor(private readonly db: Database) {}

  async obtenerMetricas(): Promise<MetricasPlataforma> {
    const [usuarios, ofertas, postulaciones, grupos, cvs] = await Promise.all([
      this.db.query<ContadorRow>(
        'SELECT rol AS clave, COUNT(*) AS total FROM usuario GROUP BY rol',
      ),
      this.db.query<ContadorRow>(
        'SELECT estado AS clave, COUNT(*) AS total FROM oferta GROUP BY estado',
      ),
      this.db.query<ContadorRow>(
        'SELECT estado AS clave, COUNT(*) AS total FROM evaluacion_curriculum GROUP BY estado',
      ),
      this.db.query<ContadorRow>('SELECT \'grupos\' AS clave, COUNT(*) AS total FROM grupo'),
      this.db.query<ContadorRow>('SELECT \'cvs\' AS clave, COUNT(*) AS total FROM curriculum'),
    ]);

    return {
      usuariosPorRol: usuarios.rows.map((r) => ({ clave: r.clave, total: numero(r) })),
      ofertasPorEstado: ofertas.rows.map((r) => ({ clave: r.clave, total: numero(r) })),
      postulacionesPorEstado: postulaciones.rows.map((r) => ({ clave: r.clave, total: numero(r) })),
      totalGrupos: numero(grupos.rows[0]),
      totalCurriculos: numero(cvs.rows[0]),
    };
  }

  async listarOfertas(estado: EstadoOferta | null): Promise<OfertaAdmin[]> {
    const sql = `
      SELECT o.id, o.titulo, o.estado, o.autor_tipo::text AS autor_tipo,
             COALESCE(e.nombre, a.nombre || ' ' || a.apellido) AS autor_nombre,
             o.created_at
      FROM oferta o
      LEFT JOIN empresa e  ON o.autor_tipo = 'empresa'  AND e.id = o.autor_id
      LEFT JOIN aspirante a ON o.autor_tipo = 'aspirante' AND a.id = o.autor_id
      ${estado ? 'WHERE o.estado = $1' : ''}
      ORDER BY o.created_at DESC`;
    const res = await this.db.query<OfertaAdminRow>(sql, estado ? [estado] : []);
    return res.rows.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      estado: r.estado,
      autorTipo: r.autor_tipo,
      autorNombre: r.autor_nombre,
      createdAt: r.created_at,
    }));
  }

  async listarEmpresasPendientes(): Promise<Empresa[]> {
    const res = await this.db.query<EmpresaRow>(
      `SELECT ${COLUMNAS} FROM empresa WHERE verificada = false ORDER BY created_at ASC`,
    );
    return res.rows.map(mapearEmpresa);
  }
}

interface EmpresaRow {
  id: string;
  usuario_id: string;
  nombre: string;
  razon_social: string | null;
  ruc: string | null;
  sector: string | null;
  descripcion: string | null;
  sitio_web: string | null;
  logo_url: string | null;
  ciudad: string | null;
  verificada: boolean;
  created_at: Date;
  updated_at: Date;
}

const COLUMNAS =
  'id, usuario_id, nombre, razon_social, ruc, sector, descripcion, sitio_web, logo_url, ciudad, verificada, created_at, updated_at';

function mapearEmpresa(row: EmpresaRow): Empresa {
  return {
    id: row.id,
    usuarioId: row.usuario_id,
    nombre: row.nombre,
    razonSocial: row.razon_social,
    ruc: row.ruc,
    sector: row.sector,
    descripcion: row.descripcion,
    sitioWeb: row.sitio_web,
    logoUrl: row.logo_url,
    ciudad: row.ciudad,
    verificada: row.verificada,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type { Contador };

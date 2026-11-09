import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { Empresa } from '@/features/empresa/domain/empresa.entity';
import { CrearEmpresaInput, ActualizarEmpresaInput } from '@/features/empresa/domain/empresa.repository';
import { Database } from '@/config/db';

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

function mapear(row: EmpresaRow): Empresa {
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

const COLUMNAS =
  'id, usuario_id, nombre, razon_social, ruc, sector, descripcion, sitio_web, logo_url, ciudad, verificada, created_at, updated_at';

export class EmpresaRepositoryImpl implements EmpresaRepository {
  constructor(private readonly db: Database) {}

  async buscarPorUsuarioId(usuarioId: string): Promise<Empresa | null> {
    const res = await this.db.query<EmpresaRow>(`SELECT ${COLUMNAS} FROM empresa WHERE usuario_id = $1`, [
      usuarioId,
    ]);
    return res.rows[0] ? mapear(res.rows[0]) : null;
  }

  async buscarPorId(id: string): Promise<Empresa | null> {
    const res = await this.db.query<EmpresaRow>(`SELECT ${COLUMNAS} FROM empresa WHERE id = $1`, [id]);
    return res.rows[0] ? mapear(res.rows[0]) : null;
  }

  async crear(input: CrearEmpresaInput, usuarioId: string): Promise<Empresa> {
    const res = await this.db.query<EmpresaRow>(
      `INSERT INTO empresa (usuario_id, nombre, razon_social, ruc, sector, descripcion, sitio_web, logo_url, ciudad)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${COLUMNAS}`,
      [
        usuarioId,
        input.nombre,
        input.razonSocial,
        input.ruc,
        input.sector,
        input.descripcion,
        input.sitioWeb,
        input.logoUrl,
        input.ciudad,
      ],
    );
    return mapear(res.rows[0]);
  }

  async actualizar(id: string, input: ActualizarEmpresaInput): Promise<Empresa> {
    const snakeMap: Record<string, string> = {
      nombre: 'nombre',
      razonSocial: 'razon_social',
      ruc: 'ruc',
      sector: 'sector',
      descripcion: 'descripcion',
      sitioWeb: 'sitio_web',
      logoUrl: 'logo_url',
      ciudad: 'ciudad',
    };

    const entradas = Object.entries(input).filter(([, v]) => v !== undefined);
    const setSql = entradas.map(([campo], i) => `${snakeMap[campo]} = $${i + 2}`).join(', ');
    const valores = entradas.map(([, v]) => v);

    const res = await this.db.query<EmpresaRow>(
      `UPDATE empresa SET ${setSql}, updated_at = now() WHERE id = $1 RETURNING ${COLUMNAS}`,
      [id, ...valores],
    );
    return mapear(res.rows[0]);
  }

  async cambiarVerificacion(id: string, verificada: boolean): Promise<Empresa> {
    // Acción EXCLUSIVA del rol admin (feature admin, use-case verificar-empresa).
    const res = await this.db.query<EmpresaRow>(
      'UPDATE empresa SET verificada = $2, updated_at = now() WHERE id = $1 RETURNING ' + COLUMNAS,
      [id, verificada],
    );
    return mapear(res.rows[0]);
  }
}

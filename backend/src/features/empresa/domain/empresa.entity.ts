// Entidad pura. Espeja la tabla `empresa` de esquema.sql.
// `verificada` es auth del feature admin: nunca la modifica este feature.
export interface Empresa {
  id: string;
  usuarioId: string;
  nombre: string;
  razonSocial: string | null;
  ruc: string | null;
  sector: string | null;
  descripcion: string | null;
  sitioWeb: string | null;
  logoUrl: string | null;
  ciudad: string | null;
  verificada: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Inputs del repositorio definidos en domain (misma convención que aspirante).
export interface CrearEmpresaInput {
  nombre: string;
  razonSocial: string | null;
  ruc: string | null;
  sector: string | null;
  descripcion: string | null;
  sitioWeb: string | null;
  logoUrl: string | null;
  ciudad: string | null;
}

// Solo los campos presentes se actualizan.
export interface ActualizarEmpresaInput {
  nombre?: string;
  razonSocial?: string | null;
  ruc?: string | null;
  sector?: string | null;
  descripcion?: string | null;
  sitioWeb?: string | null;
  logoUrl?: string | null;
  ciudad?: string | null;
}

export interface EmpresaRepository {
  buscarPorUsuarioId(usuarioId: string): Promise<Empresa | null>;
  buscarPorId(id: string): Promise<Empresa | null>;
  crear(input: CrearEmpresaInput, usuarioId: string): Promise<Empresa>;
  actualizar(id: string, input: ActualizarEmpresaInput): Promise<Empresa>;
}

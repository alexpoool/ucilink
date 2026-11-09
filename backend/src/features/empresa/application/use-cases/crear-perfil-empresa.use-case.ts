import { EmpresaRepository, CrearEmpresaInput } from '@/features/empresa/domain/empresa.repository';
import { PerfilEmpresaYaExisteException } from '@/features/empresa/domain/perfil-ya-existe.exception';
import { crearPerfilEmpresaInputSchema, CrearPerfilEmpresaInput } from '../dtos/crear-empresa.dto';
import { mapearEmpresa, EmpresaDto } from '../empresa.mapper';

// UC: usuario con rol empresa crea su perfil (UNIQUE usuario_id → 409 si existe).
export class CrearPerfilEmpresaUseCase {
  constructor(private readonly empresaRepository: EmpresaRepository) {}

  async execute(input: unknown): Promise<EmpresaDto> {
    const dto: CrearPerfilEmpresaInput = crearPerfilEmpresaInputSchema.parse(input);

    const existente = await this.empresaRepository.buscarPorUsuarioId(dto.usuarioId);
    if (existente) throw new PerfilEmpresaYaExisteException();

    const entidad = await this.empresaRepository.crear(
      {
        nombre: dto.nombre,
        razonSocial: dto.razonSocial ?? null,
        ruc: dto.ruc ?? null,
        sector: dto.sector ?? null,
        descripcion: dto.descripcion ?? null,
        sitioWeb: dto.sitioWeb ?? null,
        logoUrl: dto.logoUrl ?? null,
        ciudad: dto.ciudad ?? null,
      } satisfies CrearEmpresaInput,
      dto.usuarioId,
    );

    return mapearEmpresa(entidad);
  }
}

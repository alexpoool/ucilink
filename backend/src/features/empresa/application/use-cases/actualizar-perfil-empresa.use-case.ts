import { EmpresaRepository, ActualizarEmpresaInput } from '@/features/empresa/domain/empresa.repository';
import { EmpresaNoEncontradaException } from '@/features/empresa/domain/empresa-no-encontrado.exception';
import { actualizarPerfilEmpresaInputSchema, ActualizarPerfilEmpresaInput } from '../dtos/actualizar-empresa.dto';
import { mapearEmpresa, EmpresaDto } from '../empresa.mapper';

// UC: actualización parcial del perfil por usuarioId del token.
export class ActualizarPerfilEmpresaUseCase {
  constructor(private readonly empresaRepository: EmpresaRepository) {}

  async execute(input: unknown): Promise<EmpresaDto> {
    const dto: ActualizarPerfilEmpresaInput = actualizarPerfilEmpresaInputSchema.parse(input);

    const empresa = await this.empresaRepository.buscarPorUsuarioId(dto.usuarioId);
    if (!empresa) throw new EmpresaNoEncontradaException();

    const { usuarioId, ...cambios } = dto;
    void usuarioId;
    const actualizada = await this.empresaRepository.actualizar(
      empresa.id,
      cambios satisfies ActualizarEmpresaInput,
    );

    return mapearEmpresa(actualizada);
  }
}

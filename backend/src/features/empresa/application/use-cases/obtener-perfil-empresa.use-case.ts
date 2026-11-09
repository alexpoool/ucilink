import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { EmpresaNoEncontradaException } from '@/features/empresa/domain/empresa-no-encontrado.exception';
import { z } from 'zod';
import { mapearEmpresa, EmpresaDto } from '../empresa.mapper';

// UC: la empresa autenticada obtiene su propio perfil.
export class ObtenerPerfilEmpresaUseCase {
  constructor(private readonly empresaRepository: EmpresaRepository) {}

  async execute(input: unknown): Promise<EmpresaDto> {
    const { usuarioId } = z.object({ usuarioId: z.string().uuid() }).parse(input);

    const empresa = await this.empresaRepository.buscarPorUsuarioId(usuarioId);
    if (!empresa) throw new EmpresaNoEncontradaException();

    return mapearEmpresa(empresa);
  }
}

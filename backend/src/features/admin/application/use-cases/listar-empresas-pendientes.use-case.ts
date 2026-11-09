import { z } from 'zod';
import { AdminRepository } from '../domain/admin.repository';
import { Empresa } from '@/features/empresa/domain/empresa.entity';

// UC: empresas aún no verificadas (el sello habla de confianza en el feed).
export class ListarEmpresasPendientesUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(input: unknown): Promise<Empresa[]> {
    z.object({ adminId: z.string().uuid() }).parse(input);
    return this.adminRepository.listarEmpresasPendientes();
  }
}

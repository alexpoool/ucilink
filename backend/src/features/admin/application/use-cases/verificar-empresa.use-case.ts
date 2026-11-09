import { z } from 'zod';
import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { EmpresaNoEncontradaException } from '@/features/empresa/domain/empresa-no-encontrado.exception';
import { CreadorNotificaciones } from '@/shared/domain/creador-notificaciones.port';

// UC: el admin VERIFICA (o revierte) la confianza de una empresa. Cruza
// dominios por puerto (empresa) y notifica 'sistema' al titular del perfil.
// Idempotente: re-verificar una ya verificada simplemente re-escribe true.
export class VerificarEmpresaUseCase {
  constructor(
    private readonly empresaRepository: EmpresaRepository,
    private readonly creadorNotificaciones: CreadorNotificaciones,
  ) {}

  async execute(input: unknown): Promise<{ empresaId: string; verificada: boolean }> {
    const { empresaId, verificada } = z
      .object({ empresaId: z.string().uuid(), verificada: z.boolean() })
      .parse(input);

    const empresa = await this.empresaRepository.buscarPorId(empresaId);
    if (!empresa) throw new EmpresaNoEncontradaException();

    const actualizada = await this.empresaRepository.cambiarVerificacion(empresa.id, verificada);

    if (verificada) {
      await this.creadorNotificaciones.crear({
        usuarioId: actualizada.usuarioId,
        tipo: 'sistema',
        referenciaId: actualizada.id,
      });
    }

    return { empresaId: actualizada.id, verificada: actualizada.verificada };
  }
}

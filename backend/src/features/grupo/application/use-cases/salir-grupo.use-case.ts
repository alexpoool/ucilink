import { z } from 'zod';
import { GrupoRepository, GrupoMiembroRepository } from '@/features/grupo/domain/grupo.repository';
import { GrupoNoEncontradoException } from '@/features/grupo/domain/grupo-no-encontrado.exception';
import { InvitacionInvalidaException } from '@/features/grupo/domain/invitacion-invalida.exception';
import { AccionNoPermitidaException } from '@/features/grupo/domain/accion-no-permitida.exception';
import { puedeTransitarGrupo } from '@/features/grupo/domain/estado-grupo.vo';
import { mapearMiembro, GrupoMiembroDto } from '../grupo.mapper';

// UC: un miembro ACEPTADO sale del grupo (estado 'salido'). El líder NO puede
// salir — debe cerrar el grupo. Si la salida deja hueco en un grupo 'completo',
// vuelve a 'formando' (VO de estados).
export class SalirGrupoUseCase {
  constructor(
    private readonly grupoRepository: GrupoRepository,
    private readonly miembroRepository: GrupoMiembroRepository,
  ) {}

  async execute(input: unknown): Promise<GrupoMiembroDto> {
    const { grupoId, aspiranteId } = z
      .object({ grupoId: z.string().uuid(), aspiranteId: z.string().uuid() })
      .parse(input);

    const grupo = await this.grupoRepository.buscarPorId(grupoId);
    if (!grupo) throw new GrupoNoEncontradoException();

    const membresia = await this.miembroRepository.buscar(grupo.id, aspiranteId);
    if (!membresia || membresia.estado !== 'aceptado') throw new InvitacionInvalidaException();

    if (grupo.liderId === aspiranteId) {
      throw new AccionNoPermitidaException('El líder no puede salir del grupo: ciérralo');
    }

    const salida = await this.miembroRepository.cambiarEstadoMiembro(membresia.id, 'salido');

    if (grupo.estado === 'completo' && puedeTransitarGrupo('completo', 'formando')) {
      await this.grupoRepository.cambiarEstado(grupo.id, 'formando');
    }

    return mapearMiembro(salida);
  }
}

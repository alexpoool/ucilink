import { z } from 'zod';
import { GrupoRepository, GrupoMiembroRepository } from '@/features/grupo/domain/grupo.repository';
import { GrupoNoEncontradoException } from '@/features/grupo/domain/grupo-no-encontrado.exception';
import { InvitacionInvalidaException } from '@/features/grupo/domain/invitacion-invalida.exception';
import { GrupoLlenoException } from '@/features/grupo/domain/grupo-lleno.exception';
import { puedeTransitarGrupo } from '@/features/grupo/domain/estado-grupo.vo';
import { responderInvitacionSchema } from '../dtos/grupo.dto';
import { mapearMiembro, GrupoMiembroDto } from '../grupo.mapper';

// UC: el aspirante invitado ACEPTA o RECHAZA su invitación (identificada por
// grupoId + su perfil — UNIQUE(grupo_id, aspirante_id) la localiza).
// Al aceptar, si se alcanza max_miembros y el grupo sigue 'formando',
// transiciona a 'completo' (VO de estados decide la legalidad).
export class ResponderInvitacionUseCase {
  constructor(
    private readonly grupoRepository: GrupoRepository,
    private readonly miembroRepository: GrupoMiembroRepository,
  ) {}

  async execute(input: unknown): Promise<GrupoMiembroDto> {
    const { grupoId, aspiranteId, ...datos } = z
      .object({ grupoId: z.string().uuid(), aspiranteId: z.string().uuid(), ...responderInvitacionSchema.shape })
      .parse(input);

    const grupo = await this.grupoRepository.buscarPorId(grupoId);
    if (!grupo) throw new GrupoNoEncontradoException();

    const invitacion = await this.miembroRepository.buscar(grupo.id, aspiranteId);
    if (!invitacion || invitacion.estado !== 'invitado') throw new InvitacionInvalidaException();

    if (!datos.aceptar) {
      const rechazada = await this.miembroRepository.cambiarEstadoMiembro(invitacion.id, 'rechazado');
      return mapearMiembro(rechazada);
    }

    const aceptados = await this.grupoRepository.contarMiembrosAceptados(grupo.id);
    if (aceptados >= grupo.maxMiembros) throw new GrupoLlenoException(); // carrera: otro aceptó primero

    const aceptada = await this.miembroRepository.cambiarEstadoMiembro(invitacion.id, 'aceptado');

    if (aceptados + 1 >= grupo.maxMiembros && puedeTransitarGrupo(grupo.estado, 'completo')) {
      await this.grupoRepository.cambiarEstado(grupo.id, 'completo');
    }

    return mapearMiembro(aceptada);
  }
}

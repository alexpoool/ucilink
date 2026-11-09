import { z } from 'zod';
import { GrupoRepository, GrupoMiembroRepository } from '@/features/grupo/domain/grupo.repository';
import { GrupoNoEncontradoException } from '@/features/grupo/domain/grupo-no-encontrado.exception';
import { NoEsLiderException } from '@/features/grupo/domain/no-es-lider.exception';
import { GrupoLlenoException } from '@/features/grupo/domain/grupo-lleno.exception';
import { AccionNoPermitidaException } from '@/features/grupo/domain/accion-no-permitida.exception';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { CreadorNotificaciones } from '@/shared/domain/creador-notificaciones.port';
import { invitarSchema } from '../dtos/grupo.dto';
import { mapearMiembro, GrupoMiembroDto } from '../grupo.mapper';

// UC: el líder invita a otro aspirante al grupo. Crea la fila grupo_miembro
// en estado 'invitado' y NOTIFICA 'invitacion_grupo' al aspirante (misma
// semántica postular: la notificación nace EN este use-case). No se notifica
// si el grupo ya está cerrado/postulado (no se admiten nuevos).
export class InvitarMiembroUseCase {
  constructor(
    private readonly grupoRepository: GrupoRepository,
    private readonly miembroRepository: GrupoMiembroRepository,
    private readonly aspiranteRepository: AspiranteRepository,
    private readonly creadorNotificaciones: CreadorNotificaciones,
  ) {}

  async execute(input: unknown): Promise<GrupoMiembroDto> {
    const dto = invitarSchema.extend({ liderId: z.string().uuid() }).parse(input);

    const grupo = await this.grupoRepository.buscarPorId(dto.grupoId);
    if (!grupo) throw new GrupoNoEncontradoException();
    if (grupo.liderId !== dto.liderId) throw new NoEsLiderException();

    if (grupo.estado === 'cerrado' || grupo.estado === 'postulado') {
      throw new AccionNoPermitidaException(
        `No se pueden invitar miembros a un grupo ${grupo.estado}`,
      );
    }

    if (await this.miembroRepository.buscar(grupo.id, dto.aspiranteId)) {
      throw new AccionNoPermitidaException('Ese aspirante ya está en el grupo'); // incl. SELF (líder)
    }

    // Cupos: invitados vigentes + aceptados no deben superar max_miembros.
    const aceptados = await this.grupoRepository.contarMiembrosAceptados(grupo.id);
    if (aceptados >= grupo.maxMiembros) throw new GrupoLlenoException();

    const invitado = await this.aspiranteRepository.buscarPorId(dto.aspiranteId);
    if (!invitado) throw new AspiranteNoEncontradoException();

    const miembro = await this.miembroRepository.agregar(
      grupo.id,
      dto.aspiranteId,
      dto.rolEnGrupo ?? null,
      dto.curriculumId ?? null,
    );

    await this.creadorNotificaciones.crear({
      usuarioId: invitado.usuarioId,
      tipo: 'invitacion_grupo',
      referenciaId: grupo.id,
    });

    return mapearMiembro(miembro);
  }
}

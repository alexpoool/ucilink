import { NotificacionRepository } from '../domain/notificacion.repository';
import { mapearNotificacion, NotificacionDto } from '../notificacion.mapper';
import { z } from 'zod';

// UC: listar las notificaciones DEL TOKEN + contador de no leídas.
export class ListarNotificacionesUseCase {
  constructor(private readonly notificacionRepository: NotificacionRepository) {}

  async execute(input: unknown): Promise<{ notificaciones: NotificacionDto[]; noLeidas: number }> {
    const { usuarioId, soloNoLeidas } = z
      .object({ usuarioId: z.string().uuid(), soloNoLeidas: z.boolean().optional() })
      .parse(input);

    const lista = await this.notificacionRepository.listarPorUsuario(usuarioId);
    const filtrada = soloNoLeidas ? lista.filter((n) => !n.leida) : lista;
    const noLeidas = lista.filter((n) => !n.leida).length;

    return { notificaciones: filtrada.map(mapearNotificacion), noLeidas };
  }
}

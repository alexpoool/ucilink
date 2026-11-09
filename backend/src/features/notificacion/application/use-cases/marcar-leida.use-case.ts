import { NotificacionRepository } from '../domain/notificacion.repository';
import { NotificacionNoEncontradaException } from '../domain/notificacion-no-encontrada.exception';
import { mapearNotificacion, NotificacionDto } from '../notificacion.mapper';
import { z } from 'zod';

// UC: marcar UNA notificación como leída (guard de propiedad: si no es del
// token, 404 — no se revela la existencia ajena).
export class MarcarLeidaUseCase {
  constructor(private readonly notificacionRepository: NotificacionRepository) {}

  async execute(input: unknown): Promise<NotificacionDto> {
    const { notificacionId, usuarioId } = z
      .object({ notificacionId: z.string().uuid(), usuarioId: z.string().uuid() })
      .parse(input);

    const marcada = await this.notificacionRepository.marcarLeida(notificacionId, usuarioId).catch(() => null);
    if (!marcada) throw new NotificacionNoEncontradaException();
    return mapearNotificacion(marcada);
  }
}

// UC: marcar TODAS como leídas de golpe; devuelve cuántas cambió.
export class MarcarTodasLeidasUseCase {
  constructor(private readonly notificacionRepository: NotificacionRepository) {}

  async execute(input: unknown): Promise<{ actualizadas: number }> {
    const { usuarioId } = z.object({ usuarioId: z.string().uuid() }).parse(input);
    return { actualizadas: await this.notificacionRepository.marcarTodasLeidas(usuarioId) };
  }
}

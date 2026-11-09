import { NotificacionRepository } from '@/features/notificacion/domain/notificacion.repository';
import { CreadorNotificaciones, CrearNotificacionInput } from '@/shared/domain/creador-notificaciones.port';

// IMPL del puerto compartido (regla de AGENT.md: la interfaz vive en shared/,
// la implementación aquí). Delgada: delega en el repository del feature.
// Los UCs de evaluacion/grupo reciben ESTA clase por constructor.
export class CreadorNotificacionesImpl implements CreadorNotificaciones {
  constructor(private readonly notificacionRepository: NotificacionRepository) {}

  async crear(input: CrearNotificacionInput): Promise<void> {
    // El tipo ya viene validado por los use-cases remitentes ('cv_recibido',
    // 'invitacion_grupo'); el enum de DB cierra el candado por si acaso.
    await this.notificacionRepository.crear(input);
  }
}

import { Notificacion } from './notificacion.entity';

// Puerto del feature notificacion. `crear` también lo usa la IMPL del puerto
// compartido (CreadorNotificaciones) activada por otros features.
export interface NotificacionRepository {
  crear(input: { usuarioId: string; tipo: string; referenciaId: string | null }): Promise<void>;
  listarPorUsuario(usuarioId: string): Promise<Notificacion[]>;
  contarNoLeidas(usuarioId: string): Promise<number>;
  marcarLeida(id: string, usuarioId: string): Promise<Notificacion>;
  marcarTodasLeidas(usuarioId: string): Promise<number>;
}

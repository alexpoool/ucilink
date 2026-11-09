import { Notificacion } from '../domain/notificacion.entity';

export interface NotificacionDto {
  id: string;
  tipo: string;
  referenciaId: string | null;
  leida: boolean;
  createdAt: string;
}

export function mapearNotificacion(n: Notificacion): NotificacionDto {
  return {
    id: n.id,
    tipo: n.tipo,
    referenciaId: n.referenciaId,
    leida: n.leida,
    createdAt: n.createdAt.toISOString(),
  };
}

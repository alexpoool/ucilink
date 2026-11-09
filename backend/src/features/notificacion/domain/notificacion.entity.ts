import { TipoNotificacion } from './tipo-notificacion.vo';

// Tabla notificacion (migración 20261109): avisos por usuario, opcionalmente
// referenciando el recurso que los originó (oferta, grupo…).
export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: TipoNotificacion;
  referenciaId: string | null;
  leida: boolean;
  createdAt: Date;
}

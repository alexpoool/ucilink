// Puerto compartido para crear notificaciones.
// Lo usan 2+ features (evaluacion, notificacion) → por la regla 3.6 de AGENT.md
// ("si lo usan 2+ features, va en shared/") la INTERFAZ vive aquí y la
// implementación concreta vive en features/notificacion/infrastructure.
export interface CrearNotificacionInput {
  usuarioId: string;
  tipo: string;
  referenciaId: string | null;
}

export interface CreadorNotificaciones {
  crear(input: CrearNotificacionInput): Promise<void>;
}

export const TIPOS_NOTIFICACION = ['cv_recibido', 'invitacion_grupo', 'valoracion', 'respuesta', 'sistema'] as const;

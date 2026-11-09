// Espeja el enum tipo_notificacion de la migración (esquema.sql NO define
// esta tabla; la añadimos por migración up()/down()).
export type TipoNotificacion =
  | 'cv_recibido'
  | 'invitacion_grupo'
  | 'valoracion'
  | 'respuesta'
  | 'sistema';

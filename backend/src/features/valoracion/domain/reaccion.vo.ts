// Espeja el enum reaccion de esquema.sql.
export type Reaccion = 'like' | 'dislike';

// Resultado del toggle de valoración (lo consume el DTO de respuesta).
export type EstadoReaccion = Reaccion | 'ninguno';

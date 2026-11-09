// Valoración (fila común de las 3 tablas del esquema: valoracion_oferta,
// valoracion_curriculum, valoracion_curriculum_aspirante). El nombre de las
// columnas difiere por tabla (aspirante_id / empresa_id) — el repositorio impl
// sabe cuál usar; el dominio modeling la MISMA forma.
export interface Valoracion {
  actorId: string; // aspirante_id o empresa_id según la tabla
  sujetoId: string; // oferta_id o curriculum_id según la tabla
  reaccion: 'like' | 'dislike';
  createdAt: Date;
  updatedAt: Date;
}

// Resumen público de una entidad valorable (counts para el frontend).
export interface ResumenValoraciones {
  likes: number;
  dislikes: number;
}

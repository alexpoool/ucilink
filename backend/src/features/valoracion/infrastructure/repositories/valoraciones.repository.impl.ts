import {
  ValoracionOfertaRepository,
  ValoracionCurriculumRepository,
  ValoracionCurriculumAspiranteRepository,
} from '@/features/valoracion/domain/valoracion.repository';
import { Reaccion, EstadoReaccion, ResumenValoraciones } from '@/features/valoracion/domain/reaccion.vo';
import { Database } from '@/config/db';

// NÚCLEO con el toggle genérico sobre las 3 tablas del patrón. Los tres
// ADAPTADORES de abajo implementan cada puerto llevando SU tabla/columna.
type TablaValoracion = 'oferta' | 'curriculum_empresa' | 'curriculum_aspirante';

function especifico(tabla: TablaValoracion): {
  tablaNombre: string;
  columnaActor: string;
  columnaSujeto: string;
} {
  switch (tabla) {
    case 'oferta':
      return { tablaNombre: 'valoracion_oferta', columnaActor: 'aspirante_id', columnaSujeto: 'oferta_id' };
    case 'curriculum_empresa':
      return {
        tablaNombre: 'valoracion_curriculum',
        columnaActor: 'empresa_id',
        columnaSujeto: 'curriculum_id',
      };
    case 'curriculum_aspirante':
      return {
        tablaNombre: 'valoracion_curriculum_aspirante',
        columnaActor: 'aspirante_id',
        columnaSujeto: 'curriculum_id',
      };
  }
}

export class ValoracionesNucleo {
  constructor(private readonly db: Database) {}

  toggle(
    tabla: TablaValoracion,
    actorId: string,
    sujetoId: string,
    reaccion: Reaccion,
  ): Promise<EstadoReaccion> {
    const { tablaNombre, columnaActor, columnaSujeto } = especifico(tabla);

    return this.db.transaction(async (client) => {
      const resSelect = await client.query<FilaValoracion>(
        `SELECT reaccion FROM ${tablaNombre} WHERE ${columnaActor} = $1 AND ${columnaSujeto} = $2`,
        [actorId, sujetoId],
      );
      const previa = resSelect.rows[0];

      if (!previa) {
        await client.query(
          `INSERT INTO ${tablaNombre} (${columnaActor}, ${columnaSujeto}, reaccion) VALUES ($1, $2, $3)`,
          [actorId, sujetoId, reaccion],
        );
        return reaccion;
      }

      if (previa.reaccion === reaccion) {
        // misma reacción otra vez → QUITAR (toggle)
        await client.query(
          `DELETE FROM ${tablaNombre} WHERE ${columnaActor} = $1 AND ${columnaSujeto} = $2`,
          [actorId, sujetoId],
        );
        return 'ninguno';
      }

      // distinta → reemplazar (like⇄dislike)
      await client.query(
        `UPDATE ${tablaNombre} SET reaccion = $3, updated_at = now()
         WHERE ${columnaActor} = $1 AND ${columnaSujeto} = $2`,
        [actorId, sujetoId, reaccion],
      );
      return reaccion;
    });
  }

  contar(tabla: TablaValoracion, sujetoId: string): Promise<ResumenValoraciones> {
    const { tablaNombre, columnaSujeto } = especifico(tabla);
    return this.db.query<{ likes: string; dislikes: string }>(
      `SELECT COUNT(*) FILTER (WHERE reaccion = 'like') AS likes,
              COUNT(*) FILTER (WHERE reaccion = 'dislike') AS dislikes
       FROM ${tablaNombre} WHERE ${columnaSujeto} = $1`,
      [sujetoId],
    ).then((res) => ({
      likes: Number(res.rows[0]?.likes ?? 0),
      dislikes: Number(res.rows[0]?.dislikes ?? 0),
    }));
  }
}

interface FilaValoracion {
  reaccion: Reaccion;
}

// Adaptador: puerto ValoracionOfertaRepository (funcionalidad 7).
export class ValoracionOfertaRepositoryImpl implements ValoracionOfertaRepository {
  constructor(private readonly nucleo: ValoracionesNucleo) {}
  valorar(aspiranteId: string, ofertaId: string, reaccion: Reaccion): Promise<EstadoReaccion> {
    return this.nucleo.toggle('oferta', aspiranteId, ofertaId, reaccion);
  }
  resumen(ofertaId: string): Promise<ResumenValoraciones> {
    return this.nucleo.contar('oferta', ofertaId);
  }
}

// Adaptador: puerto ValoracionCurriculumRepository (funcionalidad 8b — empresa).
export class ValoracionCurriculumRepositoryImpl implements ValoracionCurriculumRepository {
  constructor(private readonly nucleo: ValoracionesNucleo) {}
  valorar(empresaId: string, curriculumId: string, reaccion: Reaccion): Promise<EstadoReaccion> {
    return this.nucleo.toggle('curriculum_empresa', empresaId, curriculumId, reaccion);
  }
  resumen(curriculumId: string): Promise<ResumenValoraciones> {
    // El CV acumula reacciones de empresa + de otros aspirantes (SUMA de 2 tablas).
    return Promise.all([
      this.nucleo.contar('curriculum_empresa', curriculumId),
      this.nucleo.contar('curriculum_aspirante', curriculumId),
    ]).then(([e, a]) => ({ likes: e.likes + a.likes, dislikes: e.dislikes + a.dislikes }));
  }
}

// Adaptador: puerto ValoracionCurriculumAspiranteRepository (funcionalidad 8).
export class ValoracionCurriculumAspiranteRepositoryImpl
  implements ValoracionCurriculumAspiranteRepository
{
  constructor(private readonly nucleo: ValoracionesNucleo) {}
  valorar(
    aspiranteValoradorId: string,
    curriculumId: string,
    reaccion: Reaccion,
  ): Promise<EstadoReaccion> {
    return this.nucleo.toggle('curriculum_aspirante', aspiranteValoradorId, curriculumId, reaccion);
  }
  resumen(curriculumId: string): Promise<ResumenValoraciones> {
    return Promise.all([
      this.nucleo.contar('curriculum_empresa', curriculumId),
      this.nucleo.contar('curriculum_aspirante', curriculumId),
    ]).then(([e, a]) => ({ likes: e.likes + a.likes, dislikes: e.dislikes + a.dislikes }));
  }
}

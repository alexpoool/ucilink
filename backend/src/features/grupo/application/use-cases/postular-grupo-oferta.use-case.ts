import { z } from 'zod';
import { GrupoRepository, GrupoMiembroRepository } from '@/features/grupo/domain/grupo.repository';
import { GrupoNoEncontradoException } from '@/features/grupo/domain/grupo-no-encontrado.exception';
import { NoEsLiderException } from '@/features/grupo/domain/no-es-lider.exception';
import { AccionNoPermitidaException } from '@/features/grupo/domain/accion-no-permitida.exception';
import { CurriculumMiembroFaltanteException } from '@/features/grupo/domain/curriculum-miembro-faltante.exception';
import { puedeTransitarGrupo } from '@/features/grupo/domain/estado-grupo.vo';
import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { OfertaNoEncontradaException } from '@/features/oferta/domain/oferta-no-encontrada.exception';
import { EvaluacionRepository } from '@/features/evaluacion/domain/evaluacion.repository';
import { PostulacionDuplicadaException } from '@/features/evaluacion/domain/postulacion-duplicada.exception';
import { CurriculumRepository } from '@/features/curriculum/domain/curriculum.repository';
import { CurriculumAjenoException } from '@/features/curriculum/domain/curriculum-ajeno.exception';
import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { CreadorNotificaciones } from '@/shared/domain/creador-notificaciones.port';
import { mapearGrupo, GrupoDto } from '../grupo.mapper';

/** UC: el líder postula el GRUPO a una oferta creada por una empresa.
 *  Reglas:
 *   - grupo en 'formando' | 'completo' (no 'postulado'/'cerrado');
 *   - TODA miembro aceptada (incluido el líder) porta su CV en grupo_miembro;
 *   - crea UNA fila evaluacion_curriculum por CV (curriculum_id es NOT NULL);
 *   - CVs ya postulados individualmente se OMITEN; si NINGUNO es nuevo → 409;
 *   - notificaciones 'cv_recibido' por CV nuevo (como la postulación individual);
 *   - el grupo transiciona a 'postulado' (VO de estados). */
export class PostularGrupoOfertaUseCase {
  constructor(
    private readonly grupoRepository: GrupoRepository,
    private readonly miembroRepository: GrupoMiembroRepository,
    private readonly ofertaRepository: OfertaRepository,
    private readonly evaluacionRepository: EvaluacionRepository,
    private readonly curriculumRepository: CurriculumRepository,
    private readonly empresaRepository: EmpresaRepository,
    private readonly creadorNotificaciones: CreadorNotificaciones,
  ) {}

  async execute(input: unknown): Promise<{ grupo: GrupoDto; postulacionesCreadas: number }> {
    const { grupoId, ofertaId, liderId } = z
      .object({ grupoId: z.string().uuid(), ofertaId: z.string().uuid(), liderId: z.string().uuid() })
      .parse(input);

    const grupo = await this.grupoRepository.buscarPorId(grupoId);
    if (!grupo) throw new GrupoNoEncontradoException();
    if (grupo.liderId !== liderId) throw new NoEsLiderException();

    if (!puedeTransitarGrupo(grupo.estado, 'postulado')) {
      throw new AccionNoPermitidaException(
        grupo.estado === 'postulado'
          ? 'El grupo ya postuló a una oferta'
          : `Un grupo cerrado no puede postular`,
      );
    }

    const oferta = await this.ofertaRepository.buscarPorId(ofertaId);
    if (!oferta || oferta.oferta.estado !== 'publicada') throw new OfertaNoEncontradaException();

    const miembros = (await this.miembroRepository.listarDeGrupo(grupo.id)).filter(
      (m) => m.estado === 'aceptado',
    );
    if (miembros.length === 0) {
      throw new AccionNoPermitidaException('El grupo no tiene miembros aceptados');
    }

    // Validar ANTES de escribir: todo CV existe, es DEL miembro y es nuevo.
    for (const miembro of miembros) {
      if (!miembro.curriculumId) throw new CurriculumMiembroFaltanteException();

      const cv = await this.curriculumRepository.buscarPorId(miembro.curriculumId);
      if (!cv || cv.aspiranteId !== miembro.aspiranteId) throw new CurriculumAjenoException();
    }

    const empresa =
      oferta.oferta.autorTipo === 'empresa'
        ? await this.empresaRepository.buscarPorId(oferta.oferta.autorId)
        : null;

    let creadas = 0;
    for (const miembro of miembros) {
      if (await this.evaluacionRepository.existePostulacion(ofertaId, miembro.curriculumId!)) {
        continue; // ese CV ya postuló solo; el resto del grupo sí entra
      }

      await this.evaluacionRepository.crear({
        ofertaId,
        curriculumId: miembro.curriculumId!,
        aspiranteId: miembro.aspiranteId,
        grupoId: grupo.id,
      });
      creadas++;

      if (empresa) {
        await this.creadorNotificaciones.crear({
          usuarioId: empresa.usuarioId,
          tipo: 'cv_recibido',
          referenciaId: ofertaId,
        });
      }
    }

    if (creadas === 0) throw new PostulacionDuplicadaException(); // todo el grupo ya estaba

    const grupoPostulado = await this.grupoRepository.cambiarEstado(grupo.id, 'postulado');
    return { grupo: mapearGrupo(grupoPostulado), postulacionesCreadas: creadas };
  }
}

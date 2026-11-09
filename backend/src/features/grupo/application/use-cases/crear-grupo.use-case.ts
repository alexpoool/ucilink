import { z } from 'zod';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { GrupoRepository, GrupoMiembroRepository, CrearGrupoInput } from '../domain/grupo.repository';
import { crearGrupoSchema } from '../dtos/grupo.dto';
import { mapearGrupo, GrupoDto } from '../grupo.mapper';

/** Resultado: el grupo ya nace con su líder como miembro aceptado.
 *  Decisión de producto: el líder es miembro implícito con estado 'aceptado'
 *  (fila en grupo_miembro con rol 'líder') — uniformiza recuentos y la
 *  postulación grupal (que itera grupo_miembro). */
export class CrearGrupoUseCase {
  constructor(
    private readonly aspiranteRepository: AspiranteRepository,
    private readonly grupoRepository: GrupoRepository,
    private readonly miembroRepository: GrupoMiembroRepository,
  ) {}

  async execute(input: unknown): Promise<GrupoDto> {
    const { usuarioId, ...datos } = crearGrupoSchema.extend({ usuarioId: z.string().uuid() }).parse(input);

    const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(usuarioId);
    if (!aspirante) throw new AspiranteNoEncontradoException();

    const alta: CrearGrupoInput = {
      nombre: datos.nombre,
      descripcion: datos.descripcion ?? null,
      liderId: aspirante.id,
      maxMiembros: datos.maxMiembros ?? 4,
    };

    const grupo = await this.grupoRepository.crear(alta);
    // líder = miembro implícito aceptado (rol_en_grupo 'líder', sin CV aún).
    await this.miembroRepository.agregar(grupo.id, aspirante.id, 'líder', null);

    return mapearGrupo(grupo);
  }
}

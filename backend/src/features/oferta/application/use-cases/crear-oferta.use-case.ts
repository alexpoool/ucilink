import { OfertaRepository, CrearOfertaInput } from '@/features/oferta/domain/oferta.repository';
import { esCoherenteAutorTipo, AutorTipo } from '@/features/oferta/domain/tipo-oferta.vo';
import { AutorTipoIncoherenteException } from '@/features/oferta/domain/autor-tipo-incoherente.exception';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { EmpresaNoEncontradaException } from '@/features/empresa/domain/empresa-no-encontrado.exception';
import { crearOfertaInputSchema, CrearOfertaUcInput } from '../dtos/crear-oferta.dto';
import { mapearOferta, OfertaDto } from '../oferta.mapper';

// UC: publicar una oferta.
//   • empresa  → tipoOferta normal | dash   (autor = perfil empresa)
//   • aspirante → tipoOferta feat           (autor = perfil aspirante)
// La coherencia autor/tipo se valida DOS veces: zod (contrato) y VO (dominio);
// la DB cierra la tercera (CHECK oferta_autor_tipo_coherente).
// El autorId NUNCA viene del cliente: se resuelve del token buscando el perfil.
export class CrearOfertaUseCase {
  constructor(
    private readonly ofertaRepository: OfertaRepository,
    private readonly aspiranteRepository: AspiranteRepository,
    private readonly empresaRepository: EmpresaRepository,
  ) {}

  async execute(input: unknown): Promise<OfertaDto> {
    const dto: CrearOfertaUcInput = crearOfertaInputSchema.parse(input);

    const autorTipo = dto.rol as AutorTipo;
    if (!esCoherenteAutorTipo(autorTipo, dto.tipoOferta)) {
      throw new AutorTipoIncoherenteException(autorTipo, dto.tipoOferta);
    }

    const autorId = await this.resolverAutorId(autorTipo, dto.usuarioId);

    const resumen = await this.ofertaRepository.crear({
      autorTipo,
      autorId,
      tipoOferta: dto.tipoOferta,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      requisitos: dto.requisitos ?? null,
      habilidadesReq: dto.habilidadesReq ?? [],
      modalidad: dto.modalidad ?? null,
      ubicacion: dto.ubicacion ?? null,
      salarioMin: dto.salarioMin ?? null,
      salarioMax: dto.salarioMax ?? null,
      tipoContrato: dto.tipoContrato ?? null,
      objetivo: dto.objetivo ?? null,
      grupoId: null, // el grupo entra al postular (grupo/postular-oferta-en-grupo)
      fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : null,
      cupos: dto.cupos,
      estado: dto.estado,
    } satisfies CrearOfertaInput);

    return mapearOferta(resumen);
  }

  // Autor = perfil del feature correspondiente (domain ↔ domain).
  private async resolverAutorId(autorTipo: AutorTipo, usuarioId: string): Promise<string> {
    if (autorTipo === 'empresa') {
      const empresa = await this.empresaRepository.buscarPorUsuarioId(usuarioId);
      if (!empresa) throw new EmpresaNoEncontradaException();
      return empresa.id;
    }
    const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(usuarioId);
    if (!aspirante) throw new AspiranteNoEncontradoException();
    return aspirante.id;
  }
}

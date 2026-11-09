import { Request, Response, NextFunction } from 'express';
import { CrearGrupoUseCase } from '@/features/grupo/application/use-cases/crear-grupo.use-case';
import { InvitarMiembroUseCase } from '@/features/grupo/application/use-cases/invitar-miembro.use-case';
import { ResponderInvitacionUseCase } from '@/features/grupo/application/use-cases/responder-invitacion.use-case';
import { SalirGrupoUseCase } from '@/features/grupo/application/use-cases/salir-grupo.use-case';
import { CerrarGrupoUseCase } from '@/features/grupo/application/use-cases/cerrar-grupo.use-case';
import { PostularGrupoOfertaUseCase } from '@/features/grupo/application/use-cases/postular-grupo-oferta.use-case';
import { ListarGruposPropiosUseCase } from '@/features/grupo/application/use-cases/listar-grupos-propios.use-case';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';

// Controller de grupo: traduce HTTP únicamente; resuelve el perfil aspirante
// del token y pasa su ID de perfil (no usuario_id) a los use-cases.
export class GrupoController {
  constructor(
    private readonly crear: CrearGrupoUseCase,
    private readonly invitar: InvitarMiembroUseCase,
    private readonly responder: ResponderInvitacionUseCase,
    private readonly salir: SalirGrupoUseCase,
    private readonly cerrar: CerrarGrupoUseCase,
    private readonly postular: PostularGrupoOfertaUseCase,
    private readonly listarPropios: ListarGruposPropiosUseCase,
    private readonly aspiranteRepository: AspiranteRepository,
  ) {}

  private async perfil(req: Request) {
    const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(req.usuario!.id);
    if (!aspirante) throw new AspiranteNoEncontradoException();
    return aspirante.id;
  }

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const aspiranteId = await this.perfil(req);
      const dto = await this.crear.execute({ ...req.body, usuarioId: req.usuario!.id });
      res.status(201).json(dto);
    } catch (error) {
      next(error);
    }
  }

  async invitar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const liderId = await this.perfil(req);
      const dto = await this.invitar.execute({ ...req.body, grupoId: req.params.grupoId, liderId });
      res.status(201).json(dto);
    } catch (error) {
      next(error);
    }
  }

  async responderInvitacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const aspiranteId = await this.perfil(req);
      const dto = await this.responder.execute({ ...req.body, grupoId: req.params.grupoId, aspiranteId });
      res.status(200).json(dto);
    } catch (error) {
      next(error);
    }
  }

  async salir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const aspiranteId = await this.perfil(req);
      const dto = await this.salir.execute({ grupoId: req.params.grupoId, aspiranteId });
      res.status(200).json(dto);
    } catch (error) {
      next(error);
    }
  }

  async cerrar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const liderId = await this.perfil(req);
      const dto = await this.cerrar.execute({ grupoId: req.params.grupoId, liderId });
      res.status(200).json(dto);
    } catch (error) {
      next(error);
    }
  }

  async postular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const liderId = await this.perfil(req);
      const resultado = await this.postular.execute({
        grupoId: req.params.grupoId,
        ofertaId: req.body.ofertaId,
        liderId,
      });
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const aspiranteId = await this.perfil(req);
      const lista = await this.listarPropios.execute({ aspiranteId });
      res.status(200).json(lista);
    } catch (error) {
      next(error);
    }
  }
}

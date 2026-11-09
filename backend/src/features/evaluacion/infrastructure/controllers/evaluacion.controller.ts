import { Request, Response, NextFunction } from 'express';
import { PostularOfertaUseCase } from '@/features/evaluacion/application/use-cases/postular-oferta.use-case';
import { ListarPostulacionesDeOfertaUseCase } from '@/features/evaluacion/application/use-cases/listar-postulaciones-de-oferta.use-case';
import { ListarPostulacionesPropiasUseCase } from '@/features/evaluacion/application/use-cases/listar-postulaciones-propias.use-case';
import { EvaluarPostulacionUseCase } from '@/features/evaluacion/application/use-cases/evaluar-postulacion.use-case';
import { RetirarPostulacionUseCase } from '@/features/evaluacion/application/use-cases/retirar-postulacion.use-case';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { EmpresaNoEncontradaException } from '@/features/empresa/domain/empresa-no-encontrado.exception';

// Controller de evaluacion. SOLO traduce HTTP; la identidad del perfil
// (aspirante/empresa) la resuelve aquí en los handlers correspondientes:
// los use-cases NUNCA reciben usuarioId sin resolver hacia el perfil correcto.
export class EvaluacionController {
  constructor(
    private readonly postular: PostularOfertaUseCase,
    private readonly listarDeOferta: ListarPostulacionesDeOfertaUseCase,
    private readonly listarPropias: ListarPostulacionesPropiasUseCase,
    private readonly evaluar: EvaluarPostulacionUseCase,
    private readonly retirar: RetirarPostulacionUseCase,
    private readonly aspiranteRepository: AspiranteRepository,
    private readonly empresaRepository: EmpresaRepository,
  ) {}

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await this.postular.execute({
        ...req.body,
        usuarioId: req.usuario!.id,
        ofertaId: req.params.ofertaId,
      });
      res.status(201).json(dto);
    } catch (error) {
      next(error);
    }
  }

  async listarDeOferta(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresa = await this.empresaRepository.buscarPorUsuarioId(req.usuario!.id);
      if (!empresa) throw new EmpresaNoEncontradaException();

      const lista = await this.listarDeOferta.execute({
        empresaId: empresa.id,
        ofertaId: req.params.ofertaId,
      });
      res.status(200).json(lista);
    } catch (error) {
      next(error);
    }
  }

  async propias(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(req.usuario!.id);
      if (!aspirante) throw new AspiranteNoEncontradoException();

      const lista = await this.listarPropias.execute({ aspiranteId: aspirante.id });
      res.status(200).json(lista);
    } catch (error) {
      next(error);
    }
  }

  async evaluar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresa = await this.empresaRepository.buscarPorUsuarioId(req.usuario!.id);
      if (!empresa) throw new EmpresaNoEncontradaException();

      const dto = await this.evaluar.execute({
        ...req.body,
        empresaId: empresa.id,
        ofertaId: req.params.ofertaId,
        evaluacionId: req.params.evaluacionId,
      });
      res.status(200).json(dto);
    } catch (error) {
      next(error);
    }
  }

  async retirar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(req.usuario!.id);
      if (!aspirante) throw new AspiranteNoEncontradoException();

      const dto = await this.retirar.execute({
        evaluacionId: req.params.evaluacionId,
        aspiranteId: aspirante.id,
      });
      res.status(200).json(dto);
    } catch (error) {
      next(error);
    }
  }
}

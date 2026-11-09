import { Request, Response, NextFunction } from 'express';
import { ValorarOfertaUseCase } from '@/features/valoracion/application/use-cases/valorar-oferta.use-case';
import { ValorarCurriculumEmpresaUseCase, ValorarCurriculumAspiranteUseCase } from '@/features/valoracion/application/use-cases/valorar-curriculum.use-case';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { EmpresaNoEncontradaException } from '@/features/empresa/domain/empresa-no-encontrado.exception';

// Controller de valoraciones: identidad del perfil resuelta AQUÍ (del token);
// los use-cases reciben perfil (aspirante.id / empresa.id) NO usuarioId.
export class ValoracionController {
  constructor(
    private readonly valorarOferta: ValorarOfertaUseCase,
    private readonly valorarCvEmpresa: ValorarCurriculumEmpresaUseCase,
    private readonly valorarCvAspirante: ValorarCurriculumAspiranteUseCase,
    private readonly aspiranteRepository: AspiranteRepository,
    private readonly empresaRepository: EmpresaRepository,
  ) {}

  async oferta(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(req.usuario!.id);
      if (!aspirante) throw new AspiranteNoEncontradoException();

      const respuesta = await this.valorarOferta.execute({
        ...req.body,
        usuarioId: aspirante.id, // ATENCIÓN: para oferta el actor es el perfil aspirante
        ofertaId: req.params.ofertaId,
      });
      res.status(200).json(respuesta);
    } catch (error) {
      next(error);
    }
  }

  async cvEmpresa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresa = await this.empresaRepository.buscarPorUsuarioId(req.usuario!.id);
      if (!empresa) throw new EmpresaNoEncontradaException();

      const respuesta = await this.valorarCvEmpresa.execute({
        ...req.body,
        usuarioId: empresa.id, // actor empresa_id
        curriculumId: req.params.curriculumId,
      });
      res.status(200).json(respuesta);
    } catch (error) {
      next(error);
    }
  }

  async cvAspirante(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(req.usuario!.id);
      if (!aspirante) throw new AspiranteNoEncontradoException();

      const respuesta = await this.valorarCvAspirante.execute({
        ...req.body,
        usuarioId: aspirante.id, // actor aspirante_id (perfil)
        curriculumId: req.params.curriculumId,
      });
      res.status(200).json(respuesta);
    } catch (error) {
      next(error);
    }
  }
}

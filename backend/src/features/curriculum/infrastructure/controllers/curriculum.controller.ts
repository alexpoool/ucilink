import { Request, Response, NextFunction } from 'express';
import {
  CrearCurriculumUseCase,
} from '@/features/curriculum/application/use-cases/crear-curriculum.use-case';
import {
  ListarMisCurriculosUseCase,
} from '@/features/curriculum/application/use-cases/listar-mis-curriculos.use-case';
import {
  ObtenerCurriculumPublicoUseCase,
} from '@/features/curriculum/application/use-cases/obtener-curriculum-publico.use-case';
import {
  ActualizarCurriculumUseCase,
} from '@/features/curriculum/application/use-cases/actualizar-curriculum.use-case';
import {
  MarcarCurriculumPrincipalUseCase,
} from '@/features/curriculum/application/use-cases/marcar-curriculum-principal.use-case';

// Controller de curriculum: solo traducción HTTP ↔ use-cases. El id del CV
// público SIEMPRE viaja por params (nada de id del cliente para operaciones privadas).
export class CurriculumController {
  constructor(
    private readonly crear: CrearCurriculumUseCase,
    private readonly listarMios: ListarMisCurriculosUseCase,
    private readonly obtenerPublico: ObtenerCurriculumPublicoUseCase,
    private readonly actualizar: ActualizarCurriculumUseCase,
    private readonly marcarPrincipal: MarcarCurriculumPrincipalUseCase,
  ) {}

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await this.crear.execute({ ...req.body, usuarioId: req.usuario!.id });
      res.status(201).json(dto);
    } catch (error) {
      next(error);
    }
  }

  async listarPropios(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lista = await this.listarMios.execute({ usuarioId: req.usuario!.id });
      res.status(200).json(lista);
    } catch (error) {
      next(error);
    }
  }

  async publico(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await this.obtenerPublico.execute({ curriculumId: req.params.curriculumId });
      res.status(200).json(dto);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await this.actualizar.execute({
        ...req.body,
        usuarioId: req.usuario!.id,
        curriculumId: req.params.curriculumId,
      });
      res.status(200).json(dto);
    } catch (error) {
      next(error);
    }
  }

  async principal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.marcarPrincipal.execute({
        usuarioId: req.usuario!.id,
        curriculumId: req.params.curriculumId,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

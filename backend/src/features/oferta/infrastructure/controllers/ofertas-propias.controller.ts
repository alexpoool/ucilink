import { Request, Response, NextFunction } from 'express';
import { ListarMisOfertasUseCase } from '@/features/oferta/application/use-cases/listar-mis-ofertas.use-case';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { EmpresaNoEncontradaException } from '@/features/empresa/domain/empresa-no-encontrado.exception';

// Controller de "MIS ofertas" (dashboard empresa / lista feat aspirante).
// Traduce token → autor (perfil). Es SOLO resolución de identidad, no reglas
// de negocio (esas están en use-cases).
export class OfertasPropiasController {
  constructor(
    private readonly listarMias: ListarMisOfertasUseCase,
    private readonly aspiranteRepository: AspiranteRepository,
    private readonly empresaRepository: EmpresaRepository,
  ) {}

  async listado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rol = req.usuario!.rol;
      let autorTipo: 'aspirante' | 'empresa';
      let autorId: string;

      if (rol === 'empresa') {
        const empresa = await this.empresaRepository.buscarPorUsuarioId(req.usuario!.id);
        if (!empresa) throw new EmpresaNoEncontradaException();
        autorTipo = 'empresa';
        autorId = empresa.id;
      } else if (rol === 'aspirante') {
        const aspirante = await this.aspiranteRepository.buscarPorUsuarioId(req.usuario!.id);
        if (!aspirante) throw new AspiranteNoEncontradoException();
        autorTipo = 'aspirante';
        autorId = aspirante.id;
      } else {
        res.status(403).json({ message: 'Rol sin ofertas propias' });
        return;
      }

      const ofertas = await this.listarMias.execute({ autorTipo, autorId });
      res.status(200).json(ofertas);
    } catch (error) {
      next(error);
    }
  }
}

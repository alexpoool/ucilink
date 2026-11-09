import { CrearPerfilEmpresaUseCase } from '@/features/empresa/application/use-cases/crear-perfil-empresa.use-case';
import { ObtenerPerfilEmpresaUseCase } from '@/features/empresa/application/use-cases/obtener-perfil-empresa.use-case';
import { ActualizarPerfilEmpresaUseCase } from '@/features/empresa/application/use-cases/actualizar-perfil-empresa.use-case';
import { ObtenerMetricasEmpresaUseCase } from '@/features/empresa/application/use-cases/obtener-metricas-empresa.use-case';
import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { MetricasRepository, MetricasEmpresa } from '@/features/empresa/domain/metricas.repository';
import { EmpresaNoEncontradaException } from '@/features/empresa/domain/empresa-no-encontrado.exception';
import { PerfilEmpresaYaExisteException } from '@/features/empresa/domain/perfil-ya-existe.exception';
import { Empresa } from '@/features/empresa/domain/empresa.entity';

const empresa: Empresa = {
  id: '77777777-7777-7777-7777-777777777777',
  usuarioId: '22222222-2222-2222-2222-222222222222',
  nombre: 'Fintech Plus',
  razonSocial: null,
  ruc: '0000-0000-1',
  sector: 'fintech',
  descripcion: null,
  sitioWeb: null,
  logoUrl: null,
  ciudad: 'La Habana',
  verificada: false,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

function datosEmpresas(): jest.Mocked<EmpresaRepository> {
  return {
    buscarPorUsuarioId: jest.fn(),
    buscarPorId: jest.fn(),
    crear: jest.fn().mockResolvedValue(empresa),
    actualizar: jest.fn(),
  } as jest.Mocked<EmpresaRepository>;
}

function crearInput() {
  return { usuarioId: empresa.usuarioId, nombre: 'Fintech Plus', ruc: '0000-0000-1', sector: 'fintech' };
}

const metricas: MetricasEmpresa = {
  ofertasNormalesPublicadas: 3,
  ofertasDashPublicadas: 1,
  ofertasCerradas: 2,
  cvsRecibidos: 12,
  cvsPendientesRevision: 5,
  valoracionesRecibidas: 9,
};

describe('CrearPerfilEmpresaUseCase', () => {
  it('crea perfil con nulos por defecto y oculta usuarioId del DTO', async () => {
    const repo = datosEmpresas();
    repo.buscarPorUsuarioId.mockResolvedValue(null);

    const dto = await new CrearPerfilEmpresaUseCase(repo).execute(crearInput());

    expect(repo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Fintech Plus', ruc: '0000-0000-1', razonSocial: null }),
      empresa.usuarioId,
    );
    expect(dto.verificada).toBe(false);
  });

  it('lanza PerfilEmpresaYaExisteException si ya existe', async () => {
    const repo = datosEmpresas();
    repo.buscarPorUsuarioId.mockResolvedValue(empresa);

    await expect(new CrearPerfilEmpresaUseCase(repo).execute(crearInput())).rejects.toThrow(
      PerfilEmpresaYaExisteException,
    );
    expect(repo.crear).not.toHaveBeenCalled();
  });

  it('rechaza RUC con formato inválido (zod)', async () => {
    const repo = datosEmpresas();
    repo.buscarPorUsuarioId.mockResolvedValue(null);

    await expect(
      new CrearPerfilEmpresaUseCase(repo).execute({ ...crearInput(), ruc: 'mal-ruc' }),
    ).rejects.toThrow();
    expect(repo.crear).not.toHaveBeenCalled();
  });
});

describe('ObtenerPerfilEmpresaUseCase', () => {
  it('devuelve el perfil del usuario del token', async () => {
    const repo = datosEmpresas();
    repo.buscarPorUsuarioId.mockResolvedValue(empresa);

    const dto = await new ObtenerPerfilEmpresaUseCase(repo).execute({ usuarioId: empresa.usuarioId });
    expect(dto.nombre).toBe('Fintech Plus');
  });

  it('lanza EmpresaNoEncontradaException si no existe', async () => {
    const repo = datosEmpresas();
    repo.buscarPorUsuarioId.mockResolvedValue(null);

    await expect(
      new ObtenerPerfilEmpresaUseCase(repo).execute({ usuarioId: empresa.usuarioId }),
    ).rejects.toThrow(EmpresaNoEncontradaException);
  });
});

describe('ActualizarPerfilEmpresaUseCase', () => {
  it('actualiza SOLO los campos presentes', async () => {
    const repo = datosEmpresas();
    repo.buscarPorUsuarioId.mockResolvedValue(empresa);
    repo.actualizar.mockResolvedValue({ ...empresa, ciudad: 'Matanzas' });

    const dto = await new ActualizarPerfilEmpresaUseCase(repo).execute({
      usuarioId: empresa.usuarioId,
      ciudad: 'Matanzas',
    });

    expect(repo.actualizar).toHaveBeenCalledWith(empresa.id, { ciudad: 'Matanzas' });
    expect(dto.ciudad).toBe('Matanzas');
  });
});

describe('ObtenerMetricasEmpresaUseCase', () => {
  it('agrega métricas por empresaId resuelto del token', async () => {
    const repo = datosEmpresas();
    repo.buscarPorUsuarioId.mockResolvedValue(empresa);
    const metricasRepo: jest.Mocked<MetricasRepository> = {
      obtenerMetricas: jest.fn().mockResolvedValue(metricas),
    };

    const dto = await new ObtenerMetricasEmpresaUseCase(repo, metricasRepo).execute({
      usuarioId: empresa.usuarioId,
    });

    expect(metricasRepo.obtenerMetricas).toHaveBeenCalledWith(empresa.id);
    expect(dto.cvsPendientesRevision).toBe(5);
    expect(dto.ofertasDashPublicadas).toBe(1);
  });
});

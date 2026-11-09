import { CrearOfertaUseCase } from '@/features/oferta/application/use-cases/crear-oferta.use-case';
import { ListarOfertasFeedUseCase } from '@/features/oferta/application/use-cases/listar-ofertas-feed.use-case';
import { ObtenerOfertaPublicaUseCase } from '@/features/oferta/application/use-cases/obtener-oferta-publica.use-case';
import { ActualizarOfertaUseCase } from '@/features/oferta/application/use-cases/actualizar-oferta.use-case';
import { CambiarEstadoOfertaUseCase } from '@/features/oferta/application/use-cases/cambiar-estado-oferta.use-case';
import { OfertaRepository, FiltrosOfertas } from '@/features/oferta/domain/oferta.repository';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { AutorTipoIncoherenteException } from '@/features/oferta/domain/autor-tipo-incoherente.exception';
import { TransicionOfertaInvalidaException } from '@/features/oferta/domain/transicion-invalida.exception';
import { OfertaNoEncontradaException } from '@/features/oferta/domain/oferta-no-encontrada.exception';
import { NoEsAutorDeOfertaException } from '@/features/oferta/domain/no-es-autor.exception';
import { Oferta, OfertaResumen } from '@/features/oferta/domain/oferta.entity';
import { Empresa } from '@/features/empresa/domain/empresa.entity';

const empresa: Empresa = {
  id: '77777777-7777-7777-7777-777777777777',
  usuarioId: '22222222-2222-2222-2222-222222222222',
  nombre: 'Fintech Plus',
  razonSocial: null,
  ruc: null,
  sector: null,
  descripcion: null,
  sitioWeb: null,
  logoUrl: null,
  ciudad: null,
  verificada: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

function dataOferta(overrides: Partial<Oferta> = {}): Oferta {
  return {
    id: '88888888-8888-8888-8888-888888888888',
    autorTipo: 'empresa',
    autorId: empresa.id,
    tipoOferta: 'normal',
    titulo: 'Backend TS',
    descripcion: 'We build APIs',
    requisitos: null,
    habilidadesReq: ['Node'],
    modalidad: null,
    ubicacion: null,
    salarioMin: null,
    salarioMax: null,
    tipoContrato: null,
    objetivo: null,
    grupoId: null,
    fechaLimite: new Date('2026-12-01T00:00:00Z'),
    cupos: 1,
    estado: 'publicada',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

export function resumenOf(oferta: Oferta): OfertaResumen {
  return {
    oferta,
    autorNombre: 'Fintech Plus',
    autorVerificado: empresa.verificada,
    autorLogoUrl: null,
    likes: 3,
    dislikes: 1,
  };
}

function crearDatos() {
  const ofertaRepo: jest.Mocked<OfertaRepository> = {
    listarFeed: jest.fn().mockResolvedValue([resumenOf(dataOferta())]),
    listarPorAutor: jest.fn().mockResolvedValue([]),
    buscarPorId: jest.fn().mockResolvedValue(resumenOf(dataOferta())),
    crear: jest.fn().mockResolvedValue(resumenOf(dataOferta({ estado: 'publicada' }))),
    actualizar: jest.fn().mockResolvedValue(resumenOf(dataOferta({ titulo: 'Editado' }))),
    cambiarEstado: jest.fn().mockResolvedValue(resumenOf(dataOferta({ estado: 'cerrada' }))),
  };
  const aspiranteRepo: jest.Mocked<AspiranteRepository> = {
    buscarPorUsuarioId: jest.fn(),
    buscarPorId: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
  };
  const empresaRepo: jest.Mocked<EmpresaRepository> = {
    buscarPorUsuarioId: jest.fn().mockResolvedValue(empresa),
    buscarPorId: jest.fn().mockResolvedValue(empresa),
    crear: jest.fn(),
    actualizar: jest.fn(),
  };
  return { ofertaRepo, aspiranteRepo, empresaRepo };
}

const CuerpoEmpresa = {
  usuarioId: empresa.usuarioId,
  rol: 'empresa',
  tipoOferta: 'normal',
  titulo: 'Backend TS',
  descripcion: 'APIs para retail',
  salarioMin: 500,
  salarioMax: 900,
};

describe('CrearOfertaUseCase', () => {
  it('empresa publica normal → autorId resuelto de su perfil (no del body)', async () => {
    const { ofertaRepo, aspiranteRepo, empresaRepo } = crearDatos();

    const dto = await new CrearOfertaUseCase(ofertaRepo, aspiranteRepo, empresaRepo).execute(CuerpoEmpresa);

    expect(empresaRepo.buscarPorUsuarioId).toHaveBeenCalledWith(empresa.usuarioId);
    expect(ofertaRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ autorTipo: 'empresa', autorId: empresa.id, tipoOferta: 'normal' }),
    );
    expect(dto.autorVerificado).toBe(true);
    expect(dto.likes).toBe(3);
  });

  it('empresa NO puede publicar feat (espeja el CHECK)', async () => {
    const { ofertaRepo, aspiranteRepo, empresaRepo } = crearDatos();

    await expect(
      new CrearOfertaUseCase(ofertaRepo, aspiranteRepo, empresaRepo).execute({
        ...CuerpoEmpresa,
        tipoOferta: 'feat',
      }),
    ).rejects.toThrow(AutorTipoIncoherenteException);
    expect(ofertaRepo.crear).not.toHaveBeenCalled();
  });

  it('aspirante NO puede publicar normal; su cupos default es 1', async () => {
    const { ofertaRepo, aspiranteRepo, empresaRepo } = crearDatos();
    const aspirante = {
      id: '55555555-5555-5555-5555-555555555555',
      usuarioId: '11111111-1111-1111-1111-111111111111',
      nombre: 'Brisa',
      apellido: 'Casas',
      telefono: null,
      carrera: null,
      semestre: null,
      bio: null,
      habilidades: [],
      linkedinUrl: null,
      githubUrl: null,
      portafolioUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    aspiranteRepo.buscarPorUsuarioId.mockResolvedValue(aspirante);

    await expect(
      new CrearOfertaUseCase(ofertaRepo, aspiranteRepo, empresaRepo).execute({
        usuarioId: aspirante.usuarioId,
        rol: 'aspirante',
        tipoOferta: 'normal',
        titulo: 'Reinterpretada',
        descripcion: 'joint',
      }),
    ).rejects.toThrow(AutorTipoIncoherenteException);

    await expect(
      new CrearOfertaUseCase(ofertaRepo, aspiranteRepo, empresaRepo).execute({
        usuarioId: aspirante.usuarioId,
        rol: 'aspirante',
        tipoOferta: 'feat',
        titulo: 'Colaborar en proyecto',
        descripcion: 'Team para hacka',
      }),
    ).resolves.toHaveProperty('tipoOferta', 'feat');
  });

  it('fechaLimite DateTime string → Date en el input del repo', async () => {
    const { ofertaRepo, aspiranteRepo, empresaRepo } = crearDatos();
    await new CrearOfertaUseCase(ofertaRepo, aspiranteRepo, empresaRepo).execute({
      ...CuerpoEmpresa,
      fechaLimite: '2026-12-01T00:00:00.000Z',
    });
    const rec = (ofertaRepo.crear.mock.calls[0][0] as { fechaLimite: unknown }).fechaLimite;
    expect(rec).toBeInstanceOf(Date);
  });
});

describe('ListarOfertasFeedUseCase', () => {
  it('NO permite pedir estados distintos de publicada (feed público)', async () => {
    const { ofertaRepo } = crearDatos();

    await new ListarOfertasFeedUseCase(ofertaRepo).execute({ limit: '10', offset: '0' });

    const filtros = (ofertaRepo.listarFeed.mock.calls[0][0] as FiltrosOfertas);
    expect(filtros.estado).toBe('publicada');
    expect(filtros.limit).toBe(10);
  });

  it('proyecta filtros a dominio (habilidades array, salarioMin)', async () => {
    const { ofertaRepo } = crearDatos();
    await new ListarOfertasFeedUseCase(ofertaRepo).execute({
      habilidades: ['Node', 'React'],
      salarioMin: '500',
      ubicacion: 'La Habana',
    });
    const filtros = (ofertaRepo.listarFeed.mock.calls[0][0] as FiltrosOfertas);
    expect(filtros.habilidadesContiene).toEqual(['Node', 'React']);
    expect(filtros.salarioMinDesde).toBe(500);
    expect(filtros.ubicacionContiene).toBe('La Habana');
  });
});

describe('ObtenerOfertaPublicaUseCase', () => {
  it('devuelve detalle; autorNombre/verificado van en el DTO', async () => {
    const { ofertaRepo } = crearDatos();
    const dto = await new ObtenerOfertaPublicaUseCase(ofertaRepo).execute({
      ofertaId: '88888888-8888-8888-8888-888888888888',
    });
    expect(dto.autorNombre).toBe('Fintech Plus');
  });

  it('Borrador o cancelada → 404 (sin revelar existencia)', async () => {
    const { ofertaRepo } = crearDatos();
    ofertaRepo.buscarPorId.mockResolvedValue(resumenOf(dataOferta({ estado: 'borrador' })));

    await expect(
      new ObtenerOfertaPublicaUseCase(ofertaRepo).execute({
        ofertaId: '88888888-8888-8888-8888-888888888888',
      }),
    ).rejects.toThrow(OfertaNoEncontradaException);
  });
});

describe('ActualizarOfertaUseCase', () => {
  it('actualiza SOLO si el usuario es el autor', async () => {
    const { ofertaRepo } = crearDatos();
    const dto = await new ActualizarOfertaUseCase(ofertaRepo).execute({
      usuarioId: empresa.usuarioId,
      ofertaId: '88888888-8888-8888-8888-888888888888',
      titulo: 'Editado',
    });
    expect(dto.titulo).toBe('Editado');
  });

  it('NO es el autor → 403', async () => {
    const { ofertaRepo } = crearDatos();
    await expect(
      new ActualizarOfertaUseCase(ofertaRepo).execute({
        usuarioId: '11111111-1111-1111-1111-111111111111',
        ofertaId: '88888888-8888-8888-8888-888888888888',
        titulo: 'hack',
      }),
    ).rejects.toThrow(NoEsAutorDeOfertaException);
  });

  it('oferta CERRADA o cancelada no editable', async () => {
    const { ofertaRepo } = crearDatos();
    ofertaRepo.buscarPorId.mockResolvedValue(resumenOf(dataOferta({ estado: 'cerrada' })));

    await expect(
      new ActualizarOfertaUseCase(ofertaRepo).execute({
        usuarioId: empresa.usuarioId,
        ofertaId: '88888888-8888-8888-8888-888888888888',
        titulo: 'nope',
      }),
    ).rejects.toThrow(OfertaNoEncontradaException);
  });
});

describe('CambiarEstadoOfertaUseCase', () => {
  const oid = '88888888-8888-8888-8888-888888888888';

  it('transición válida autor → portada', async () => {
    const { ofertaRepo } = crearDatos();
    const dto = await new CambiarEstadoOfertaUseCase(ofertaRepo).execute({
      ofertaId: oid,
      usuarioId: empresa.usuarioId,
      estado: 'cerrada',
    });
    expect(dto.estado).toBe('cerrada');
  });

  it('transición ILEGAL (borrador → cerrada) → 422', async () => {
    const { ofertaRepo } = crearDatos();
    ofertaRepo.buscarPorId.mockResolvedValue(resumenOf(dataOferta({ estado: 'borrador' })));

    await expect(
      new CambiarEstadoOfertaUseCase(ofertaRepo).execute({
        ofertaId: oid,
        usuarioId: empresa.usuarioId,
        estado: 'cerrada',
      }),
    ).rejects.toThrow(TransicionOfertaInvalidaException);
  });

  it('no autor → 403 aunque la transicion fuese legal', async () => {
    const { ofertaRepo } = crearDatos();
    await expect(
      new CambiarEstadoOfertaUseCase(ofertaRepo).execute({
        ofertaId: oid,
        usuarioId: '11111111-1111-1111-1111-111111111111',
        estado: 'cerrada',
      }),
    ).rejects.toThrow(NoEsAutorDeOfertaException);
  });

  it('admin puede cerrar sin ser autor (esAdmin=true)', async () => {
    const { ofertaRepo } = crearDatos();
    await expect(
      new CambiarEstadoOfertaUseCase(ofertaRepo).execute({
        ofertaId: oid,
        estado: 'cancelada',
        esAdmin: true,
      }),
    ).resolves.toHaveProperty('estado', 'cerrada');
  });
});

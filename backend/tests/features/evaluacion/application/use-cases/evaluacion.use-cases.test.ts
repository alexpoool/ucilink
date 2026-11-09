import { PostularOfertaUseCase } from '@/features/evaluacion/application/use-cases/postular-oferta.use-case';
import { EvaluarPostulacionUseCase } from '@/features/evaluacion/application/use-cases/evaluar-postulacion.use-case';
import { RetirarPostulacionUseCase } from '@/features/evaluacion/application/use-cases/retirar-postulacion.use-case';
import { ListarPostulacionesDeOfertaUseCase } from '@/features/evaluacion/application/use-cases/listar-postulaciones-de-oferta.use-case';
import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { CurriculumRepository } from '@/features/curriculum/domain/curriculum.repository';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { EvaluacionRepository } from '@/features/evaluacion/domain/evaluacion.repository';
import { CreadorNotificaciones, CrearNotificacionInput } from '@/shared/domain/creador-notificaciones.port';
import { PostulacionDuplicadaException } from '@/features/evaluacion/domain/postulacion-duplicada.exception';
import { CurriculumAjenoException } from '@/features/curriculum/domain/curriculum-ajeno.exception';
import { EvaluacionNoEncontradaException } from '@/features/evaluacion/domain/evaluacion-no-encontrada.exception';
import { TransicionInvalidaException } from '@/features/evaluacion/domain/transicion-invalida.exception';
import { OfertaResumen } from '@/features/oferta/domain/oferta.entity';
import { Oferta } from '@/features/oferta/domain/oferta.entity';
import { Aspirante } from '@/features/aspirante/domain/aspirante.entity';
import { Empresa } from '@/features/empresa/domain/empresa.entity';
import { Evaluacion } from '@/features/evaluacion/domain/evaluacion.entity';

const OFERTA_ID = 'aaaa1111-0000-0000-0000-000000000001';
const CV_ID = 'aaaa1111-0000-0000-0000-000000000002';
const EVAL_ID = 'aaaa1111-0000-0000-0000-000000000003';
const ASPIRANTE_ID = '55555555-5555-5555-5555-555555555555';
const EMPRESA_ID = '77777777-7777-7777-7777-777777777777';

const aspirante: Aspirante = {
  id: ASPIRANTE_ID,
  usuarioId: '11111111-1111-1111-1111-111111111111',
  nombre: 'Brisa', apellido: 'Casas',
  telefono: null, carrera: null, semestre: null, bio: null,
  habilidades: [], linkedinUrl: null, githubUrl: null, portafolioUrl: null,
  createdAt: new Date(), updatedAt: new Date(),
};

const empresa: Empresa = {
  id: EMPRESA_ID,
  usuarioId: '22222222-2222-2222-2222-222222222222',
  nombre: 'Fintech Plus',
  razonSocial: null, ruc: null, sector: null, descripcion: null,
  sitioWeb: null, logoUrl: null, ciudad: null, verificada: true,
  createdAt: new Date(), updatedAt: new Date(),
};

function ofertaResumen(overrides: Partial<Oferta> = {}): OfertaResumen {
  const oferta: Oferta = {
    id: OFERTA_ID, autorTipo: 'empresa', autorId: EMPRESA_ID,
    tipoOferta: 'normal', titulo: 'Backend TS', descripcion: 'd',
    requisitos: null, habilidadesReq: [], modalidad: null, ubicacion: null,
    salarioMin: null, salarioMax: null, tipoContrato: null, objetivo: null,
    grupoId: null, fechaLimite: null, cupos: 1, estado: 'publicada',
    createdAt: new Date(), updatedAt: new Date(), ...overrides,
  };
  return { oferta, autorNombre: empresa.nombre, autorVerificado: true, autorLogoUrl: null, likes: 0, dislikes: 0 };
}

function evaluacion(overrides: Partial<Evaluacion> = {}): Evaluacion {
  return {
    id: EVAL_ID, ofertaId: OFERTA_ID, curriculumId: CV_ID, aspiranteId: ASPIRANTE_ID,
    grupoId: null, estado: 'postulado', comentarioEmpresa: null, puntuacion: null,
    fechaPostulacion: new Date('2026-01-02T00:00:00Z'), fechaEvaluacion: null,
    evaluadoPorEmpresa: false, ...overrides,
  };
}

function datos() {
  const ofertaRepo: jest.Mocked<OfertaRepository> = {
    listarFeed: jest.fn(),
    listarPorAutor: jest.fn(),
    buscarPorId: jest.fn().mockResolvedValue(ofertaResumen()),
    crear: jest.fn(),
    actualizar: jest.fn(),
    cambiarEstado: jest.fn(),
  };
  const cvRepo: jest.Mocked<CurriculumRepository> = {
    listarPorAspiranteId: jest.fn(),
    buscarPorId: jest.fn().mockResolvedValue({
      id: CV_ID, aspiranteId: ASPIRANTE_ID, titulo: 'CV', resumen: null,
      educacion: [], experiencia: [], proyectos: [], habilidades: [], idiomas: [],
      cvPdfUrl: null, esPrincipal: true, visible: true, createdAt: new Date(), updatedAt: new Date(),
    }),
    crear: jest.fn(), actualizar: jest.fn(), marcarComoPrincipal: jest.fn(),
  };
  const aspiranteRepo: jest.Mocked<AspiranteRepository> = {
    buscarPorUsuarioId: jest.fn().mockResolvedValue(aspirante),
    buscarPorId: jest.fn(), crear: jest.fn(), actualizar: jest.fn(),
  };
  const empresaRepo: jest.Mocked<EmpresaRepository> = {
    buscarPorUsuarioId: jest.fn(), buscarPorId: jest.fn().mockResolvedValue(empresa),
    crear: jest.fn(), actualizar: jest.fn(), cambiarVerificacion: jest.fn(),
  };
  const evaluacionRepo: jest.Mocked<EvaluacionRepository> = {
    buscarPorId: jest.fn().mockResolvedValue(evaluacion()),
    existePostulacion: jest.fn().mockResolvedValue(false),
    crear: jest.fn().mockResolvedValue(evaluacion()),
    listarPorOferta: jest.fn().mockResolvedValue([evaluacion()]),
    listarPorAspirante: jest.fn().mockResolvedValue([evaluacion()]),
    cambiarEstado: jest.fn().mockResolvedValue(evaluacion({ estado: 'en_revision', evaluadoPorEmpresa: true, fechaEvaluacion: new Date() })),
    retirar: jest.fn().mockResolvedValue(evaluacion({ estado: 'retirado', fechaEvaluacion: new Date() })),
  };
  const notificaciones: jest.Mocked<CreadorNotificaciones> = { crear: jest.fn().mockResolvedValue(undefined) };
  return { ofertaRepo, cvRepo, aspiranteRepo, empresaRepo, evaluacionRepo, notificaciones };
}

describe('PostularOfertaUseCase — el UC "integrador" de notificaciones', () => {
  const UC = () => {
    const d = datos();
    return {
      uc: new PostularOfertaUseCase(d.ofertaRepo, d.cvRepo, d.aspiranteRepo, d.evaluacionRepo, d.empresaRepo, d.notificaciones),
      d,
    };
  };

  it('crea postulación Y notifica cv_recibido a la empresa EN el mismo use-case', async () => {
    const { uc, d } = UC();

    const dto = await uc.execute({ usuarioId: aspirante.usuarioId, curriculumId: CV_ID, ofertaId: OFERTA_ID });

    expect(d.evaluacionRepo.crear).toHaveBeenCalledWith({
      ofertaId: OFERTA_ID, curriculumId: CV_ID, aspiranteId: ASPIRANTE_ID, grupoId: null,
    });
    expect(d.notificaciones.crear).toHaveBeenCalledWith({
      usuarioId: empresa.usuarioId, tipo: 'cv_recibido', referenciaId: OFERTA_ID,
    } satisfies CrearNotificacionInput);
    expect(dto.estado).toBe('postulado');
  });

  it('postulación GRUPAL escribe grupo_id (feature grupo)', async () => {
    const { uc, d } = UC();
    const GrupoId = 'aaaa1111-0000-0000-0000-000000000009';

    await uc.execute({ usuarioId: aspirante.usuarioId, curriculumId: CV_ID, ofertaId: OFERTA_ID, grupoId: GrupoId });

    expect(d.evaluacionRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ grupoId: GrupoId }),
    );
  });

  it('postulación a una oferta FEAT se rechaza (feat es colab, no solicitud de empleo)', async () => {
    const { uc, d } = UC();
    d.ofertaRepo.buscarPorId.mockResolvedValue(ofertaResumen({ tipoOferta: 'feat' }));

    await expect(uc.execute({ usuarioId: aspirante.usuarioId, curriculumId: CV_ID, ofertaId: OFERTA_ID })).rejects.toThrow();
    expect(d.evaluacionRepo.crear).not.toHaveBeenCalled();
  });

  it('CV ajeno → CurriculumAjenoException sin crear postulación', async () => {
    const { uc, d } = UC();
    d.cvRepo.buscarPorId.mockResolvedValue({ ...d.cvRepo.buscarPorId.mockResolvedValue!, aspiranteId: '99' } as never);

    await expect(uc.execute({ usuarioId: aspirante.usuarioId, curriculumId: CV_ID, ofertaId: OFERTA_ID })).rejects.toThrow(
      CurriculumAjenoException,
    );
    expect(d.evaluacionRepo.crear).not.toHaveBeenCalled();
    expect(d.notificaciones.crear).not.toHaveBeenCalled();
  });

  it('duplicada (UNIQUE oferta+CV) → 409 y nada se crea ni notifica', async () => {
    const { uc, d } = UC();
    d.evaluacionRepo.existePostulacion.mockResolvedValue(true);

    await expect(uc.execute({ usuarioId: aspirante.usuarioId, curriculumId: CV_ID, ofertaId: OFERTA_ID })).rejects.toThrow(
      PostulacionDuplicadaException,
    );
    expect(d.evaluacionRepo.crear).not.toHaveBeenCalled();
    expect(d.notificaciones.crear).not.toHaveBeenCalled();
  });
});

describe('EvaluarPostulacionUseCase', () => {
  const AU = () => {
    const d = datos();
    return { uc: new EvaluarPostulacionUseCase(d.ofertaRepo, d.evaluacionRepo), d };
  };

  it('avanza postulado → en_revision; SIN comentario/puntuación (no cerró)', async () => {
    const { uc, d } = AU();
    await uc.execute({ ofertaId: OFERTA_ID, evaluacionId: EVAL_ID, empresaId: EMPRESA_ID, estado: 'en_revision' });
    expect(d.evaluacionRepo.cambiarEstado).toHaveBeenCalledWith(EVAL_ID, 'en_revision', true, null, null);
  });

  it('cierre (fichado) persiste comentario y puntuación', async () => {
    const { uc, d } = AU();
    d.evaluacionRepo.cambiarEstado.mockResolvedValue(
      evaluacion({ estado: 'fichado', evaluadoPorEmpresa: true, comentarioEmpresa: 'Genial', puntuacion: 5 }),
    );
    const dto = await uc.execute({
      ofertaId: OFERTA_ID, evaluacionId: EVAL_ID, empresaId: EMPRESA_ID,
      estado: 'fichado', comentarioEmpresa: 'Genial', puntuacion: 5,
    });
    expect(d.evaluacionRepo.cambiarEstado).toHaveBeenCalledWith(EVAL_ID, 'fichado', true, 'Genial', 5);
    expect(dto.comentarioEmpresa).toBe('Genial');
  });

  it('comentario/puntuación en setState no-cerrado → se IGNOREN (null)', async () => {
    const { uc, d } = AU();
    await uc.execute({
      ofertaId: OFERTA_ID, evaluacionId: EVAL_ID, empresaId: EMPRESA_ID,
      estado: 'en_revision', comentarioEmpresa: 'No debería persistir', puntuacion: 5,
    });
    expect(d.evaluacionRepo.cambiarEstado).toHaveBeenCalledWith(EVAL_ID, 'en_revision', true, null, null);
  });

  it('oferta de OTRA empresa → 403 sin mirar evaluaciones', async () => {
    const { uc, d } = AU();
    d.ofertaRepo.buscarPorId.mockResolvedValue(ofertaResumen({ oferta: { autorId: 'otra-empresa' } as never }));

    await expect(
      uc.execute({ ofertaId: OFERTA_ID, evaluacionId: EVAL_ID, empresaId: EMPRESA_ID, estado: 'en_revision' }),
    ).rejects.toThrow();
  });

  it('evaluación de otra oferta → 404 (pertenencia)', async () => {
    const { uc, d } = AU();
    d.evaluacionRepo.buscarPorId.mockResolvedValue(evaluacion({ ofertaId: 'otra-oferta' }));

    await expect(
      uc.execute({ ofertaId: OFERTA_ID, evaluacionId: EVAL_ID, empresaId: EMPRESA_ID, estado: 'en_revision' }),
    ).rejects.toThrow(EvaluacionNoEncontradaException);
  });

  it('salto ilegal (preseleccionado → en_revision) → 422', async () => {
    const { uc, d } = AU();
    d.evaluacionRepo.buscarPorId.mockResolvedValue(evaluacion({ estado: 'preseleccionado' }));

    await expect(
      uc.execute({ ofertaId: OFERTA_ID, evaluacionId: EVAL_ID, empresaId: EMPRESA_ID, estado: 'en_revision' }),
    ).rejects.toThrow(TransicionInvalidaException);
  });
});

describe('Retirar y listados', () => {
  it('retira SOLO si es del aspirante y estaba postulado', async () => {
    const d = datos();
    const uc = new RetirarPostulacionUseCase(d.evaluacionRepo);
    const dto = await uc.execute({ evaluacionId: EVAL_ID, aspiranteId: ASPIRANTE_ID });
    expect(dto.estado).toBe('retirado');
  });

  it('retirar evaluación ajena → 404', async () => {
    const d = datos();
    const uc = new RetirarPostulacionUseCase(d.evaluacionRepo);
    d.evaluacionRepo.buscarPorId.mockResolvedValue(evaluacion({ aspiranteId: 'otro' }));
    await expect(uc.execute({ evaluacionId: EVAL_ID, aspiranteId: ASPIRANTE_ID })).rejects.toThrow(
      EvaluacionNoEncontradaException,
    );
  });

  it('empresa lista postulaciones SOLO de SU oferta', async () => {
    const d = datos();
    const uc = new ListarPostulacionesDeOfertaUseCase(d.ofertaRepo, d.evaluacionRepo);
    d.ofertaRepo.buscarPorId.mockResolvedValue(ofertaResumen({ oferta: { autorId: 'otra' } as never }));

    await expect(uc.execute({ empresaId: EMPRESA_ID, ofertaId: OFERTA_ID })).rejects.toThrow();
  });
});

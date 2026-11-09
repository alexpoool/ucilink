import { ValorarOfertaUseCase } from '@/features/valoracion/application/use-cases/valorar-oferta.use-case';
import { ValorarCurriculumEmpresaUseCase, ValorarCurriculumAspiranteUseCase } from '@/features/valoracion/application/use-cases/valorar-curriculum.use-case';
import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { CurriculumRepository } from '@/features/curriculum/domain/curriculum.repository';
import { ValoracionOfertaRepository, ValoracionCurriculumRepository, ValoracionCurriculumAspiranteRepository } from '@/features/valoracion/domain/valoracion.repository';
import { AutopercepcionNoPermitidaException } from '@/features/valoracion/domain/autovaloracion.exception';
import { CurriculumNoEncontradoException } from '@/features/curriculum/domain/curriculum-no-encontrado.exception';
import { OfertaResumen } from '@/features/oferta/domain/oferta.entity';
import { Curriculum } from '@/features/curriculum/domain/curriculum.entity';

const OFERTA_ID = 'aaaa1111-0000-0000-0000-000000000001';
const CV_ID = 'aaaa1111-0000-0000-0000-000000000002';
const ASPIRANTE_PERFIL = '55555555-5555-5555-5555-555555555555';
const EMPRESA_PERFIL = '77777777-7777-7777-7777-777777777777';

function ofertaResumen(mio: boolean): OfertaResumen {
  return {
    oferta: {
      id: OFERTA_ID,
      autorTipo: 'aspirante',
      autorId: mio ? ASPIRANTE_PERFIL : 'otro-aspirante-99999999-9999-9999-9999-999999999999',
      tipoOferta: 'feat',
      titulo: 'Colaborar',
      descripcion: 'd',
      requisitos: null, habilidadesReq: [], modalidad: null, ubicacion: null,
      salarioMin: null, salarioMax: null, tipoContrato: null, objetivo: null,
      grupoId: null, fechaLimite: null, cupos: 2, estado: 'publicada',
      createdAt: new Date(), updatedAt: new Date(),
    },
    autorNombre: 'Brisa',
    autorVerificado: false,
    autorLogoUrl: null,
    likes: 2,
    dislikes: 0,
  };
}

function cvVisible(aspiranteId: string): Curriculum {
  return {
    id: CV_ID, aspiranteId, titulo: 'CV', resumen: null,
    educacion: [], experiencia: [], proyectos: [], habilidades: [], idiomas: [],
    cvPdfUrl: null, esPrincipal: true, visible: true,
    createdAt: new Date(), updatedAt: new Date(),
  };
}

function datosOferta(toggle: 'inserta' | 'quita' | 'cambia') {
  const ofertaRepo: jest.Mocked<OfertaRepository> = {
    listarFeed: jest.fn(), listarPorAutor: jest.fn(), buscarPorId: jest.fn().mockResolvedValue(ofertaResumen(false)),
    crear: jest.fn(), actualizar: jest.fn(), cambiarEstado: jest.fn(),
  };
  const vaRepo: jest.Mocked<ValoracionOfertaRepository> = {
    valorar: jest.fn().mockResolvedValue(toggle === 'inserta' ? 'like' : toggle === 'quita' ? 'ninguno' : 'dislike'),
    resumen: jest.fn().mockResolvedValue({ likes: 2, dislikes: 1 }),
  };
  return { ofertaRepo, vaRepo };
}

describe('ValorarOfertaUseCase (toggle)', () => {
  it('primer like → miReaccion like + resumen actualizado', async () => {
    const { ofertaRepo, vaRepo } = datosOferta('inserta');
    const uc = new ValorarOfertaUseCase(ofertaRepo, vaRepo);

    const out = await uc.execute({ actorId: ASPIRANTE_PERFIL, ofertaId: OFERTA_ID, reaccion: 'like' });
    expect(out.miReaccion).toBe('like');
    expect(out.likes).toBe(2);
    expect(vaRepo.valorar).toHaveBeenCalledWith(ASPIRANTE_PERFIL, OFERTA_ID, 'like');
  });

  it('mismo like otra vez → ninguno (quitar)', async () => {
    const { ofertaRepo, vaRepo } = datosOferta('quita');
    const out = await new ValorarOfertaUseCase(ofertaRepo, vaRepo).execute({
      actorId: ASPIRANTE_PERFIL, ofertaId: OFERTA_ID, reaccion: 'like',
    });
    expect(out.miReaccion).toBe('ninguno');
  });

  it('like→dislike reemplaza', async () => {
    const { ofertaRepo, vaRepo } = datosOferta('cambia');
    const out = await new ValorarOfertaUseCase(ofertaRepo, vaRepo).execute({
      actorId: ASPIRANTE_PERFIL, ofertaId: OFERTA_ID, reaccion: 'dislike',
    });
    expect(out.miReaccion).toBe('dislike');
  });

  it('propia oferta FEAT del aspirante → AutopercepcionNoPermitida', async () => {
    const { ofertaRepo, vaRepo } = datosOferta('inserta');
    ofertaRepo.buscarPorId.mockResolvedValue(ofertaResumen(true));

    await expect(
      new ValorarOfertaUseCase(ofertaRepo, vaRepo).execute({ actorId: ASPIRANTE_PERFIL, ofertaId: OFERTA_ID, reaccion: 'like' }),
    ).rejects.toThrow(AutopercepcionNoPermitidaException);
    expect(vaRepo.valorar).not.toHaveBeenCalled();
  });
});

describe('Valores de curriculum (8 y 8b)', () => {
  function cvDatos(aspiranteIdDelCv: string): jest.Mocked<CurriculumRepository> {
    const cvRepo: jest.Mocked<CurriculumRepository> = {
      listarPorAspiranteId: jest.fn(),
      buscarPorId: jest.fn().mockResolvedValue(cvVisible(aspiranteIdDelCv)),
      crear: jest.fn(), actualizar: jest.fn(), marcarComoPrincipal: jest.fn(),
    };
    return cvRepo;
  }

  it('8: aspirante valora CV ajeno visible', async () => {
    const cvRepo = cvDatos('otro-aspirante-99999999-9999-9999-9999-999999999999');
    const vcRepo: jest.Mocked<ValoracionCurriculumAspiranteRepository> = {
      valorar: jest.fn().mockResolvedValue('like'),
      resumen: jest.fn().mockResolvedValue({ likes: 5, dislikes: 1 }),
    };
    const out = await new ValorarCurriculumAspiranteUseCase(cvRepo, vcRepo).execute({
      actorId: ASPIRANTE_PERFIL, curriculumId: CV_ID, reaccion: 'like',
    });
    expect(out.miReaccion).toBe('like');
    expect(out.likes).toBe(5); // suma empresa+aspirantes
  });

  it('8: aspirante NO valora SU PROPIO CV', async () => {
    const cvRepo = cvDatos(ASPIRANTE_PERFIL);
    const vcRepo: jest.Mocked<ValoracionCurriculumAspiranteRepository> = {
      valorar: jest.fn(), resumen: jest.fn(),
    };
    await expect(
      new ValorarCurriculumAspiranteUseCase(cvRepo, vcRepo).execute({
        actorId: ASPIRANTE_PERFIL, curriculumId: CV_ID, reaccion: 'like',
      }),
    ).rejects.toThrow(AutopercepcionNoPermitidaException);
    expect(vcRepo.valorar).not.toHaveBeenCalled();
  });

  it('8b: empresa valora CV visible; CV oculto → 404', async () => {
    const cvRepo = cvDatos(ASPIRANTE_PERFIL);
    cvRepo.buscarPorId.mockResolvedValue({ ...cvVisible('x'), visible: false });
    const vcRepo: jest.Mocked<ValoracionCurriculumRepository> = {
      valorar: jest.fn(), resumen: jest.fn(),
    };
    await expect(
      new ValorarCurriculumEmpresaUseCase(cvRepo, vcRepo).execute({
        actorId: EMPRESA_PERFIL, curriculumId: CV_ID, reaccion: 'like',
      }),
    ).rejects.toThrow(CurriculumNoEncontradoException);
  });
});

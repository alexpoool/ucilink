import { CrearCurriculumUseCase } from '@/features/curriculum/application/use-cases/crear-curriculum.use-case';
import { ObtenerCurriculumPublicoUseCase } from '@/features/curriculum/application/use-cases/obtener-curriculum-publico.use-case';
import { ActualizarCurriculumUseCase } from '@/features/curriculum/application/use-cases/actualizar-curriculum.use-case';
import { MarcarCurriculumPrincipalUseCase } from '@/features/curriculum/application/use-cases/marcar-curriculum-principal.use-case';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { CurriculumRepository } from '@/features/curriculum/domain/curriculum.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { CurriculumNoEncontradoException } from '@/features/curriculum/domain/curriculum-no-encontrado.exception';
import { CurriculumAjenoException } from '@/features/curriculum/domain/curriculum-ajeno.exception';
import { Aspirante } from '@/features/aspirante/domain/aspirante.entity';
import { Curriculum } from '@/features/curriculum/domain/curriculum.entity';

const aspirante: Aspirante = {
  id: '55555555-5555-5555-5555-555555555555',
  usuarioId: '11111111-1111-1111-1111-111111111111',
  nombre: 'Brisa',
  apellido: 'Casas',
  telefono: null,
  carrera: 'CS',
  semestre: 6,
  bio: null,
  habilidades: [],
  linkedinUrl: null,
  githubUrl: null,
  portafolioUrl: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

const cv: Curriculum = {
  id: '66666666-6666-6666-6666-666666666666',
  aspiranteId: aspirante.id,
  titulo: 'Full-stack junior',
  resumen: 'TS + Node',
  educacion: [{ titulo: 'Lic. Informática', institucion: 'UCI', desde: '2022-09-01', hasta: null }],
  experiencia: [],
  proyectos: [{ nombre: 'Portal', descripcion: null, url: null, tecnologias: ['React'] }],
  habilidades: ['TS'],
  idiomas: [{ idioma: 'español', nivel: 'nativo' }],
  cvPdfUrl: null,
  esPrincipal: false,
  visible: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

function datos() {
  const aspiranteRepo: jest.Mocked<AspiranteRepository> = {
    buscarPorUsuarioId: jest.fn().mockResolvedValue(aspirante),
    buscarPorId: jest.fn().mockResolvedValue(aspirante),
    crear: jest.fn(),
    actualizar: jest.fn(),
  };
  const cvRepo: jest.Mocked<CurriculumRepository> = {
    listarPorAspiranteId: jest.fn().mockResolvedValue([]),
    buscarPorId: jest.fn().mockResolvedValue(cv),
    crear: jest.fn().mockResolvedValue({ ...cv, esPrincipal: true }),
    actualizar: jest.fn().mockResolvedValue({ ...cv, resumen: 'Nuevo' }),
    marcarComoPrincipal: jest.fn().mockResolvedValue(undefined),
  };
  return { aspiranteRepo, cvRepo };
}

const USUARIO = aspirante.usuarioId;

describe('CrearCurriculumUseCase', () => {
  it('el PRIMER CV nace es_principal=true', async () => {
    const { aspiranteRepo, cvRepo } = datos();

    const dto = await new CrearCurriculumUseCase(aspiranteRepo, cvRepo).execute({
      usuarioId: USUARIO,
      titulo: 'Full-stack junior',
      resumen: 'TS + Node',
      educacion: [{ titulo: 'Lic. Informática', institucion: 'UCI', desde: '2022-09-01', hasta: null }],
    });

    expect(cvRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ titulo: 'Full-stack junior', visible: true, educacion: expect.any(Array) }),
      aspirante.id,
      true,
    );
    expect(dto.esPrincipal).toBe(true);
    expect(dto.aspirante?.nombre).toBe('Brisa');
  });

  it('el SEGUNDO CV NO nace principal', async () => {
    const { aspiranteRepo, cvRepo } = datos();
    cvRepo.listarPorAspiranteId.mockResolvedValue([cv]);

    await new CrearCurriculumUseCase(aspiranteRepo, cvRepo).execute({
      usuarioId: USUARIO,
      titulo: 'CV 2',
    });

    expect(cvRepo.crear).toHaveBeenLastCalledWith(expect.anything(), aspirante.id, false);
  });

  it('sin perfil → AspiranteNoEncontrado y no crea CV', async () => {
    const { aspiranteRepo, cvRepo } = datos();
    aspiranteRepo.buscarPorUsuarioId.mockResolvedValue(null);

    await expect(
      new CrearCurriculumUseCase(aspiranteRepo, cvRepo).execute({ usuarioId: USUARIO, titulo: 'x' }),
    ).rejects.toThrow(AspiranteNoEncontradoException);
    expect(cvRepo.crear).not.toHaveBeenCalled();
  });
});

describe('ObtenerCurriculumPublicoUseCase', () => {
  it('devuelve CV visible con datos del aspirante', async () => {
    const { aspiranteRepo, cvRepo } = datos();

    const dto = await new ObtenerCurriculumPublicoUseCase(aspiranteRepo, cvRepo).execute({
      curriculumId: cv.id,
    });
    expect(dto.aspirante?.apellido).toBe('Casas');
  });

  it('CV oculto (visible=false) → 404 SIN filtrar datos', async () => {
    const { aspiranteRepo, cvRepo } = datos();
    cvRepo.buscarPorId.mockResolvedValue({ ...cv, visible: false });

    await expect(
      new ObtenerCurriculumPublicoUseCase(aspiranteRepo, cvRepo).execute({ curriculumId: cv.id }),
    ).rejects.toThrow(CurriculumNoEncontradoException);
  });
});

describe('Actualización y propiedad', () => {
  it('ActualizarCurriculumUseCase: el dueño actualiza parcialmente', async () => {
    const { aspiranteRepo, cvRepo } = datos();

    const dto = await new ActualizarCurriculumUseCase(aspiranteRepo, cvRepo).execute({
      usuarioId: USUARIO,
      curriculumId: cv.id,
      resumen: 'Nuevo',
    });

    expect(cvRepo.actualizar).toHaveBeenCalledWith(cv.id, { resumen: 'Nuevo' });
    expect(dto.resumen).toBe('Nuevo');
  });

  it('ActualizarCurriculumUseCase: CV de OTRO aspirante → CurriculumAjenoException', async () => {
    const { aspiranteRepo, cvRepo } = datos();
    cvRepo.buscarPorId.mockResolvedValue({ ...cv, aspiranteId: '99999999-9999-9999-9999-999999999999' });

    await expect(
      new ActualizarCurriculumUseCase(aspiranteRepo, cvRepo).execute({
        usuarioId: USUARIO,
        curriculumId: cv.id,
        resumen: 'hack',
      }),
    ).rejects.toThrow(CurriculumAjenoException);
    expect(cvRepo.actualizar).not.toHaveBeenCalled();
  });

  it('MarcarCurriculumPrincipalUseCase: marca el CV propio con exclusividad', async () => {
    const { aspiranteRepo, cvRepo } = datos();

    await new MarcarCurriculumPrincipalUseCase(aspiranteRepo, cvRepo).execute({
      usuarioId: USUARIO,
      curriculumId: cv.id,
    });

    expect(cvRepo.marcarComoPrincipal).toHaveBeenCalledWith(cv.id, aspirante.id);
  });

  it('MarcarCurriculumPrincipalUseCase: CV ajeno → CurriculumAjenoException', async () => {
    const { aspiranteRepo, cvRepo } = datos();
    cvRepo.buscarPorId.mockResolvedValue(null);

    await expect(
      new MarcarCurriculumPrincipalUseCase(aspiranteRepo, cvRepo).execute({
        usuarioId: USUARIO,
        curriculumId: cv.id,
      }),
    ).rejects.toThrow(CurriculumAjenoException);
  });
});

import { CrearGrupoUseCase } from '@/features/grupo/application/use-cases/crear-grupo.use-case';
import { InvitarMiembroUseCase } from '@/features/grupo/application/use-cases/invitar-miembro.use-case';
import { ResponderInvitacionUseCase } from '@/features/grupo/application/use-cases/responder-invitacion.use-case';
import { SalirGrupoUseCase } from '@/features/grupo/application/use-cases/salir-grupo.use-case';
import { CerrarGrupoUseCase } from '@/features/grupo/application/use-cases/cerrar-grupo.use-case';
import { PostularGrupoOfertaUseCase } from '@/features/grupo/application/use-cases/postular-grupo-oferta.use-case';
import { ListarGruposPropiosUseCase } from '@/features/grupo/application/use-cases/listar-grupos-propios.use-case';
import { GrupoRepository, GrupoMiembroRepository } from '@/features/grupo/domain/grupo.repository';
import { Grupo, GrupoMiembro } from '@/features/grupo/domain/grupo.entity';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { OfertaRepository } from '@/features/oferta/domain/oferta.repository';
import { EvaluacionRepository } from '@/features/evaluacion/domain/evaluacion.repository';
import { CurriculumRepository } from '@/features/curriculum/domain/curriculum.repository';
import { EmpresaRepository } from '@/features/empresa/domain/empresa.repository';
import { CreadorNotificaciones } from '@/shared/domain/creador-notificaciones.port';
import { NoEsLiderException } from '@/features/grupo/domain/no-es-lider.exception';
import { InvitacionInvalidaException } from '@/features/grupo/domain/invitacion-invalida.exception';
import { AccionNoPermitidaException } from '@/features/grupo/domain/accion-no-permitida.exception';
import { GrupoLlenoException } from '@/features/grupo/domain/grupo-lleno.exception';
import { CurriculumMiembroFaltanteException } from '@/features/grupo/domain/curriculum-miembro-faltante.exception';
import { PostulacionDuplicadaException } from '@/features/evaluacion/domain/postulacion-duplicada.exception';

const LIDER_ID = '55555555-5555-5555-5555-555555555555';
const LIDER_USER = '11111111-1111-1111-1111-111111111111';
const AMIGO_ID = '66666666-6666-6666-6666-666666666666';
const AMIGO_USER = '22222222-2222-2222-2222-222222222222';
const GRUPO_ID = '33333333-3333-3333-3333-333333333333';
const OFERTA_ID = '44444444-4444-4444-4444-444444444444';

function grupo(overrides: Partial<Grupo> = {}): Grupo {
  return {
    id: GRUPO_ID,
    nombre: 'Equipo Flutter',
    descripcion: null,
    liderId: LIDER_ID,
    maxMiembros: 3,
    estado: 'formando',
    createdAt: new Date(),
    ...overrides,
  };
}

function miembro(overrides: Partial<GrupoMiembro> = {}): GrupoMiembro {
  return {
    id: '77777777-7777-7777-7777-777777777777',
    grupoId: GRUPO_ID,
    aspiranteId: LIDER_ID,
    rolEnGrupo: 'líder',
    curriculumId: null,
    estado: 'aceptado',
    createdAt: new Date(),
    ...overrides,
  };
}

function datos() {
  const grupoRepo: jest.Mocked<GrupoRepository> = {
    crear: jest.fn().mockResolvedValue(grupo()),
    buscarPorId: jest.fn().mockResolvedValue(grupo()),
    listarPorLider: jest.fn().mockResolvedValue([grupo()]),
    listarMiosComoMiembro: jest.fn().mockResolvedValue([]),
    contarMiembrosAceptados: jest.fn().mockResolvedValue(1),
    cambiarEstado: jest.fn().mockResolvedValue(grupo({ estado: 'postulado' })),
  };
  const miembroRepo: jest.Mocked<GrupoMiembroRepository> = {
    agregar: jest.fn().mockResolvedValue(miembro()),
    buscar: jest.fn().mockResolvedValue(null),
    listarDeGrupo: jest.fn().mockResolvedValue([miembro()]),
    cambiarEstadoMiembro: jest.fn().mockResolvedValue(miembro()),
  };
  const aspiranteRepo: jest.Mocked<AspiranteRepository> = {
    buscarPorUsuarioId: jest
      .fn()
      .mockImplementation((uid: string) =>
        Promise.resolve(uid === LIDER_USER ? { id: LIDER_ID, usuarioId: LIDER_USER } : { id: AMIGO_ID, usuarioId: AMIGO_USER }),
      ),
    buscarPorId: jest.fn().mockResolvedValue({ id: AMIGO_ID, usuarioId: AMIGO_USER }),
    crear: jest.fn(),
    actualizar: jest.fn(),
  };
  const ofertaRepo: jest.Mocked<OfertaRepository> = {
    listarFeed: jest.fn(),
    listarPorAutor: jest.fn(),
    buscarPorId: jest.fn().mockResolvedValue({
      oferta: {
        id: OFERTA_ID, autorTipo: 'empresa', autorId: '88888888-8888-8888-8888-888888888888',
        tipoOferta: 'normal', titulo: 'Mobile', descripcion: 'd', requisitos: null,
        habilidadesReq: [], modalidad: null, ubicacion: null, salarioMin: null,
        salarioMax: null, tipoContrato: null, objetivo: null, grupoId: null,
        fechaLimite: null, cupos: 1, estado: 'publicada',
        createdAt: new Date(), updatedAt: new Date(),
      },
      autorNombre: 'Fintech', autorVerificado: true, autorLogoUrl: null, likes: 0, dislikes: 0,
    }),
    crear: jest.fn(),
    actualizar: jest.fn(),
    cambiarEstado: jest.fn(),
  };
  const evaluacionRepo: jest.Mocked<EvaluacionRepository> = {
    buscarPorId: jest.fn(),
    existePostulacion: jest.fn().mockResolvedValue(false),
    crear: jest.fn().mockResolvedValue({} as never),
    listarPorOferta: jest.fn(),
    listarPorAspirante: jest.fn(),
    cambiarEstado: jest.fn(),
    retirar: jest.fn(),
  };
  const cvRepo: jest.Mocked<CurriculumRepository> = {
    listarPorAspiranteId: jest.fn(),
    buscarPorId: jest.fn().mockResolvedValue({ id: 'cv-1', aspiranteId: LIDER_ID, visible: true }),
    crear: jest.fn(),
    actualizar: jest.fn(),
    marcarComoPrincipal: jest.fn(),
  };
  const empresaRepo: jest.Mocked<EmpresaRepository> = {
    buscarPorUsuarioId: jest.fn(),
    buscarPorId: jest.fn().mockResolvedValue({ id: '88888888-8888-8888-8888-888888888888', usuarioId: '99999999-9999-9999-9999-999999999999' }),
    crear: jest.fn(),
    actualizar: jest.fn(),
    cambiarVerificacion: jest.fn(),
  };
  const notificaciones: jest.Mocked<CreadorNotificaciones> = { crear: jest.fn().mockResolvedValue(undefined) };

  return { grupoRepo, miembroRepo, aspiranteRepo, ofertaRepo, evaluacionRepo, cvRepo, empresaRepo, notificaciones };
}

const ASPI_D = { id: LIDER_ID, usuarioId: LIDER_USER };

describe('CrearGrupoUseCase', () => {
  it('crea grupo Y registra al líder como miembro aceptado implícito', async () => {
    const d = datos();
    const uc = new CrearGrupoUseCase(d.aspiranteRepo, d.grupoRepo, d.miembroRepo);

    await uc.execute({ usuarioId: LIDER_USER, nombre: 'Equipo Flutter', maxMiembros: 3 });

    expect(d.grupoRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ liderId: LIDER_ID, maxMiembros: 3 }),
    );
    expect(d.miembroRepo.agregar).toHaveBeenCalledWith(GRUPO_ID, LIDER_ID, 'líder', null);
  });
});

describe('InvitarMiembroUseCase', () => {
  const UC = () => {
    const d = datos();
    return { uc: new InvitarMiembroUseCase(d.grupoRepo, d.miembroRepo, d.aspiranteRepo, d.notificaciones), d };
  };

  it('invita y NOTIFICA invitacion_grupo al invitado', async () => {
    const { uc, d } = UC();
    await uc.execute({ grupoId: GRUPO_ID, aspiranteId: AMIGO_ID, liderId: LIDER_ID });
    expect(d.notificaciones.crear).toHaveBeenCalledWith({
      usuarioId: AMIGO_USER,
      tipo: 'invitacion_grupo',
      referenciaId: GRUPO_ID,
    });
  });

  it('no hay notificación/invitación si el grupo está cerrado', async () => {
    const { uc, d } = UC();
    d.grupoRepo.buscarPorId.mockResolvedValue(grupo({ estado: 'cerrado' }));
    await expect(uc.execute({ grupoId: GRUPO_ID, aspiranteId: AMIGO_ID, liderId: LIDER_ID })).rejects.toThrow(
      AccionNoPermitidaException,
    );
    expect(d.miembroRepo.agregar).not.toHaveBeenCalled();
  });

  it('solo el líder invita', async () => {
    const { uc } = UC();
    await expect(uc.execute({ grupoId: GRUPO_ID, aspiranteId: AMIGO_ID, liderId: AMIGO_ID })).rejects.toThrow(
      NoEsLiderException,
    );
  });

  it('no invita a quien ya es miembro (o a sí mismo)', async () => {
    const { uc, d } = UC();
    d.miembroRepo.buscar.mockResolvedValue(miembro({ aspiranteId: LIDER_ID }));
    await expect(uc.execute({ grupoId: GRUPO_ID, aspiranteId: LIDER_ID, liderId: LIDER_ID })).rejects.toThrow(
      AccionNoPermitidaException,
    );
  });

  it('grupo lleno → 409', async () => {
    const { uc, d } = UC();
    d.grupoRepo.contarMiembrosAceptados.mockResolvedValue(3);
    await expect(uc.execute({ grupoId: GRUPO_ID, aspiranteId: AMIGO_ID, liderId: LIDER_ID })).rejects.toThrow(
      GrupoLlenoException,
    );
  });
});

describe('ResponderInvitacionUseCase', () => {
  it('acepta y al llegar al tope transiciona grupo a completo', async () => {
    const d = datos();
    d.miembroRepo.buscar.mockResolvedValue(miembro({ aspiranteId: AMIGO_ID, estado: 'invitado' }));
    d.grupoRepo.contarMiembrosAceptados.mockResolvedValue(2); // +1 = maxMiembros 3

    await new ResponderInvitacionUseCase(d.grupoRepo, d.miembroRepo).execute({
      grupoId: GRUPO_ID, aspiranteId: AMIGO_ID, aceptar: true,
    });

    expect(d.miembroRepo.cambiarEstadoMiembro).toHaveBeenCalledWith(expect.any(String), 'aceptado');
    expect(d.grupoRepo.cambiarEstado).toHaveBeenCalledWith(GRUPO_ID, 'completo');
  });

  it('rechaza sin tocar el estado del grupo', async () => {
    const d = datos();
    d.miembroRepo.buscar.mockResolvedValue(miembro({ aspiranteId: AMIGO_ID, estado: 'invitado' }));
    await new ResponderInvitacionUseCase(d.grupoRepo, d.miembroRepo).execute({
      grupoId: GRUPO_ID, aspiranteId: AMIGO_ID, aceptar: false,
    });
    expect(d.miembroRepo.cambiarEstadoMiembro).toHaveBeenCalledWith(expect.any(String), 'rechazado');
    expect(d.grupoRepo.cambiarEstado).not.toHaveBeenCalled();
  });

  it('invitación ya respondida → 422', async () => {
    const d = datos();
    d.miembroRepo.buscar.mockResolvedValue(miembro({ aspiranteId: AMIGO_ID, estado: 'aceptado' }));
    await expect(
      new ResponderInvitacionUseCase(d.grupoRepo, d.miembroRepo).execute({
        grupoId: GRUPO_ID, aspiranteId: AMIGO_ID, aceptar: true,
      }),
    ).rejects.toThrow(InvitacionInvalidaException);
  });
});

describe('Salir y cerrar', () => {
  it('miembro aceptado sale y un grupo completo vuelve a formando', async () => {
    const d = datos();
    d.miembroRepo.buscar.mockResolvedValue(miembro({ aspiranteId: AMIGO_ID, estado: 'aceptado' }));
    d.grupoRepo.buscarPorId.mockResolvedValue(grupo({ estado: 'completo', liderId: AMIGO_ID === LIDER_ID ? LIDER_ID : 'otro' }));
    await new SalirGrupoUseCase(d.grupoRepo, d.miembroRepo).execute({ grupoId: GRUPO_ID, aspiranteId: AMIGO_ID });
    expect(d.miembroRepo.cambiarEstadoMiembro).toHaveBeenCalledWith(expect.any(String), 'salido');
    expect(d.grupoRepo.cambiarEstado).toHaveBeenCalledWith(GRUPO_ID, 'formando');
  });

  it('el líder no puede salir', async () => {
    const d = datos();
    d.miembroRepo.buscar.mockResolvedValue(miembro({ aspiranteId: LIDER_ID, estado: 'aceptado' }));
    await expect(
      new SalirGrupoUseCase(d.grupoRepo, d.miembroRepo).execute({ grupoId: GRUPO_ID, aspiranteId: LIDER_ID }),
    ).rejects.toThrow(AccionNoPermitidaException);
  });

  it('cerrar: formando → cerrado; cerrado → cerrado es ilegal', async () => {
    const d = datos();
    await new CerrarGrupoUseCase(d.grupoRepo).execute({ grupoId: GRUPO_ID, liderId: LIDER_ID });
    expect(d.grupoRepo.cambiarEstado).toHaveBeenCalledWith(GRUPO_ID, 'cerrado');
  });
});

describe('PostularGrupoOfertaUseCase', () => {
  const UC = () => {
    const d = datos();
    return {
      uc: new PostularGrupoOfertaUseCase(
        d.grupoRepo, d.miembroRepo, d.ofertaRepo, d.evaluacionRepo, d.cvRepo, d.empresaRepo, d.notificaciones,
      ),
      d,
    };
  };

  it('postula: crea evaluación por miembro (grupo_id set), notifica y marca postulado', async () => {
    const { uc, d } = UC();
    d.miembroRepo.listarDeGrupo.mockResolvedValue([
      miembro({ curriculumId: 'cv-1' }),
      miembro({ aspiranteId: AMIGO_ID, curriculumId: 'cv-friend', rolEnGrupo: 'dev' }),
    ]);

    const r = await uc.execute({ grupoId: GRUPO_ID, ofertaId: OFERTA_ID, liderId: LIDER_ID });

    expect(d.evaluacionRepo.crear).toHaveBeenCalledTimes(2);
    expect(d.evaluacionRepo.crear).toHaveBeenCalledWith({
      ofertaId: OFERTA_ID, curriculumId: 'cv-1', aspiranteId: LIDER_ID, grupoId: GRUPO_ID,
    });
    expect(d.notificaciones.crear).toHaveBeenCalledTimes(2);
    expect(r.postulacionesCreadas).toBe(2);
    expect(d.grupoRepo.cambiarEstado).toHaveBeenCalledWith(GRUPO_ID, 'postulado');
  });

  it('CV ya postulado INDIVIDUALMENTE se omite; aislados sí entran', async () => {
    const { uc, d } = UC();
    d.miembroRepo.listarDeGrupo.mockResolvedValue([miembro({ curriculumId: 'cv-1' })]);
    d.evaluacionRepo.existePostulacion.mockResolvedValue(true);

    await expect(uc.execute({ grupoId: GRUPO_ID, ofertaId: OFERTA_ID, liderId: LIDER_ID })).rejects.toThrow(
      PostulacionDuplicadaException,
    );
    expect(d.evaluacionRepo.crear).not.toHaveBeenCalled();
    expect(d.grupoRepo.cambiarEstado).not.toHaveBeenCalled();
  });

  it('miembro SIN cv asignado → 422 fail-fast', async () => {
    const { uc, d } = UC();
    d.miembroRepo.listarDeGrupo.mockResolvedValue([miembro({ curriculumId: null })]);
    await expect(uc.execute({ grupoId: GRUPO_ID, ofertaId: OFERTA_ID, liderId: LIDER_ID })).rejects.toThrow(
      CurriculumMiembroFaltanteException,
    );
    expect(d.evaluacionRepo.crear).not.toHaveBeenCalled();
  });

  it('grupo ya postulado → acción no permitida', async () => {
    const { uc, d } = UC();
    d.grupoRepo.buscarPorId.mockResolvedValue(grupo({ estado: 'postulado' }));
    await expect(uc.execute({ grupoId: GRUPO_ID, ofertaId: OFERTA_ID, liderId: LIDER_ID })).rejects.toThrow(
      AccionNoPermitidaException,
    );
  });

  it('no líder no postula', async () => {
    const { uc, d } = UC();
    d.grupoRepo.buscarPorId.mockResolvedValue(grupo({ estado: 'completo' }));
    await expect(uc.execute({ grupoId: GRUPO_ID, ofertaId: OFERTA_ID, liderId: ASPI_D.id })).rejects.toThrow(
      NoEsLiderException,
    );
  });
});

describe('ListarGruposPropiosUseCase', () => {
  it('dedupe: el grupo donde es líder Y miembro aparece UNA vez', async () => {
    const d = datos();
    d.grupoRepo.listarPorLider.mockResolvedValue([grupo()]);
    d.grupoRepo.listarMiosComoMiembro.mockResolvedValue([grupo({ nombre: 'dup' })]);

    const lista = await new ListarGruposPropiosUseCase(d.grupoRepo).execute({ aspiranteId: LIDER_ID });

    expect(lista).toHaveLength(1);
    expect(lista[0].id).toBe(GRUPO_ID);
  });
});

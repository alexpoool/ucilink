import { ListarNotificacionesUseCase } from '@/features/notificacion/application/use-cases/listar-notificaciones.use-case';
import { MarcarLeidaUseCase, MarcarTodasLeidasUseCase } from '@/features/notificacion/application/use-cases/marcar-leida.use-case';
import { NotificacionRepository } from '@/features/notificacion/domain/notificacion.repository';
import { Notificacion } from '@/features/notificacion/domain/notificacion.entity';
import { NotificacionNoEncontradaException } from '@/features/notificacion/domain/notificacion-no-encontrada.exception';

const USER = '11111111-1111-1111-1111-111111111111';

function fila(overrides: Partial<Notificacion> = {}): Notificacion {
  return {
    id: '22222222-2222-2222-2222-222222222222',
    usuarioId: USER,
    tipo: 'cv_recibido',
    referenciaId: '33333333-3333-3333-3333-333333333333',
    leida: false,
    createdAt: new Date('2026-01-04T00:00:00Z'),
    ...overrides,
  };
}

function datos(leidas: Partial<Record<number, boolean>> = {}) {
  const lista = [fila(), fila({ id: '22222222-2222-2222-2222-222222222223', tipo: 'invitacion_grupo' })];
  lista.forEach((n, i) => {
    if (leidas[i]) n.leida = true;
  });
  const repo: jest.Mocked<NotificacionRepository> = {
    crear: jest.fn(),
    listarPorUsuario: jest.fn().mockResolvedValue(lista),
    contarNoLeidas: jest.fn().mockResolvedValue(lista.filter((n) => !n.leida).length),
    marcarLeida: jest.fn().mockResolvedValue(fila({ leida: true })),
    marcarTodasLeidas: jest.fn().mockResolvedValue(2),
  };
  return repo;
}

describe('ListarNotificacionesUseCase', () => {
  it('devuelve lista + contador de no leídas', async () => {
    const out = await new ListarNotificacionesUseCase(datos()).execute({ usuarioId: USER });
    expect(out.notificaciones).toHaveLength(2);
    expect(out.noLeidas).toBe(2);
  });

  it('soloNoLeidas filtra lo leído sin cambiar el contador', async () => {
    const out = await new ListarNotificacionesUseCase(datos({ 0: true })).execute({
      usuarioId: USER,
      soloNoLeidas: true,
    });
    expect(out.notificaciones).toHaveLength(1);
    expect(out.notificaciones[0].tipo).toBe('invitacion_grupo');
    expect(out.noLeidas).toBe(1);
  });
});

describe('MarcarLeidaUseCase', () => {
  it('marca leída', async () => {
    const out = await new MarcarLeidaUseCase(datos()).execute({
      notificacionId: '22222222-2222-2222-2222-222222222222',
      usuarioId: USER,
    });
    expect(out.leida).toBe(true);
  });

  it('ajena/inexistente → waiting 404 (el impl devuelve null)', async () => {
    const repo = datos();
    repo.marcarLeida.mockResolvedValue(null as never);
    await expect(
      new MarcarLeidaUseCase(repo).execute({
        notificacionId: '22222222-2222-2222-2222-222222222224',
        usuarioId: USER,
      }),
    ).rejects.toThrow(NotificacionNoEncontradaException);
  });
});

describe('MarcarTodasLeidasUseCase', () => {
  it('devuelve cuántas actualizó', async () => {
    const out = await new MarcarTodasLeidasUseCase(datos()).execute({ usuarioId: USER });
    expect(out.actualizadas).toBe(2);
  });
});

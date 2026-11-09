import { ObtenerPerfilAspiranteUseCase } from '@/features/aspirante/application/use-cases/obtener-perfil-aspirante.use-case';
import { ActualizarPerfilAspiranteUseCase } from '@/features/aspirante/application/use-cases/actualizar-perfil-aspirante.use-case';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { AspiranteNoEncontradoException } from '@/features/aspirante/domain/aspirante-no-encontrado.exception';
import { Aspirante } from '@/features/aspirante/domain/aspirante.entity';

const perfil: Aspirante = {
  id: '55555555-5555-5555-5555-555555555555',
  usuarioId: '11111111-1111-1111-1111-111111111111',
  nombre: 'Brisa',
  apellido: 'Casas',
  telefono: null,
  carrera: null,
  semestre: 6,
  bio: null,
  habilidades: [],
  linkedinUrl: null,
  githubUrl: null,
  portafolioUrl: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

const datosRepo = (): jest.Mocked<AspiranteRepository> =>
  ({
    buscarPorUsuarioId: jest.fn(),
    buscarPorId: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
  }) as jest.Mocked<AspiranteRepository>;

describe('ObtenerPerfilAspiranteUseCase', () => {
  it('devuelve el perfil mapeado del usuario del token', async () => {
    const repo = datosRepo();
    repo.buscarPorUsuarioId.mockResolvedValue(perfil);

    const dto = await new ObtenerPerfilAspiranteUseCase(repo).execute({
      usuarioId: perfil.usuarioId,
    });
    expect(dto.nombre).toBe('Brisa');
  });

  it('lanza AspiranteNoEncontradoException si no tiene perfil', async () => {
    const repo = datosRepo();
    repo.buscarPorUsuarioId.mockResolvedValue(null);

    await expect(
      new ObtenerPerfilAspiranteUseCase(repo).execute({
        usuarioId: '11111111-1111-1111-1111-111111111111',
      }),
    ).rejects.toThrow(AspiranteNoEncontradoException);
  });
});

describe('ActualizarPerfilAspiranteUseCase', () => {
  it('actualiza SOLO los campos enviados y resuelve el id por usuarioId', async () => {
    const repo = datosRepo();
    repo.buscarPorUsuarioId.mockResolvedValue(perfil);
    repo.actualizar.mockResolvedValue({ ...perfil, bio: 'Nueva bio' });

    const dto = await new ActualizarPerfilAspiranteUseCase(repo).execute({
      usuarioId: perfil.usuarioId,
      bio: 'Nueva bio',
    });

    expect(repo.actualizar).toHaveBeenCalledWith(perfil.id, { bio: 'Nueva bio' });
    expect(dto.bio).toBe('Nueva bio');
    // Semestre no llegó al input: no se toca (undefined).
    expect(repo.actualizar.mock.calls[0][1].semestre).toBeUndefined();
  });

  it('lanza AspiranteNoEncontradoException si no existe perfil', async () => {
    const repo = datosRepo();
    repo.buscarPorUsuarioId.mockResolvedValue(null);

    await expect(
      new ActualizarPerfilAspiranteUseCase(repo).execute({
        usuarioId: perfil.usuarioId,
        bio: 'x',
      }),
    ).rejects.toThrow(AspiranteNoEncontradoException);
    expect(repo.actualizar).not.toHaveBeenCalled();
  });
});

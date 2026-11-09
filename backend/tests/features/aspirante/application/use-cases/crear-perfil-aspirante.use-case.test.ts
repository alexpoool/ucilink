import { CrearPerfilAspiranteUseCase } from '@/features/aspirante/application/use-cases/crear-perfil-aspirante.use-case';
import { AspiranteRepository } from '@/features/aspirante/domain/aspirante.repository';
import { PerfilYaExisteException } from '@/features/aspirante/domain/perfil-ya-existe.exception';
import { Aspirante } from '@/features/aspirante/domain/aspirante.entity';

const perfil: Aspirante = {
  id: '55555555-5555-5555-5555-555555555555',
  usuarioId: '11111111-1111-1111-1111-111111111111',
  nombre: 'Brisa',
  apellido: 'Casas',
  telefono: null,
  carrera: 'CS',
  semestre: 6,
  bio: 'Frontend',
  habilidades: ['React'],
  linkedinUrl: null,
  githubUrl: null,
  portafolioUrl: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('CrearPerfilAspiranteUseCase', () => {
  let repo: jest.Mocked<AspiranteRepository>;

  beforeEach(() => {
    repo = {
      buscarPorUsuarioId: jest.fn().mockResolvedValue(null),
      buscarPorId: jest.fn(),
      crear: jest.fn().mockResolvedValue(perfil),
      actualizar: jest.fn(),
    };
  });

  const input = {
    usuarioId: '11111111-1111-1111-1111-111111111111',
    nombre: 'Brisa',
    apellido: 'Casas',
    carrera: 'CS',
    semestre: 6,
    bio: 'Frontend',
    habilidades: ['React'],
  };

  it('crea el perfil con valores por defecto para columnas nulas', async () => {
    const dto = await new CrearPerfilAspiranteUseCase(repo).execute(input);

    expect(repo.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Brisa',
        apellido: 'Casas',
        telefono: null,
        habilidades: ['React'],
      }),
      input.usuarioId,
    );
    expect(dto.id).toBe(perfil.id);
    expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(JSON.stringify(dto)).not.toContain('usuarioId');
  });

  it('lanza PerfilYaExisteException si ya existe perfil del usuario', async () => {
    repo.buscarPorUsuarioId.mockResolvedValue(perfil);

    await expect(new CrearPerfilAspiranteUseCase(repo).execute(input)).rejects.toThrow(
      PerfilYaExisteException,
    );
    expect(repo.crear).not.toHaveBeenCalled();
  });

  it('rechaza nombre vacío (zod) sin llamar al repositorio', async () => {
    await expect(
      new CrearPerfilAspiranteUseCase(repo).execute({ ...input, nombre: '' }),
    ).rejects.toThrow();
    expect(repo.crear).not.toHaveBeenCalled();
  });
});

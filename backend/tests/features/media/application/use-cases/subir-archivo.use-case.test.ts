import { SubirArchivoUseCase, SubirArchivoInput } from '@/features/media/application/use-cases/subir-archivo.use-case';
import { Almacenamiento } from '@/features/media/domain/archivo.port';
import { ArchivoInvalidoException } from '@/features/media/domain/archivo-invalido.exception';

describe('SubirArchivoUseCase', () => {
  let almacenamiento: jest.Mocked<Almacenamiento>;
  const MAX = 10 * 1024;

  beforeEach(() => {
    almacenamiento = {
      guardar: jest
        .fn()
        .mockResolvedValue({ url: '/media/uuid-hash.pdf', nombreGuardado: 'uuid-hash.pdf', bytes: 3 }),
    };
  });

  const input = (mime: string, contenido = Buffer.from('pdf')): SubirArchivoInput => ({
    nombreOriginal: 'mi-cv.pdf',
    mime,
    contenido,
  });

  it('acepta un PDF, delega al puerto y devuelve la URL pública', async () => {
    const uc = new SubirArchivoUseCase(almacenamiento, MAX);

    const out = await uc.execute(input('application/pdf'));

    expect(almacenamiento.guardar).toHaveBeenCalledWith('mi-cv.pdf', 'application/pdf', Buffer.from('pdf'));
    expect(out).toEqual({ url: '/media/uuid-hash.pdf', bytes: 3, tipo: 'application/pdf' });
  });

  it('acepta imágenes de la whitelist (logo de empresa)', async () => {
    const uc = new SubirArchivoUseCase(almacenamiento, MAX);
    await expect(uc.execute(input('image/webp'))).resolves.toHaveProperty('tipo', 'image/webp');
  });

  it('rechaza mimes fuera de la whitelist SIN guardar', async () => {
    const uc = new SubirArchivoUseCase(almacenamiento, MAX);

    await expect(uc.execute(input('application/x-msdownload'))).rejects.toThrow(ArchivoInvalidoException);
    expect(almacenamiento.guardar).not.toHaveBeenCalled();
  });

  it('rechaza archivos vacíos', async () => {
    const uc = new SubirArchivoUseCase(almacenamiento, MAX);

    await expect(uc.execute(input('application/pdf', Buffer.alloc(0)))).rejects.toThrow(
      ArchivoInvalidoException,
    );
    expect(almacenamiento.guardar).not.toHaveBeenCalled();
  });

  it('rechaza archivos que exceden el máximo (inyectado)', async () => {
    const uc = new SubirArchivoUseCase(almacenamiento, MAX);
    const grande = Buffer.alloc(MAX + 1, 7);

    await expect(uc.execute(input('application/pdf', grande))).rejects.toThrow(ArchivoInvalidoException);
    expect(almacenamiento.guardar).not.toHaveBeenCalled();
  });
});

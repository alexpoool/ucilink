import os from 'node:os';
import path from 'node:path';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { LocalStorageAlmacenamiento } from '@/features/media/infrastructure/repositories/local-storage.almacenamiento.impl';

// Test del impl con FS REAL en temp (el guardado a disco es la lógica a probar).
describe('LocalStorageAlmacenamiento', () => {
  let dirTemporal: string;
  let almacenamiento: LocalStorageAlmacenamiento;

  beforeEach(async () => {
    dirTemporal = await mkdtemp(path.join(os.tmpdir(), 'ucilink-media-'));
    almacenamiento = new LocalStorageAlmacenamiento(dirTemporal);
  });

  afterEach(async () => {
    await rm(dirTemporal, { recursive: true, force: true });
  });

  it('escribe el archivo y devuelve URL /media con extensión por MIME', async () => {
    const contenido = Buffer.from('%PDF-1.4 fake');
    const guardado = await almacenamiento.guardar('cv-final.PDF', 'application/pdf', contenido);

    expect(guardado.url).toMatch(/^\/media\/[0-9a-f-]{36}-[0-9a-f]{8}\.pdf$/);
    expect(guardado.bytes).toBe(contenido.byteLength);

    const nombre = guardado.nombreGuardado;
    const leido = await readFile(path.join(dirTemporal, nombre));
    expect(leido).toEqual(contenido);
  });

  it('duplica el mismo contenido → nombre distinto (uuid), no sobreescribe', async () => {
    const contenido = Buffer.from('pngdata');
    const a = await almacenamiento.guardar('logo.png', 'image/png', contenido);
    const b = await almacenamiento.guardar('logo.png', 'image/png', contenido);

    expect(a.nombreGuardado).not.toBe(b.nombreGuardado);
  });

  it('la extensión se decide por MIME aunque el cliente mienta con el nombre', async () => {
    const guardado = await almacenamiento.guardar('ataque.png.exe', 'image/jpeg', Buffer.from('j'));
    expect(guardado.nombreGuardado.endsWith('.jpg')).toBe(true);
  });
});

import { mkdir, writeFile } from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { Almacenamiento, ArchivoGuardado } from '@/features/media/domain/archivo.port';

// Implementación del puerto Almacenamiento sobre el sistema de archivos:
// en Docker, UPLOADS_DIR apunta a un VOLÚMEN persistente (uploads:/data/uploads).
// Nombres indescifrables: uuid + hash corto del contenido; conserva la extensión.
export class LocalStorageAlmacenamiento implements Almacenamiento {
  constructor(
    private readonly directorio: string,
    private readonly prefijoUrl: string = '/media',
  ) {}

  async guardar(nombreOriginal: string, mime: string, contenido: Buffer): Promise<ArchivoGuardado> {
    await mkdir(this.directorio, { recursive: true });

    const extension = extensionSegura(nombreOriginal, mime);
    const hash = crypto.createHash('sha256').update(contenido).digest('hex').slice(0, 8);
    const nombreGuardado = `${crypto.randomUUID()}-${hash}${extension}`;

    await writeFile(path.join(this.directorio, nombreGuardado), contenido);

    return {
      url: `${this.prefijoUrl}/${nombreGuardado}`,
      nombreGuardado,
      bytes: contenido.byteLength,
    };
  }
}

const EXTENSIONES_POR_MIME: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/avif': '.avif',
};

function extensionSegura(nombreOriginal: string, mime: string): string {
  // La extensión se decide POR MIME (confiable) y no por el nombre del cliente,
  // evita bajatinas tipo "exploit.svg.png" con content-type mentiroso.
  const porMime = EXTENSIONES_POR_MIME[mime];
  if (porMime) return porMime;

  const delNombre = path.extname(nombreOriginal).toLowerCase();
  return /^\.[a-z0-9]{2,5}$/.test(delNombre) ? delNombre : '.bin';
}

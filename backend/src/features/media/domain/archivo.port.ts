// Puerto de almacenamiento de archivos (media). La implementación concreta
// (volumen Docker en UPLOADS_DIR) vive en infrastructure/.
// Devuelve la URL pública (/media/<nombre>) lista para pegarse en
// cv_pdf_url o logo_url.
export interface Almacenamiento {
  guardar(nombreOriginal: string, mime: string, contenido: Buffer): Promise<ArchivoGuardado>;
}

export interface ArchivoGuardado {
  url: string;
  nombreGuardado: string;
  bytes: number;
}

// Whitelist de tipos aceptados por el producto: PDF (CV) y imágenes (logos).
export const MIMES_ACEPTADOS = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
] as const;

export type MimeAceptado = (typeof MIMES_ACEPTADOS)[number];

export function esMimeAceptado(mime: string): mime is MimeAceptado {
  return (MIMES_ACEPTADOS as readonly string[]).includes(mime);
}

import { Almacenamiento, esMimeAceptado } from '@/features/media/domain/archivo.port';
import { ArchivoInvalidoException } from '@/features/media/domain/archivo-invalido.exception';

// UC: subir un archivo (CV en PDF o logo de empresa). Valida mime y tamaño
// (lógica de producto, NO HTTP), delega el guardado al puerto Almacenamiento
// (volumen Docker) y devuelve la URL pública /media/<nombre>.
// maxBytes se inyecta en el wiring desde config/secrets (UPLOAD_MAX_BYTES).
export class SubirArchivoUseCase {
  constructor(
    private readonly almacenamiento: Almacenamiento,
    private readonly maxBytes: number,
  ) {}

  async execute(input: SubirArchivoInput): Promise<ArchivoSubidoDto> {
    const { nombreOriginal, mime, contenido } = input;

    if (!esMimeAceptado(mime)) {
      throw new ArchivoInvalidoException(
        'solo se acepta PDF (application/pdf) o imágenes png/jpeg/webp/avif',
      );
    }

    const bytes = contenido.byteLength;
    if (bytes <= 0) {
      throw new ArchivoInvalidoException('el archivo está vacío');
    }
    if (bytes > this.maxBytes) {
      throw new ArchivoInvalidoException(`excede el máximo de ${this.maxBytes} bytes`);
    }

    const guardado = await this.almacenamiento.guardar(nombreOriginal, mime, contenido);

    return { url: guardado.url, bytes: guardado.bytes, tipo: mime };
  }
}

export interface SubirArchivoInput {
  nombreOriginal: string;
  mime: string;
  contenido: Buffer;
}

export interface ArchivoSubidoDto {
  url: string;
  bytes: number;
  tipo: string;
}

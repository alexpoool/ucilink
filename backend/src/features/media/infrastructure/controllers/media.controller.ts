import { Request, Response, NextFunction } from 'express';
import { SubirArchivoUseCase } from '@/features/media/application/use-cases/subir-archivo.use-case';

// Controller de media: traduce el archivo (de multer, adjuntado a req.file)
// al use-case. Sin lógica de negocio: la validación de mime/tamaño vive en
// el use-case; multer solo define límites mecánicos en el module.
export class MediaController {
  constructor(private readonly subirArchivo: SubirArchivoUseCase) {}

  async subir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const archivo = req.file;

      if (!archivo) {
        res.status(400).json({ message: 'Falta el campo del archivo (multipart/form-data: campo "archivo")' });
        return;
      }

      const subido = await this.subirArchivo.execute({
        nombreOriginal: archivo.originalname,
        mime: archivo.mimetype,
        contenido: archivo.buffer,
      });

      res.status(201).json(subido);
    } catch (error) {
      next(error);
    }
  }
}

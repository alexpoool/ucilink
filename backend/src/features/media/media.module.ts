import { Router } from 'express';
import { Database } from '@/config/db';
import { LocalStorageAlmacenamiento } from './infrastructure/repositories/local-storage.almacenamiento.impl';
import { SubirArchivoUseCase } from './application/use-cases/subir-archivo.use-case';
import { MediaController } from './infrastructure/controllers/media.controller';
import { mediaRoutes } from './infrastructure/routes/media.routes';
import { secrets } from '@/config/secrets';

// Wiring del feature media (DI por constructor).
// `db` es parte de la firma convencional de los modules; media no usa DB.
// UPLOADS_DIR es el VOLUMEN Docker montado en el contenedor.
export function mediaModule(db: Database): Router {
  void db; // no se usa — allega la firma común de module

  const almacenamiento = new LocalStorageAlmacenamiento(secrets.UPLOADS_DIR);
  const subirArchivo = new SubirArchivoUseCase(almacenamiento, secrets.UPLOAD_MAX_BYTES);
  const controller = new MediaController(subirArchivo);

  return mediaRoutes(controller);
}

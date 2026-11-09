import express, { Express } from 'express';
import cors from 'cors';
import { corsOptions } from '@/config/cors';

// Features (cada uno devuelve su Router montado bajo /api/...).
import { authModule } from '@/features/auth/auth.module';
import { aspiranteModule } from '@/features/aspirante/aspirante.module';
import { empresaModule } from '@/features/empresa/empresa.module';
import { curriculumModule } from '@/features/curriculum/curriculum.module';
import { ofertaModule } from '@/features/oferta/oferta.module';
import { evaluacionModule } from '@/features/evaluacion/evaluacion.module';
import { grupoModule } from '@/features/grupo/grupo.module';
import { valoracionModule } from '@/features/valoracion/valoracion.module';
import { notificacionModule } from '@/features/notificacion/notificacion.module';
import { mediaModule } from '@/features/media/media.module';
import { adminModule } from '@/features/admin/admin.module';

import { NotificacionRepositoryImpl } from '@/features/notificacion/infrastructure/repositories/notificacion.repository.impl';
import { CreadorNotificacionesImpl } from '@/features/notificacion/infrastructure/creador-notificaciones.impl';
import { Database } from '@/config/db';
import { secrets } from '@/config/secrets';

// COMPOSITION ROOT: único lugar que conoce implementaciones concretas de
// puertos compartidos. CreadorNotificaciones (impl en el feature notificacion)
// se construye UNA vez y se inyecta donde el producto notifica (evaluacion,
// grupo, admin).
export function crearApp(db: Database): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' })); // multipart de media NO pasa por aquí

  const creadorNotificaciones = new CreadorNotificacionesImpl(
    new NotificacionRepositoryImpl(db),
  );

  app.use('/api/auth', authModule(db));
  app.use('/api/aspirante', aspiranteModule(db));
  app.use('/api/empresa', empresaModule(db));
  app.use('/api/curriculos', curriculumModule(db));
  app.use('/api/ofertas', ofertaModule(db));
  app.use('/api', evaluacionModule(db, creadorNotificaciones)); // subrutas absolutas
  app.use('/api', grupoModule(db, creadorNotificaciones));
  app.use('/api', valoracionModule(db));
  app.use('/api/notificaciones', notificacionModule(db));
  app.use('/api/media', mediaModule(db));
  app.use('/api/admin', adminModule(db, creadorNotificaciones));

  // Archivos subidos (CV PDFs, logos) servidos desde el VOLUMEN Docker.
  app.use('/media', express.static(secrets.UPLOADS_DIR, { maxAge: '1d', immutable: true }));

  return app;
}

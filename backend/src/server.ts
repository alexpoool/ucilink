import 'dotenv/config';
import http from 'http';
import { crearApp } from '@/app';
import { db } from '@/config/db';
import { secrets } from '@/config/secrets';
import { logger } from '@/config/logs';
import { up as correrMigraciones } from '../migrations/runner';

// El server NO contiene lógica de negocio: solo compone —
// migraciones ↑ → listen → graceful shutdown.
async function main(): Promise<void> {
  // Migraciones pendientes (incl. tabla notificacion) antes de exponer la API.
  await correrMigraciones();

  const app = crearApp(db);

  const server = http.createServer(app);
  server.listen(secrets.PORT, () => {
    logger.info(`UCI Link API escuchando en :${secrets.PORT}`);
  });

  const apagar = (senal: string) => {
    logger.info({ senal }, 'Apagando gracefully...');
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => apagar('SIGTERM'));
  process.on('SIGINT', () => apagar('SIGINT'));
}

main().catch((error) => {
  logger.error({ error }, 'Fallo fatal al arrancar el server');
  process.exit(1);
});

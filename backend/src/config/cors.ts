import { secrets } from './secrets';

// Configuración global de CORS, usada en app.ts.
export const corsOptions = {
  origin: secrets.CORS_ORIGIN.split(',').map((o) => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

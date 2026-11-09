// Entorno mínimo para que config/secrets.ts valide en todos los tests
// (sin tocar .env real ni secretos de producción).
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/ucilink_test';
process.env.JWT_SECRET = 'jwt-secret-de-tests-solo-local';
process.env.JWT_EXPIRES_IN = '7d';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.LOG_LEVEL = 'error';

export {};

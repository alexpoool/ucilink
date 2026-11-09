import path from 'node:path';
import fs from 'node:fs';

// Rutas relativas: este archivo ejecuta tanto con tsx (desde migrations/)
// como compilado (desde dist/migrations/).
import { PgDatabase, Database } from '../src/config/db';

interface MigrationModule {
  up: (database: Database) => Promise<void>;
  down: (database: Database) => Promise<void>;
}

const MIGRATIONS_DIR = path.resolve(__dirname);
const db: Database = new PgDatabase();

function listarArchivos(): string[] {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d{14}_.+\.(ts|js)$/.test(f))
    .sort((a, b) => a.localeCompare(b));
}

async function importar(archivo: string): Promise<MigrationModule> {
  const mod = await import(path.join(MIGRATIONS_DIR, archivo));
  if (typeof mod.up !== 'function' || typeof mod.down !== 'function') {
    throw new Error(`La migración ${archivo} no define up() y down() reversibles`);
  }
  return mod as MigrationModule;
}

async function asegurarTablaRegistro(): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS _migraciones (
      id          SERIAL PRIMARY KEY,
      nombre      TEXT UNIQUE NOT NULL,
      aplicada_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function aplicadas(): Promise<Set<string>> {
  const res = await db.query<{ nombre: string }>('SELECT nombre FROM _migraciones');
  return new Set(res.rows.map((r) => r.nombre));
}

export async function up(): Promise<void> {
  await asegurarTablaRegistro();
  const ya = await aplicadas();

  for (const archivo of listarArchivos()) {
    const nombre = archivo.replace(/\.(ts|js)$/, '');
    if (ya.has(nombre)) continue;

    const mod = await importar(archivo);
    await mod.up(db);
    await db.query('INSERT INTO _migraciones (nombre) VALUES ($1)', [nombre]);
    logInfo(`Migración aplicada: ${nombre}`);
  }
}

export async function down(): Promise<void> {
  await asegurarTablaRegistro();
  const ya = [...(await aplicadas())].sort();
  if (ya.length === 0) {
    logInfo('No hay migraciones aplicadas para revertir');
    return;
  }

  const ultima = ya[ya.length - 1];
  const archivo =
    ultima + (['.ts', '.js'].find((ext) => fs.existsSync(path.join(MIGRATIONS_DIR, ultima + ext))) ?? '');
  if (!fs.existsSync(path.join(MIGRATIONS_DIR, archivo))) {
    throw new Error(`No se encontró el archivo fuente de la migración ${ultima}`);
  }

  const mod = await importar(archivo);
  await mod.down(db);
  await db.query('DELETE FROM _migraciones WHERE nombre = $1', [ultima]);
  logInfo(`Migración revertida: ${ultima}`);
}

function logInfo(mensaje: string): void {
  // Mantener el runner elegible fuera del runtime de logs de la app.
  // eslint-disable-next-line no-console
  console.log(`[migraciones] ${mensaje}`);
}

const comando = process.argv[2];
if (comando === 'up') {
  up()
    .then(() => process.exit(0))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[migraciones] Error aplicando:', err);
      process.exit(1);
    });
} else if (comando === 'down') {
  down()
    .then(() => process.exit(0))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[migraciones] Error revirtiendo:', err);
      process.exit(1);
    });
}

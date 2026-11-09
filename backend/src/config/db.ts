import { Pool, PoolClient, QueryResult } from 'pg';
import { secrets } from './secrets';
import { logger } from './logs';

// Único punto de acceso a PostgreSQL. Los repositorios (infrastructure)
// reciben esta interfaz inyectada; domain/application nunca la importan.
export interface Database {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    params?: readonly unknown[],
  ): Promise<QueryResult<T>>;
  transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>;
}

export class PgDatabase implements Database {
  private readonly pool: Pool;

  constructor(pool?: Pool) {
    this.pool =
      pool ??
      new Pool({
        connectionString: secrets.DATABASE_URL,
      });

    this.pool.on('error', (err) => {
      logger.error({ err: err.message }, 'Error inesperado en el pool de PostgreSQL');
    });
  }

  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    params: readonly unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params as never[]);
  }

  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const db: Database = new PgDatabase();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Initialize postgres client
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

// Initialize Drizzle ORM with postgres-js
export const db = drizzle(client, { schema });

// Re-export schema for convenience
export { schema };

// Database transaction helper
export async function withTransaction<T>(
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return db.transaction(callback);
}

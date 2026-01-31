import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Initialize postgres client
// Use a safe fallback that won't cause connection errors during build
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/postgres';

const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
  // Silently handle connection issues during build
  onnotice: () => {},
  onparameter: () => {},
});

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

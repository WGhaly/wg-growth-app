import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Initialize postgres client lazily to avoid connection during build
// Use a placeholder connection string if DATABASE_URL is not set
const connectionString = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

// Skip connection during Vercel build time (not runtime)
// CI environment variable is set during Vercel builds
const isBuildTime = process.env.CI === 'true' || process.env.NEXT_PHASE === 'phase-production-build';

// Create a connection with appropriate settings
const client = isBuildTime 
  ? postgres(connectionString, { max: 0, idle_timeout: 0, connect_timeout: 1 }) // Minimal connection during build
  : postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      onnotice: () => {},
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

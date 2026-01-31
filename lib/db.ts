import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Initialize postgres client lazily to avoid connection during build
// Use a placeholder connection string if DATABASE_URL is not set
const connectionString = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

// Skip connection during build time
const isBuilding = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV;

// Create a connection with appropriate settings
// Disable connection pooling during build to prevent hanging
const client = isBuilding 
  ? postgres(connectionString, { max: 0 }) // No connections during build
  : postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      // Don't prepare statements by default (helps with build)
      prepare: false,
      // Allow graceful degradation during build
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

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Initialize postgres client lazily to avoid connection during build
// Use a placeholder connection string if DATABASE_URL is not set
const connectionString = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

// Create a connection with appropriate settings
// Disable connection pooling during build to prevent hanging
const client = postgres(connectionString, {
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

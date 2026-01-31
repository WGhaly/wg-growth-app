import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

// Initialize postgres client lazily to avoid connection during build
const connectionString = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

// Create a connection with appropriate settings
let client: ReturnType<typeof postgres>;

try {
  client = postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
} catch (error) {
  console.warn('Failed to initialize database client:', error);
  // Create a minimal client for build time
  client = postgres(connectionString);
}

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

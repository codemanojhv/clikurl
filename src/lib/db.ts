import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

let dbInstance: any = null;

export function getDb() {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const client = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false, // required for Supabase transaction pooler (pgBouncer)
    });
    dbInstance = drizzle({ client });
  }
  return dbInstance;
}

// No-op — tables are created via Supabase migration, not at runtime
export function initDb() {}

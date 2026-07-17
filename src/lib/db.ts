import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// postgres.js client — use max 1 connection for serverless (Vercel)
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // required for Supabase transaction pooler (pgBouncer)
});

const db = drizzle({ client });

export function getDb() {
  return db;
}

// No-op — tables are created via Supabase migration, not at runtime
export function initDb() {}

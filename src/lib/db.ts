import "server-only";
import postgres from "postgres";

const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

// Serverless-friendly settings: a small pool per function instance, and no prepared
// statements so pooled URLs (Neon / Supabase PgBouncer in transaction mode) work.
export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL!, {
    max: process.env.VERCEL ? 3 : 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    transform: postgres.camel,
    onnotice: () => {},
  });

// Reuse one pool across hot reloads in development and across requests on a warm instance.
globalForDb.sql = sql;

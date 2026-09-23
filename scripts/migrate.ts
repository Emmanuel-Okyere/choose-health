import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL is not set. Add it in Vercel under Settings, Environment Variables (or .env.local locally).");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, onnotice: () => {} });

async function main() {
  await sql.unsafe(readFileSync(join(process.cwd(), "db/schema.sql"), "utf8"));
  console.log("✓ Schema applied");
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});

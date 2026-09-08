import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env.ts";

let _db: ReturnType<typeof drizzle>;
export function getDb() {
  if (!_db) {
    _db = drizzle(new Pool({ connectionString: env.DATABASE_URL }));
  }
  return _db;
}
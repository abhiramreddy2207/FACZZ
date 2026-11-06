import { neon, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env["DATABASE_URL"];

export function getDb() {
  if (!connectionString) {
    // In dev/test when DATABASE_URL is not yet configured, return null or fallback
    return null;
  }
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

export const db = getDb();
export { schema };

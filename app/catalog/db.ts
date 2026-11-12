import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export const DB_PATH = path.join(process.cwd(), "data", "catalog.sqlite");

export function openCatalogDatabase(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  return new Database(DB_PATH);
}

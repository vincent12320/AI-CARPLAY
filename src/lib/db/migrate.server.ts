/**
 * 本地开发数据库迁移脚本。
 *
 * 用法: bun run src/lib/db/migrate.server.ts
 *
 * 该脚本读取 drizzle/ 目录下的 SQL 迁移文件，按序应用到本地 SQLite 数据库。
 * 使用 SQLite meta 表 `_drizzle_migrations` 跟踪已执行的迁移。
 */

import { readdirSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { Database } from "bun:sqlite";

const DB_URL = (process.env.DATABASE_URL as string | undefined) ?? "./.ispace/data.db";
const MIGRATIONS_DIR = join(import.meta.dirname, "..", "..", "..", "drizzle");

function ensureDir() {
  const dir = dirname(DB_URL);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function ensureMetaTable(db: Database) {
  db.exec(
    `CREATE TABLE IF NOT EXISTS _drizzle_migrations (
      name TEXT PRIMARY KEY,
      executed_at INTEGER NOT NULL
    )`,
  );
}

function getAppliedMigrations(db: Database): Set<string> {
  const rows = db.query("SELECT name FROM _drizzle_migrations").all() as { name: string }[];
  return new Set(rows.map((r) => r.name));
}

function main() {
  ensureDir();

  if (!existsSync(MIGRATIONS_DIR)) {
    console.log("[migrate] No drizzle/ directory found. Run `bun run db:generate` first.");
    return;
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("[migrate] No migration files found.");
    return;
  }

  const db = new Database(DB_URL);
  db.exec("PRAGMA journal_mode=WAL;");
  ensureMetaTable(db);

  const applied = getAppliedMigrations(db);
  let count = 0;

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
    console.log(`[migrate] Running: ${file}`);
    db.exec(sql);
    db.run("INSERT INTO _drizzle_migrations (name, executed_at) VALUES (?, ?)", [file, Date.now()]);
    count++;
  }

  if (count === 0) {
    console.log("[migrate] Already up to date.");
  } else {
    console.log(`[migrate] Applied ${count} migration(s).`);
  }

  db.close();
}

main();

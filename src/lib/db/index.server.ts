import type { D1Database } from "@cloudflare/workers-types";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle as bunDrizzle, type BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema.server";

export type Database = BunSQLiteDatabase<typeof schema> | DrizzleD1Database<typeof schema>;

let _db: Database | null = null;

/**
 * 获取数据库实例。
 * - 本地 (Bun): 使用 bun:sqlite，数据库文件路径来自 DATABASE_URL 或默认 ./.ispace/data.db
 * - Cloudflare Workers: 使用 D1 binding（process.env.DB）
 *
 * 函数内部按需读取 process.env，不在模块作用域读取（兼容 CF Workers 的 per-request env）。
 */
export async function getDb(): Promise<Database> {
  if (_db) return _db;

  // 检测是否为 Cloudflare Workers 环境（D1 binding 存在）
  const d1Binding = (process.env as Record<string, unknown>).DB;

  if (d1Binding && typeof d1Binding === "object") {
    // Cloudflare Workers: 使用 D1 adapter
    _db = drizzle(d1Binding as D1Database, { schema });
  } else {
    // 本地开发: 使用 bun:sqlite
    const { Database } = await import("bun:sqlite");
    const dbUrl =
      (process.env.DATABASE_URL as string | undefined) ?? "./.ispace/data.db";

    // 确保数据库目录存在
    const dir = dbUrl.replace(/\/[^/]+$/, "");
    if (dir && dir !== dbUrl) {
      const { mkdirSync } = await import("node:fs");
      mkdirSync(dir, { recursive: true });
    }

    const sqlite = new Database(dbUrl);
    sqlite.exec("PRAGMA journal_mode=WAL;");
    sqlite.exec("PRAGMA foreign_keys=ON;");
    _db = bunDrizzle(sqlite, { schema });
  }

  return _db;
}

/**
 * 重置缓存 —— 测试或特殊场景使用
 */
export function clearDbCache(): void {
  _db = null;
}

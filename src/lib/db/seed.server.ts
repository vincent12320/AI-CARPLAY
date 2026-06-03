/**
 * 种子数据脚本 —— 将本地 localStorage 的初始数据预置到数据库。
 *
 * 用法: bun run src/lib/db/seed.server.ts
 */

import { getDb } from "./index.server";
import { chatMessages, memories, musicFavorites, userSettings } from "./schema.server";
import { eq } from "drizzle-orm";

async function main() {
  const db = await getDb();

  // ---- 用户记忆 ----
  const existingMemories = await db.select().from(memories);
  if (existingMemories.length === 0) {
    await db.insert(memories).values([
      { id: "m1", key: "用户姓名", value: "妙妙", createdAt: Date.now() },
      { id: "m2", key: "生日", value: "今天", createdAt: Date.now() },
      { id: "m3", key: "偏好音乐", value: "民谣 / 后摇", createdAt: Date.now() },
    ]);
    console.log("[seed] Inserted 3 memories.");
  }

  // ---- 音乐收藏 ----
  const existingFavs = await db.select().from(musicFavorites);
  if (existingFavs.length === 0) {
    await db.insert(musicFavorites).values([
      { trackId: "t1" },
      { trackId: "t4" },
    ]);
    console.log("[seed] Inserted 2 music favorites.");
  }

  // ---- 用户设置 ----
  const existingSettings = await db.select().from(userSettings);
  if (existingSettings.length === 0) {
    await db.insert(userSettings).values({
      id: "default",
      persona: JSON.stringify({
        name: "iSPACE",
        tone: "friendly",
        language: "zh-CN",
        avatarColor: "#111827",
        greetingTemplate: "{name}，{occasion}快乐！",
      }),
      intentRules: JSON.stringify([
        { name: "导航", patterns: ["去", "导航", "回家", "公司"], action: "navigation" },
        { name: "媒体", patterns: ["播放", "音乐", "歌", "下一首"], action: "media" },
        { name: "氛围", patterns: ["灯光", "氛围", "亮度", "颜色"], action: "ambient" },
        { name: "车控", patterns: ["温度", "空调", "车窗", "座椅", "锁车"], action: "vehicle" },
        { name: "闲聊", patterns: ["你好", "聊聊", "讲个"], action: "chat" },
      ]),
      memoryEnabled: true,
    });
    console.log("[seed] Inserted user settings.");
  }

  console.log("[seed] Done.");
}

main().catch(console.error);

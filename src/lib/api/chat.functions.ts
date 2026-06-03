import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "@/lib/db/index.server";
import { chatMessages } from "@/lib/db/schema.server";
import { desc, asc } from "drizzle-orm";

export const getChatHistory = createServerFn({ method: "GET" })
  .inputValidator(
    z
      .object({ limit: z.number().min(1).max(500).optional() })
      .optional()
      .default({ limit: 200 }),
  )
  .handler(async ({ data }) => {
    const db = await getDb();
    const rows = await db
      .select()
      .from(chatMessages)
      .orderBy(asc(chatMessages.createdAt))
      .limit(data.limit ?? 200);
    return rows;
  });

export const saveChatMessage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(0),
    }),
  )
  .handler(async ({ data }) => {
    const db = await getDb();
    const id = crypto.randomUUID();
    const now = Date.now();
    await db.insert(chatMessages).values({
      id,
      role: data.role,
      content: data.content,
      createdAt: now,
    });
    return { id, role: data.role, content: data.content, createdAt: now };
  });

export const clearChatHistory = createServerFn({ method: "POST" }).handler(async () => {
  const db = await getDb();
  await db.delete(chatMessages);
  return { ok: true };
});

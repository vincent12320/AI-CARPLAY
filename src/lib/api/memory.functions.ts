import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "@/lib/db/index.server";
import { memories } from "@/lib/db/schema.server";
import { eq } from "drizzle-orm";

export const getMemories = createServerFn({ method: "GET" }).handler(async () => {
  const db = await getDb();
  return db.select().from(memories);
});

export const addMemory = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      key: z.string().min(1),
      value: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const db = await getDb();
    const id = crypto.randomUUID();
    const now = Date.now();
    await db.insert(memories).values({
      id,
      key: data.key,
      value: data.value,
      createdAt: now,
    });
    return { id, key: data.key, value: data.value, createdAt: now };
  });

export const removeMemory = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.delete(memories).where(eq(memories.id, data.id));
    return { ok: true };
  });

export const clearMemories = createServerFn({ method: "POST" }).handler(async () => {
  const db = await getDb();
  await db.delete(memories);
  return { ok: true };
});

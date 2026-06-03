import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "@/lib/db/index.server";
import { musicFavorites } from "@/lib/db/schema.server";
import { eq } from "drizzle-orm";

export const getFavorites = createServerFn({ method: "GET" }).handler(async () => {
  const db = await getDb();
  const rows = await db.select().from(musicFavorites);
  return rows.map((r) => r.trackId);
});

export const addFavorite = createServerFn({ method: "POST" })
  .inputValidator(z.object({ trackId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.insert(musicFavorites).values({ trackId: data.trackId }).onConflictDoNothing();
    return { ok: true };
  });

export const removeFavorite = createServerFn({ method: "POST" })
  .inputValidator(z.object({ trackId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.delete(musicFavorites).where(eq(musicFavorites.trackId, data.trackId));
    return { ok: true };
  });

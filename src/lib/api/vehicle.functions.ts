import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "@/lib/db/index.server";
import { vehiclePreferences } from "@/lib/db/schema.server";
import { eq } from "drizzle-orm";

export const getVehiclePreferences = createServerFn({ method: "GET" }).handler(async () => {
  const db = await getDb();
  const rows = await db.select().from(vehiclePreferences).where(eq(vehiclePreferences.id, "default"));
  return rows[0] ?? null;
});

const vehicleInputSchema = z.object({
  tempLeft: z.number().optional(),
  tempRight: z.number().optional(),
  fanSpeed: z.number().optional(),
  locked: z.boolean().optional(),
  driveMode: z.enum(["comfort", "sport", "eco"]).optional(),
  acOn: z.boolean().optional(),
  airflow: z.enum(["face", "feet", "face-feet", "defrost"]).optional(),
  recirculate: z.boolean().optional(),
  seatHeatLeft: z.number().optional(),
  seatHeatRight: z.number().optional(),
  volume: z.number().optional(),
});

export const saveVehiclePreferences = createServerFn({ method: "POST" })
  .inputValidator(vehicleInputSchema)
  .handler(async ({ data }) => {
    const db = await getDb();
    // 将 boolean 转为 integer (SQLite 没有原生 boolean)
    const values: Record<string, unknown> = { id: "default" };
    if (data.tempLeft !== undefined) values.tempLeft = data.tempLeft;
    if (data.tempRight !== undefined) values.tempRight = data.tempRight;
    if (data.fanSpeed !== undefined) values.fanSpeed = data.fanSpeed;
    if (data.locked !== undefined) values.locked = data.locked;
    if (data.driveMode !== undefined) values.driveMode = data.driveMode;
    if (data.acOn !== undefined) values.acOn = data.acOn;
    if (data.airflow !== undefined) values.airflow = data.airflow;
    if (data.recirculate !== undefined) values.recirculate = data.recirculate;
    if (data.seatHeatLeft !== undefined) values.seatHeatLeft = data.seatHeatLeft;
    if (data.seatHeatRight !== undefined) values.seatHeatRight = data.seatHeatRight;
    if (data.volume !== undefined) values.volume = data.volume;

    await db
      .insert(vehiclePreferences)
      .values(values as typeof vehiclePreferences.$inferInsert)
      .onConflictDoUpdate({
        target: vehiclePreferences.id,
        set: values as Record<string, unknown>,
      });

    return { ok: true };
  });

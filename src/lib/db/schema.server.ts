import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ==================== 聊天记录 ====================
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull(),
});

// ==================== 用户记忆 (key-value) ====================
export const memories = sqliteTable("memories", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  createdAt: integer("created_at").notNull(),
});

// ==================== 音乐收藏 ====================
export const musicFavorites = sqliteTable("music_favorites", {
  trackId: text("track_id").primaryKey(),
});

// ==================== 车辆偏好 (单行, upsert) ====================
export const vehiclePreferences = sqliteTable("vehicle_preferences", {
  id: text("id").primaryKey().$defaultFn(() => "default"),
  tempLeft: real("temp_left").notNull().default(24.5),
  tempRight: real("temp_right").notNull().default(24.5),
  fanSpeed: integer("fan_speed").notNull().default(2),
  locked: integer("locked", { mode: "boolean" }).notNull().default(true),
  driveMode: text("drive_mode", { enum: ["comfort", "sport", "eco"] })
    .notNull()
    .default("comfort"),
  acOn: integer("ac_on", { mode: "boolean" }).notNull().default(true),
  airflow: text("airflow", {
    enum: ["face", "feet", "face-feet", "defrost"],
  })
    .notNull()
    .default("face"),
  recirculate: integer("recirculate", { mode: "boolean" }).notNull().default(true),
  seatHeatLeft: integer("seat_heat_left").notNull().default(0),
  seatHeatRight: integer("seat_heat_right").notNull().default(0),
  volume: integer("volume").notNull().default(60),
});

// ==================== 用户设置 (单行, 不含 API Key) ====================
export const userSettings = sqliteTable("user_settings", {
  id: text("id").primaryKey().$defaultFn(() => "default"),
  persona: text("persona").notNull(), // JSON string
  intentRules: text("intent_rules").notNull(), // JSON string
  memoryEnabled: integer("memory_enabled", { mode: "boolean" }).notNull().default(true),
  aiBaseUrl: text("ai_base_url").notNull().default("https://api.openai.com/v1"),
  aiModel: text("ai_model").notNull().default("gpt-4o-mini"),
  aiStream: integer("ai_stream", { mode: "boolean" }).notNull().default(true),
  difyEndpoint: text("dify_endpoint").notNull().default(""),
  difyEnabled: integer("dify_enabled", { mode: "boolean" }).notNull().default(false),
});

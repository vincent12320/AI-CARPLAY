import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.server.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./.ispace/data.db",
  },
});

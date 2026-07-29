import { defineConfig } from "drizzle-kit";

function loadEnvIfPresent(path: string) {
  try {
    process.loadEnvFile?.(path);
  } catch {
    return;
  }
}

loadEnvIfPresent(".env.local");
loadEnvIfPresent(".env");

const url = process.env.SQLITE_DATABASE_PATH;

if (!url) {
  throw new Error("SQLITE_DATABASE_PATH must be set before using Drizzle.");
}

export default defineConfig({
  schema: "./lib/drizzle/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url,
  },
  strict: true,
  verbose: true,
});

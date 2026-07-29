import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearEnvCache } from "@/lib/env";
import { clearDbCache, getDb, getSqliteClient } from "./drizzle";

const originalEnv = process.env;

describe("drizzle", () => {
  beforeEach(() => {
    clearEnvCache();
    process.env = {
      ...originalEnv,
      NODE_ENV: originalEnv.NODE_ENV ?? "test",
      SESSION_SECRET: "12345678901234567890123456789012",
      SQLITE_DATABASE_PATH: "/tmp/cache-test.sqlite",
    };
  });

  afterEach(async () => {
    clearEnvCache();
    process.env = {
      ...originalEnv,
      NODE_ENV: originalEnv.NODE_ENV ?? "test",
      SESSION_SECRET: "12345678901234567890123456789012",
      SQLITE_DATABASE_PATH: "/tmp/cache-test.sqlite",
    };
    await clearDbCache();
  });

  it("creates sqlite client from SQLITE_DATABASE_PATH", () => {
    const client = getSqliteClient();

    expect(client).toBeTruthy();
  });

  it("reuses cached db instance", () => {
    const first = getDb();
    const second = getDb();

    expect(second).toBe(first);
  });
});

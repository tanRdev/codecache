import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearEnvCache, getEnv, validateEnv } from "./env";

const originalEnv = process.env;

describe("env", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearEnvCache();
    process.env = {
      ...originalEnv,
      NODE_ENV: originalEnv.NODE_ENV ?? "test",
      SESSION_SECRET: "12345678901234567890123456789012",
      SQLITE_DATABASE_PATH: "/tmp/cache.sqlite",
    };
  });

  afterEach(() => {
    clearEnvCache();
    process.env = {
      ...originalEnv,
      NODE_ENV: originalEnv.NODE_ENV ?? "test",
      SESSION_SECRET: "12345678901234567890123456789012",
      SQLITE_DATABASE_PATH: "/tmp/cache.sqlite",
    };
  });

  it("defaults NODE_ENV to development", () => {
    Reflect.deleteProperty(process.env, "NODE_ENV");

    const env = validateEnv();

    expect(env.NODE_ENV).toBe("development");
  });

  it("throws when a configured URL is invalid", () => {
    process.env.NEXT_PUBLIC_APP_URL = "not-a-url";

    expect(() => validateEnv()).toThrow("Invalid environment variables");
  });

  it("passes through ATTACHMENTS_ROOT as optional path", () => {
    process.env.ATTACHMENTS_ROOT = "/var/cache-data";

    const env = validateEnv();

    expect(env.ATTACHMENTS_ROOT).toBe("/var/cache-data");
  });

  it("accepts optional owner setup token", () => {
    process.env.OWNER_SETUP_TOKEN = "12345678901234567890123456789012";

    const env = validateEnv();

    expect(env.OWNER_SETUP_TOKEN).toBe("12345678901234567890123456789012");
  });

  it("caches the parsed environment until cleared", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://first.example.com";

    const first = getEnv();

    process.env.NEXT_PUBLIC_APP_URL = "https://second.example.com";

    const cached = getEnv();

    expect(cached).toBe(first);
    expect(cached.NEXT_PUBLIC_APP_URL).toBe("https://first.example.com/");

    clearEnvCache();

    const refreshed = getEnv();

    expect(refreshed.NEXT_PUBLIC_APP_URL).toBe("https://second.example.com/");
  });
});

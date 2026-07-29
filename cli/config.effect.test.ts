import { describe, expect, it, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { Effect } from "effect";
import {
  createProfileEffect,
  getCurrentProfileEffect,
  listProfilesEffect,
  setCurrentProfileEffect,
  deleteProfileEffect,
  getProfileEffect,
  updateProfileEffect,
} from "@/cli/config";

describe("cli config Effect", () => {
  afterEach(() => {
    delete process.env.CACHE_CLI_CONFIG_DIR;
  });

  function setupTempDir() {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), "cache-cli-test-"));
    process.env.CACHE_CLI_CONFIG_DIR = tempDir;
    return tempDir;
  }

  function cleanupTempDir(tempDir: string) {
    rmSync(tempDir, { force: true, recursive: true });
  }

  describe("createProfileEffect", () => {
    it("should create a direct profile", async () => {
      const tempDir = setupTempDir();

      try {
        const program = createProfileEffect({
          name: "local",
          mode: "direct",
          backend: "sqlite",
          userId: "user-1",
        });

        const result = await Effect.runPromise(program);

        expect(result).toMatchObject({
          name: "local",
          mode: "direct",
          backend: "sqlite",
          userId: "user-1",
        });
      } finally {
        cleanupTempDir(tempDir);
      }
    });

    it("should create a remote profile", async () => {
      const tempDir = setupTempDir();

      try {
        const program = createProfileEffect({
          name: "remote",
          mode: "remote",
          appUrl: "https://cache.example.com",
          token: "token-123",
        });

        const result = await Effect.runPromise(program);

        expect(result).toMatchObject({
          name: "remote",
          mode: "remote",
          appUrl: "https://cache.example.com/",
          token: "token-123",
        });
      } finally {
        cleanupTempDir(tempDir);
      }
    });

    it("should update existing profile", async () => {
      const tempDir = setupTempDir();

      try {
        await Effect.runPromise(
          createProfileEffect({
            name: "local",
            mode: "direct",
            backend: "sqlite",
            userId: "user-1",
          })
        );

        const result = await Effect.runPromise(
          createProfileEffect({
            name: "local",
            mode: "direct",
            backend: "sqlite",
            userId: "user-2",
          })
        );

        expect(result).toMatchObject({
          name: "local",
          mode: "direct",
        });
        if (result.mode === "direct") {
          expect(result.backend).toBe("sqlite");
          expect(result.userId).toBe("user-2");
        }
      } finally {
        cleanupTempDir(tempDir);
      }
    });
  });

  describe("listProfilesEffect", () => {
    it("should return empty list when no profiles exist", async () => {
      const tempDir = setupTempDir();

      try {
        const result = await Effect.runPromise(listProfilesEffect());
        expect(result).toEqual([]);
      } finally {
        cleanupTempDir(tempDir);
      }
    });

    it("should return all profiles", async () => {
      const tempDir = setupTempDir();

      try {
        await Effect.runPromise(
          createProfileEffect({
            name: "local",
            mode: "direct",
            backend: "sqlite",
            userId: "user-1",
          })
        );

        await Effect.runPromise(
          createProfileEffect({
            name: "remote",
            mode: "remote",
            appUrl: "https://cache.example.com",
            token: "token-123",
          })
        );

        const result = await Effect.runPromise(listProfilesEffect());
        expect(result).toHaveLength(2);
      } finally {
        cleanupTempDir(tempDir);
      }
    });
  });

  describe("getCurrentProfileEffect", () => {
    it("should return null when no current profile", async () => {
      const tempDir = setupTempDir();

      try {
        const result = await Effect.runPromise(getCurrentProfileEffect());
        expect(result).toBeNull();
      } finally {
        cleanupTempDir(tempDir);
      }
    });

    it("should return the current profile", async () => {
      const tempDir = setupTempDir();

      try {
        await Effect.runPromise(
          createProfileEffect({
            name: "local",
            mode: "direct",
            backend: "sqlite",
            userId: "user-1",
          })
        );

        const result = await Effect.runPromise(getCurrentProfileEffect());
        expect(result).toMatchObject({ name: "local", mode: "direct" });
      } finally {
        cleanupTempDir(tempDir);
      }
    });
  });

  describe("setCurrentProfileEffect", () => {
    it("should set the current profile", async () => {
      const tempDir = setupTempDir();

      try {
        await Effect.runPromise(
          createProfileEffect({
            name: "local",
            mode: "direct",
            backend: "sqlite",
            userId: "user-1",
          })
        );

        await Effect.runPromise(
          createProfileEffect({
            name: "remote",
            mode: "remote",
            appUrl: "https://cache.example.com",
            token: "token-123",
          })
        );

        const result = await Effect.runPromise(setCurrentProfileEffect("remote"));
        expect(result.name).toBe("remote");

        const current = await Effect.runPromise(getCurrentProfileEffect());
        expect(current?.name).toBe("remote");
      } finally {
        cleanupTempDir(tempDir);
      }
    });

    it("should fail when profile not found", async () => {
      const tempDir = setupTempDir();

      try {
        const program = setCurrentProfileEffect("nonexistent");
        const result = await Effect.runPromise(Effect.either(program));

        if (result._tag === "Left") {
          if ("code" in result.left) {
            expect(result.left.code).toBe("profile_not_found");
          } else {
            throw new Error("Expected ConfigError");
          }
        } else {
          throw new Error("Expected failure but got success");
        }
      } finally {
        cleanupTempDir(tempDir);
      }
    });
  });

  describe("getProfileEffect", () => {
    it("should return null for nonexistent profile", async () => {
      const tempDir = setupTempDir();

      try {
        const result = await Effect.runPromise(getProfileEffect("nonexistent"));
        expect(result).toBeNull();
      } finally {
        cleanupTempDir(tempDir);
      }
    });

    it("should return the profile", async () => {
      const tempDir = setupTempDir();

      try {
        await Effect.runPromise(
          createProfileEffect({
            name: "local",
            mode: "direct",
            backend: "sqlite",
            userId: "user-1",
          })
        );

        const result = await Effect.runPromise(getProfileEffect("local"));
        expect(result).toMatchObject({ name: "local", mode: "direct" });
      } finally {
        cleanupTempDir(tempDir);
      }
    });
  });

  describe("updateProfileEffect", () => {
    it("should update an existing profile", async () => {
      const tempDir = setupTempDir();

      try {
        await Effect.runPromise(
          createProfileEffect({
            name: "local",
            mode: "direct",
            backend: "sqlite",
            userId: "user-1",
          })
        );

        const result = await Effect.runPromise(
          updateProfileEffect("local", (profile) => ({
            ...profile,
            userId: "user-updated",
          }))
        );

        if (result.mode === "direct") {
          expect(result.userId).toBe("user-updated");
        }

        const updated = await Effect.runPromise(getProfileEffect("local"));
        if (updated?.mode === "direct") {
          expect(updated.userId).toBe("user-updated");
        }
      } finally {
        cleanupTempDir(tempDir);
      }
    });

    it("should fail when profile not found", async () => {
      const tempDir = setupTempDir();

      try {
        const program = updateProfileEffect("nonexistent", (p) => p);
        const result = await Effect.runPromise(Effect.either(program));

        if (result._tag === "Left") {
          if ("code" in result.left) {
            expect(result.left.code).toBe("profile_not_found");
          } else {
            throw new Error("Expected ConfigError");
          }
        } else {
          throw new Error("Expected failure but got success");
        }
      } finally {
        cleanupTempDir(tempDir);
      }
    });
  });

  describe("deleteProfileEffect", () => {
    it("should delete a profile", async () => {
      const tempDir = setupTempDir();

      try {
        await Effect.runPromise(
          createProfileEffect({
            name: "local",
            mode: "direct",
            backend: "sqlite",
            userId: "user-1",
          })
        );

        await Effect.runPromise(deleteProfileEffect("local"));

        const result = await Effect.runPromise(getProfileEffect("local"));
        expect(result).toBeNull();
      } finally {
        cleanupTempDir(tempDir);
      }
    });

    it("should handle deleting nonexistent profile gracefully", async () => {
      const tempDir = setupTempDir();

      try {
        await Effect.runPromise(deleteProfileEffect("nonexistent"));

        const profiles = await Effect.runPromise(listProfilesEffect());
        expect(profiles).toHaveLength(0);
      } finally {
        cleanupTempDir(tempDir);
      }
    });
  });

  describe("Effect composition", () => {
    it("should compose multiple config operations", async () => {
      const tempDir = setupTempDir();

      try {
        const program = Effect.gen(function* () {
          const profile = yield* createProfileEffect({
            name: "local",
            mode: "direct",
            backend: "sqlite",
            userId: "user-1",
          });

          const profiles = yield* listProfilesEffect();
          const current = yield* getCurrentProfileEffect();

          return { profile, profiles, current };
        });

        const result = await Effect.runPromise(program);

        expect(result.profile.name).toBe("local");
        expect(result.profiles).toHaveLength(1);
        expect(result.current?.name).toBe("local");
      } finally {
        cleanupTempDir(tempDir);
      }
    });
  });
});

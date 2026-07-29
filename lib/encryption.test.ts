import { describe, it, expect, beforeEach } from "vitest";
import { encrypt, decrypt, encryptApiKey, decryptApiKey } from "./encryption";

describe("Encryption utilities", () => {
  const testKey = "test-encryption-key-must-be-32-chars!!";
  const originalEnv = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = testKey;
  });

  afterAll(() => {
    process.env.ENCRYPTION_KEY = originalEnv;
  });

  describe("encrypt and decrypt", () => {
    it("encrypts and decrypts a string correctly", () => {
      const plaintext = "sk-my-secret-api-key-12345";
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);

      expect(decrypted).toBe(plaintext);
    });

    it("produces different ciphertext for same plaintext (random IV/salt)", () => {
      const plaintext = "same-api-key";
      const encrypted1 = encrypt(plaintext, testKey);
      const encrypted2 = encrypt(plaintext, testKey);

      // Both should decrypt to same value
      expect(decrypt(encrypted1, testKey)).toBe(plaintext);
      expect(decrypt(encrypted2, testKey)).toBe(plaintext);

      // But ciphertexts should be different
      expect(encrypted1).not.toBe(encrypted2);
    });

    it("throws with invalid encryption key", () => {
      expect(() => encrypt("test", "short")).toThrow(
        "ENCRYPTION_KEY must be at least 32 characters"
      );
      expect(() => decrypt("dGVzdA==", "short")).toThrow(
        "ENCRYPTION_KEY must be at least 32 characters"
      );
    });

    it("throws with corrupted ciphertext", () => {
      const encrypted = encrypt("my-api-key", testKey);
      const corrupted = encrypted.slice(0, -5) + "XXXXX";

      expect(() => decrypt(corrupted, testKey)).toThrow();
    });
  });

  describe("encryptApiKey and decryptApiKey", () => {
    const originalSessionSecret = process.env.SESSION_SECRET;

    afterAll(() => {
      process.env.SESSION_SECRET = originalSessionSecret;
    });

    it("uses ENCRYPTION_KEY from environment", () => {
      const apiKey = "sk-proj-abc123xyz";
      const encrypted = encryptApiKey(apiKey);
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe(apiKey);
    });

    it("falls back to SESSION_SECRET if ENCRYPTION_KEY is not set", () => {
      delete process.env.ENCRYPTION_KEY;
      process.env.SESSION_SECRET = "a-valid-session-secret-that-is-32-chars!!";

      const apiKey = "sk-proj-abc123xyz";
      const encrypted = encryptApiKey(apiKey);
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe(apiKey);
    });

    it("throws if neither ENCRYPTION_KEY nor SESSION_SECRET is set", () => {
      delete process.env.ENCRYPTION_KEY;
      delete process.env.SESSION_SECRET;

      expect(() => encryptApiKey("test")).toThrow(
        "Either ENCRYPTION_KEY (32+ chars) or SESSION_SECRET (32+ chars) must be configured"
      );
    });

    it("throws if both ENCRYPTION_KEY and SESSION_SECRET are too short", () => {
      process.env.ENCRYPTION_KEY = "too-short";
      process.env.SESSION_SECRET = "short";

      expect(() => encryptApiKey("test")).toThrow(
        "Either ENCRYPTION_KEY (32+ chars) or SESSION_SECRET (32+ chars) must be configured"
      );
    });
  });

  describe("format verification", () => {
    it("encrypted output is base64 string", () => {
      const encrypted = encrypt("test-api-key", testKey);

      // Should be valid base64
      expect(() => Buffer.from(encrypted, "base64")).not.toThrow();

      // Should decode to salt (32) + iv (16) + authTag (16) + ciphertext
      const decoded = Buffer.from(encrypted, "base64");
      expect(decoded.length).toBeGreaterThan(32 + 16 + 16);
    });
  });
});

// Import afterAll for cleanup
import { afterAll } from "vitest";

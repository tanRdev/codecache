import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Derives a 32-byte key from the ENCRYPTION_KEY using scrypt
 */
function deriveKey(encryptionKey: string, salt: Buffer): Buffer {
  return scryptSync(encryptionKey, salt, 32);
}

/**
 * Encrypts a plaintext string using AES-256-GCM
 * Returns a base64-encoded string containing: salt:iv:authTag:ciphertext
 *
 * @param plaintext - The string to encrypt (e.g., API key)
 * @param encryptionKey - The encryption key from environment (must be 32+ chars)
 * @returns Base64-encoded encrypted string
 */
export function encrypt(plaintext: string, encryptionKey: string): string {
  if (!encryptionKey || encryptionKey.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters");
  }

  // Generate random salt and IV
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);

  // Derive key from encryption key and salt
  const key = deriveKey(encryptionKey, salt);

  // Create cipher
  const cipher = createCipheriv(ALGORITHM, key, iv);

  // Encrypt
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Combine: salt:iv:authTag:encrypted (all base64)
  const combined = Buffer.concat([salt, iv, authTag, encrypted]);
  return combined.toString("base64");
}

/**
 * Decrypts a base64-encoded encrypted string
 *
 * @param encryptedData - The base64-encoded encrypted string
 * @param encryptionKey - The encryption key from environment
 * @returns The decrypted plaintext string
 */
export function decrypt(encryptedData: string, encryptionKey: string): string {
  if (!encryptionKey || encryptionKey.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters");
  }

  // Decode base64
  const combined = Buffer.from(encryptedData, "base64");

  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  // Derive key
  const key = deriveKey(encryptionKey, salt);

  // Create decipher
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Get the encryption key from environment
 * Falls back to SESSION_SECRET if ENCRYPTION_KEY is not set
 */
export function getEncryptionKey(): string {
  const configuredKey = process.env.ENCRYPTION_KEY;

  if (configuredKey && configuredKey.length >= 32) {
    return configuredKey;
  }

  const sessionSecret = process.env.SESSION_SECRET;

  if (sessionSecret && sessionSecret.length >= 32) {
    return sessionSecret;
  }

  throw new Error("Either ENCRYPTION_KEY (32+ chars) or SESSION_SECRET (32+ chars) must be configured");
}

/**
 * Encrypt an API key using the environment's encryption key
 */
export function encryptApiKey(apiKey: string): string {
  return encrypt(apiKey, getEncryptionKey());
}

/**
 * Decrypt an API key using the environment's encryption key
 */
export function decryptApiKey(encryptedApiKey: string): string {
  return decrypt(encryptedApiKey, getEncryptionKey());
}

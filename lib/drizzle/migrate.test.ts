import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initializeSqliteSchema, listTables } from "./migrate";

type SqliteClient = InstanceType<typeof Database>;

const EXPECTED_TABLES = [
  "__drizzle_migrations",
  "api_tokens",
  "attachments",
  "browser_login_exchanges",
  "pending_attachment_uploads",
  "sessions",
  "snippet_tags",
  "snippets",
  "users",
];

function isCountRow(row: unknown): row is { count: number } {
  return (
    typeof row === "object" &&
    row !== null &&
    "count" in row &&
    typeof row.count === "number"
  );
}

function migrationCount(client: SqliteClient) {
  const row: unknown = client
    .prepare('SELECT COUNT(*) AS count FROM "__drizzle_migrations"')
    .get();
  return isCountRow(row) ? row.count : -1;
}

describe("initializeSqliteSchema", () => {
  let tempDir: string;
  let databasePath: string;
  let client: SqliteClient | undefined;

  beforeEach(() => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), "cache-migrate-test-"));
    databasePath = path.join(tempDir, "cache.sqlite");
  });

  afterEach(() => {
    client?.close();
    client = undefined;
    rmSync(tempDir, { force: true, recursive: true });
  });

  function openDatabase() {
    client = new Database(databasePath);
    return client;
  }

  it("creates the full schema and baseline migration record on a fresh database", () => {
    const db = openDatabase();
    initializeSqliteSchema(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });

    expect(listTables(db)).toEqual(EXPECTED_TABLES);
    expect(migrationCount(db)).toBe(1);
  });

  it("is idempotent across repeated initializations", () => {
    const db = openDatabase();
    const options = { migrationsFolder: path.join(process.cwd(), "drizzle") };

    initializeSqliteSchema(db, options);
    initializeSqliteSchema(db, options);

    expect(listTables(db)).toEqual(EXPECTED_TABLES);
    expect(migrationCount(db)).toBe(1);
  });

  it("works without a migrations folder (bundled CLI path)", () => {
    const db = openDatabase();
    initializeSqliteSchema(db);

    expect(listTables(db)).toEqual(EXPECTED_TABLES);
    expect(migrationCount(db)).toBe(1);
  });

  it("migrates a legacy ensureSchema database and preserves its data", () => {
    const db = openDatabase();

    // Simulate a database created by the legacy ensureSchema DDL, before
    // migrations existed (note: no __drizzle_migrations table, column-level
    // UNIQUE constraint instead of the users_email_unique_idx index).
    db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE snippets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        notes TEXT,
        language TEXT NOT NULL,
        code TEXT NOT NULL,
        search_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    const now = new Date().toISOString();
    db.prepare(
      "INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
    ).run("user-1", "owner@example.com", "hash", now, now);

    initializeSqliteSchema(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });

    expect(listTables(db)).toEqual(EXPECTED_TABLES);
    expect(migrationCount(db)).toBe(1);

    const user: unknown = db.prepare("SELECT email FROM users WHERE id = ?").get("user-1");
    expect(user).toMatchObject({ email: "owner@example.com" });

    // Inserts into tables the legacy schema lacked must work after migration.
    db.prepare(
      "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
    ).run("session-1", "user-1", new Date(Date.now() + 1000).toISOString(), now);
  });
});

import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

type SqliteClient = InstanceType<typeof Database>;

function createDatabase(client: SqliteClient) {
  return drizzle({ client, schema });
}

type DatabaseClient = ReturnType<typeof createDatabase>;

declare global {
  var __cacheDbClient: DatabaseClient | undefined;
  var __cacheSqliteClient: SqliteClient | undefined;
  var __cacheDbClients: Map<string, DatabaseClient> | undefined;
  var __cacheSqliteClients: Map<string, SqliteClient> | undefined;
}

let databasePathOverride: string | undefined;

function getDatabasePath() {
  if (databasePathOverride) {
    return databasePathOverride;
  }

  const env = getEnv();
  return env.SQLITE_DATABASE_PATH;
}

export function setDatabasePathOverride(databasePath?: string) {
  databasePathOverride = databasePath;
}

function ensureSchema(client: SqliteClient) {
  client.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);

    CREATE TABLE IF NOT EXISTS snippets (
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

    CREATE INDEX IF NOT EXISTS snippets_user_id_idx ON snippets(user_id);

    CREATE TABLE IF NOT EXISTS snippet_tags (
      id TEXT PRIMARY KEY,
      snippet_id TEXT NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
      tag TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS snippet_tags_snippet_id_idx ON snippet_tags(snippet_id);

    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      snippet_id TEXT NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
      storage_key TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS attachments_snippet_id_idx ON attachments(snippet_id);

    CREATE TABLE IF NOT EXISTS pending_attachment_uploads (
      file_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      snippet_id TEXT NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
      storage_key TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS api_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      token_prefix TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      last_used_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS api_tokens_user_id_idx ON api_tokens(user_id);

    CREATE TABLE IF NOT EXISTS browser_login_exchanges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL UNIQUE,
      encrypted_payload TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      consumed_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS browser_login_exchanges_user_id_idx ON browser_login_exchanges(user_id);
  `);
}

function createSqliteClient() {
  const databasePath = getDatabasePath();
  mkdirSync(dirname(databasePath), { recursive: true });
  const client = new Database(databasePath);
  ensureSchema(client);
  return client;
}

export function getSqliteClient() {
  const databasePath = getDatabasePath();
  const clients = globalThis.__cacheSqliteClients ?? new Map<string, SqliteClient>();
  globalThis.__cacheSqliteClients = clients;
  const existing = clients.get(databasePath);

  if (existing) {
    return existing;
  }

  const client = createSqliteClient();
  clients.set(databasePath, client);
  return client;
}

export function getDb() {
  const databasePath = getDatabasePath();
  const clients = globalThis.__cacheDbClients ?? new Map<string, DatabaseClient>();
  globalThis.__cacheDbClients = clients;
  const existing = clients.get(databasePath);

  if (existing) {
    return existing;
  }

  const client = createDatabase(getSqliteClient());
  clients.set(databasePath, client);
  return client;
}

export async function clearDbCache() {
  const clients = globalThis.__cacheSqliteClients;
  databasePathOverride = undefined;
  globalThis.__cacheDbClient = undefined;
  globalThis.__cacheSqliteClient = undefined;
  globalThis.__cacheDbClients = undefined;
  globalThis.__cacheSqliteClients = undefined;

  for (const client of clients?.values() ?? []) {
    client.close();
  }
}

export { schema };

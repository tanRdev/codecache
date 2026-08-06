import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { getEnv } from "@/lib/env";
import { initializeSqliteSchema } from "./migrate";
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

function getMigrationsFolder() {
  return join(process.cwd(), "drizzle");
}

function createSqliteClient() {
  const databasePath = getDatabasePath();
  mkdirSync(dirname(databasePath), { recursive: true });
  const client = new Database(databasePath);
  client.pragma("journal_mode = WAL");
  client.pragma("busy_timeout = 5000");
  client.pragma("foreign_keys = ON");
  initializeSqliteSchema(client, { migrationsFolder: getMigrationsFolder() });
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

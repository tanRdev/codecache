import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { scryptSync } from "node:crypto";
import Database from "better-sqlite3";

const e2eRoot = path.join(process.cwd(), ".cache", "e2e");
const databasePath = path.join(e2eRoot, "cache.sqlite");

function passwordHash(password: string) {
  const salt = "0123456789abcdef0123456789abcdef";
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export default async function globalSetup() {
  await rm(e2eRoot, { force: true, recursive: true });
  await mkdir(e2eRoot, { recursive: true });

  process.env.NODE_ENV = "test";
  process.env.SESSION_SECRET = "playwright-session-secret-at-least-32-characters";
  process.env.SQLITE_DATABASE_PATH = databasePath;

  const client = new Database(databasePath);
  client.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX sessions_user_id_idx ON sessions(user_id);
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
    CREATE INDEX snippets_user_id_idx ON snippets(user_id);
    CREATE TABLE snippet_tags (
      id TEXT PRIMARY KEY,
      snippet_id TEXT NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
      tag TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX snippet_tags_snippet_id_idx ON snippet_tags(snippet_id);
  `);
  const now = new Date().toISOString();
  const userId = "playwright-owner";

  client
    .prepare(
      `INSERT INTO users (id, email, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(userId, "demo@example.com", passwordHash("password1234"), now, now);

  const snippets = [
    {
      id: "playwright-react",
      title: "React state updater pattern",
      language: "typescript",
      code: "setCount((current) => current + 1);",
      tags: ["react", "state"],
    },
    {
      id: "playwright-python",
      title: "Python list comprehension",
      language: "python",
      code: "[value * 2 for value in values]",
      tags: ["python", "basics"],
    },
    {
      id: "playwright-typescript",
      title: "TypeScript generic function",
      language: "typescript",
      code: "function identity<T>(value: T): T { return value; }",
      tags: ["typescript", "generics"],
    },
  ];

  const insertSnippet = client.prepare(
    `INSERT INTO snippets
      (id, user_id, title, description, notes, language, code, search_text, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertTag = client.prepare(
    `INSERT INTO snippet_tags (id, snippet_id, tag, created_at) VALUES (?, ?, ?, ?)`,
  );

  for (const snippet of snippets) {
    insertSnippet.run(
      snippet.id,
      userId,
      snippet.title,
      null,
      null,
      snippet.language,
      snippet.code,
      [snippet.title, snippet.language, snippet.code, ...snippet.tags].join(" ").toLowerCase(),
      now,
      now,
    );

    for (const tag of snippet.tags) {
      insertTag.run(`${snippet.id}-${tag}`, snippet.id, tag, now);
    }
  }

  client.close();
}

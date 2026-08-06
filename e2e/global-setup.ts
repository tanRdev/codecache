import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { scryptSync } from "node:crypto";
import Database from "better-sqlite3";
import { initializeSqliteSchema } from "../lib/drizzle/migrate";

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
  // Schema comes from the shared migration module (lib/drizzle/migrate.ts) so
  // e2e never drifts from the app's schema definition.
  initializeSqliteSchema(client, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });
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

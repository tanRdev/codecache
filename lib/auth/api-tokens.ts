import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/drizzle";
import { apiTokensTable } from "@/lib/drizzle/schema";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createPlainTextToken() {
  const secret = randomBytes(24).toString("hex");
  const prefix = secret.slice(0, 8);

  return {
    token: `cache_pat_${secret}`,
    prefix,
  };
}

export async function createApiToken(userId: string, name: string) {
  const created = createPlainTextToken();
  const tokenHash = hashToken(created.token);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const db = getDb();
  await db.insert(apiTokensTable).values({
    id,
    user_id: userId,
    name,
    token_prefix: created.prefix,
    token_hash: tokenHash,
    created_at: now,
    updated_at: now,
  });

  return {
    id,
    token: created.token,
    tokenPrefix: created.prefix,
    userId,
    name,
  };
}

export async function resolveApiToken(token: string) {
  const tokenHash = hashToken(token);

  const db = getDb();
  const rows = await db
    .select()
    .from(apiTokensTable)
    .where(eq(apiTokensTable.token_hash, tokenHash))
    .limit(1);

  const record = rows[0];

  if (!record) {
    return null;
  }

  await db
    .update(apiTokensTable)
    .set({ last_used_at: new Date().toISOString() })
    .where(eq(apiTokensTable.id, record.id));

  return {
    tokenId: record.id,
    userId: record.user_id,
    name: record.name,
  };
}

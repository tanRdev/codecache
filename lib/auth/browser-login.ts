import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/lib/drizzle";
import { browserLoginExchangesTable } from "@/lib/drizzle/schema";
import { decrypt, encrypt, getEncryptionKey } from "@/lib/encryption";

interface BrowserLoginExchangePayload {
  name: string;
  token: string;
}

export interface CreateBrowserLoginExchangeInput {
  userId: string;
  token: string;
  name: string;
}

export interface BrowserLoginExchangeResult {
  code: string;
  expiresAt: string;
  name: string;
}

export interface BrowserLoginExchangeToken {
  name: string;
  token: string;
  userId: string;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000;

function hashExchangeCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function createExchangeCode() {
  return randomBytes(18).toString("hex");
}

function buildPayload(input: CreateBrowserLoginExchangeInput) {
  return JSON.stringify({
    name: input.name,
    token: input.token,
  } satisfies BrowserLoginExchangePayload);
}

export async function createBrowserLoginExchange(
  input: CreateBrowserLoginExchangeInput,
  options?: { ttlMs?: number }
): Promise<BrowserLoginExchangeResult> {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  const code = createExchangeCode();
  const codeHash = hashExchangeCode(code);
  const encryptedPayload = encrypt(buildPayload(input), getEncryptionKey());

  const db = getDb();

  await db.insert(browserLoginExchangesTable).values({
    id,
    user_id: input.userId,
    code_hash: codeHash,
    encrypted_payload: encryptedPayload,
    expires_at: expiresAt,
    created_at: createdAt,
  });

  return {
    code,
    expiresAt,
    name: input.name,
  };
}

function parsePayload(encryptedPayload: string) {
  const decryptedPayload = decrypt(encryptedPayload, getEncryptionKey());
  const parsedPayload = JSON.parse(decryptedPayload) as Partial<BrowserLoginExchangePayload>;

  if (typeof parsedPayload.token !== "string" || typeof parsedPayload.name !== "string") {
    throw new Error("Browser login exchange payload is invalid");
  }

  return parsedPayload as BrowserLoginExchangePayload;
}

export async function consumeBrowserLoginExchange(code: string): Promise<BrowserLoginExchangeToken> {
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    throw new Error("Browser login exchange is invalid or expired");
  }

  const codeHash = hashExchangeCode(trimmedCode);

  const db = getDb();
  const rows = await db
    .select()
    .from(browserLoginExchangesTable)
    .where(
      and(
        eq(browserLoginExchangesTable.code_hash, codeHash),
        isNull(browserLoginExchangesTable.consumed_at),
        gt(browserLoginExchangesTable.expires_at, new Date().toISOString())
      )
    )
    .limit(1);

  const exchange = rows[0];

  if (!exchange) {
    throw new Error("Browser login exchange is invalid or expired");
  }

  await db
    .update(browserLoginExchangesTable)
    .set({ consumed_at: new Date().toISOString() })
    .where(eq(browserLoginExchangesTable.id, exchange.id));

  const payload = parsePayload(exchange.encrypted_payload);

  return {
    userId: exchange.user_id,
    name: payload.name,
    token: payload.token,
  };
}

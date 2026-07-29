import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";
import { getDb } from "@/lib/drizzle";
import { sessionsTable, usersTable } from "@/lib/drizzle/schema";

const SESSION_COOKIE_NAME = "cache_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  id: string;
  user: AuthUser;
}

function getNowIsoString() {
  return new Date().toISOString();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPasswordWithSalt(password: string, saltHex: string) {
  const derived = scryptSync(password, saltHex, 64);
  return derived.toString("hex");
}

function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = hashPasswordWithSalt(password, salt);
  return `${salt}:${hash}`;
}

function verifyPasswordHash(password: string, passwordHash: string) {
  const separatorIndex = passwordHash.indexOf(":");

  if (separatorIndex <= 0) {
    return false;
  }

  const salt = passwordHash.slice(0, separatorIndex);
  const storedHash = passwordHash.slice(separatorIndex + 1);
  const computedHash = hashPasswordWithSalt(password, salt);

  return timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(computedHash, "hex"));
}

async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  const secure = getEnv().NODE_ENV === "production";

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  });
}

async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

async function readSessionCookieValue() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export async function getOwnerCount() {
  const db = getDb();
  const users = await db.select({ id: usersTable.id }).from(usersTable);
  return users.length;
}

export async function isOwnerConfigured() {
  return (await getOwnerCount()) > 0;
}

export async function resolveSession(sessionId: string | null): Promise<AuthSession | null> {
  if (!sessionId) {
    return null;
  }

  const db = getDb();
  const rows = await db
    .select({
      sessionId: sessionsTable.id,
      userId: usersTable.id,
      email: usersTable.email,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(usersTable.id, sessionsTable.user_id))
    .where(and(eq(sessionsTable.id, sessionId), gt(sessionsTable.expires_at, getNowIsoString())))
    .limit(1);

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.sessionId,
    user: {
      id: row.userId,
      email: row.email,
    },
  };
}

async function createSession(userId: string) {
  const db = getDb();
  const now = getNowIsoString();
  const sessionId = randomBytes(24).toString("hex");

  await db.insert(sessionsTable).values({
    id: sessionId,
    user_id: userId,
    created_at: now,
    expires_at: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  });

  await setSessionCookie(sessionId);

  return sessionId;
}

export async function signInWithSetupTokenToSession() {
  const db = getDb();
  const rows = await db.select().from(usersTable).limit(1);
  const owner = rows[0];

  if (!owner) {
    throw new Error("No owner account exists");
  }

  await createSession(owner.id);
}

export async function bootstrapOwnerAccount(input: { email: string; password: string }) {
  if (await isOwnerConfigured()) {
    throw new Error("Owner account already exists");
  }

  const email = normalizeEmail(input.email);
  const now = getNowIsoString();
  const userId = crypto.randomUUID();
  const passwordHash = createPasswordHash(input.password);
  const db = getDb();

  await db.insert(usersTable).values({
    id: userId,
    email,
    password_hash: passwordHash,
    created_at: now,
    updated_at: now,
  });

  await createSession(userId);

  return {
    user: {
      id: userId,
      email,
    },
  };
}

export async function signInWithPassword(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const db = getDb();
  const rows = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  const user = rows[0];

  if (!user || !verifyPasswordHash(input.password, user.password_hash)) {
    throw new Error("Invalid email or password");
  }

  await createSession(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

export async function signOut() {
  const sessionId = await readSessionCookieValue();

  if (sessionId) {
    const db = getDb();
    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
  }

  await clearSessionCookie();
}

export async function getSession() {
  const sessionId = await readSessionCookieValue();
  return resolveSession(sessionId);
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function isAuthenticated() {
  return Boolean(await getUser());
}

export async function auth() {
  const session = await getSession();
  return session ? { user: session.user } : null;
}

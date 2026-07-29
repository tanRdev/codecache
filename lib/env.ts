import { Data, Effect, Either } from "effect";

class InvalidEnvironmentVariables extends Data.TaggedError("InvalidEnvironmentVariables")<{
  issues: readonly string[];
}> {}

export interface Env {
  ATTACHMENTS_ROOT?: string;
  ENCRYPTION_KEY?: string;
    NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  NODE_ENV: "development" | "production" | "test";
  OWNER_SETUP_TOKEN?: string;
  SESSION_SECRET: string;
  SQLITE_DATABASE_PATH: string;
}

const validNodeEnvironments = new Set<Env["NODE_ENV"]>([
  "development",
  "production",
  "test",
]);

function readOptionalString(name: keyof Env) {
  const value = process.env[name];
  return value && value.trim() ? value : undefined;
}

function readRequiredString(name: keyof Env, issues: string[]) {
  const value = readOptionalString(name);

  if (!value) {
    issues.push(`${name} must be configured`);
    return "";
  }

  return value;
}

function validateOptionalUrl(name: keyof Env, issues: string[]) {
  const value = readOptionalString(name);
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).toString();
  } catch {
    issues.push(`${name} must be a valid URL`);
    return undefined;
  }
}

function readNodeEnvironment(issues: string[]): Env["NODE_ENV"] {
  const value = process.env.NODE_ENV ?? "development";

  if (validNodeEnvironments.has(value)) {
    return value;
  }

  issues.push("NODE_ENV must be one of development, production, or test");
  return "development";
}

const validateEnvEffect: Effect.Effect<Env, InvalidEnvironmentVariables> = Effect.suspend(() => {
  const issues: string[] = [];

  const env: Env = {
    ATTACHMENTS_ROOT: readOptionalString("ATTACHMENTS_ROOT"),
    ENCRYPTION_KEY: readOptionalString("ENCRYPTION_KEY"),
    NEXT_PUBLIC_APP_URL: validateOptionalUrl("NEXT_PUBLIC_APP_URL", issues),
    NEXT_PUBLIC_SITE_URL: validateOptionalUrl("NEXT_PUBLIC_SITE_URL", issues),
    NODE_ENV: readNodeEnvironment(issues),
    OWNER_SETUP_TOKEN: readOptionalString("OWNER_SETUP_TOKEN"),
    SESSION_SECRET: readRequiredString("SESSION_SECRET", issues),
    SQLITE_DATABASE_PATH: readRequiredString("SQLITE_DATABASE_PATH", issues),
  };

  if (env.SESSION_SECRET.length > 0 && env.SESSION_SECRET.length < 32) {
    issues.push("SESSION_SECRET must be at least 32 characters");
  }

  if (env.ENCRYPTION_KEY && env.ENCRYPTION_KEY.length < 32) {
    issues.push("ENCRYPTION_KEY must be at least 32 characters");
  }

  if (env.OWNER_SETUP_TOKEN && env.OWNER_SETUP_TOKEN.length < 32) {
    issues.push("OWNER_SETUP_TOKEN must be at least 32 characters");
  }

  if (issues.length > 0) {
    return Effect.fail(new InvalidEnvironmentVariables({ issues }));
  }

  return Effect.succeed(env);
});

function throwInvalidEnvironment(error: InvalidEnvironmentVariables): never {
  console.error("Invalid environment variables:", error.issues);
  throw new Error("Invalid environment variables");
}

export function validateEnv(): Env {
  const result = Effect.runSync(Effect.either(validateEnvEffect));

  if (Either.isLeft(result)) {
    return throwInvalidEnvironment(result.left);
  }

  return result.right;
}

let cachedEnv: Env | undefined;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }

  return cachedEnv;
}

export function clearEnvCache(): void {
  cachedEnv = undefined;
}

import { Data, Effect } from "effect";

export class HttpClientError extends Data.TaggedError("HttpClientError")<{
  readonly code: string;
  readonly message: string;
  readonly status?: number;
  readonly details?: Record<string, unknown>;
}> {}

export class FileSystemError extends Data.TaggedError("FileSystemError")<{
  readonly operation: "read" | "write" | "mkdir" | "parse";
  readonly message: string;
  readonly path: string;
}> {}

export class BrowserAuthError extends Data.TaggedError("BrowserAuthError")<{
  readonly code: "timeout" | "server_error" | "invalid_token";
  readonly message: string;
}> {}

export class ConfigError extends Data.TaggedError("ConfigError")<{
  readonly code: "profile_not_found" | "invalid_config" | "write_failed";
  readonly message: string;
}> {}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
}

export function isApiSuccess<T>(payload: unknown): payload is ApiSuccess<T> {
  return Boolean(
    payload &&
    typeof payload === "object" &&
    "ok" in payload &&
    payload.ok === true &&
    "data" in payload
  );
}

function getApiFailure(payload: unknown): ApiFailure | null {
  if (!payload || typeof payload !== "object" || !("ok" in payload) || payload.ok !== false) {
    return null;
  }

  if ("error" in payload) {
    const error = payload.error;

    if (error && typeof error === "object") {
      const code = "code" in error && typeof error.code === "string" ? error.code : undefined;
      const message = "message" in error && typeof error.message === "string" ? error.message : undefined;
      return {
        ok: false,
        error: {
          code,
          message,
        },
      };
    }

    return {
      ok: false,
      error: undefined,
    };
  }

  return { ok: false };
}

export function tryHttpRequest<T>(
  operation: () => Promise<T>
): Effect.Effect<T, HttpClientError> {
  return Effect.tryPromise({
    try: operation,
    catch: (error) => {
      if (error instanceof HttpClientError) {
        return error;
      }

      if (error instanceof Error) {
        return new HttpClientError({
          code: "request_failed",
          message: error.message,
        });
      }

      return new HttpClientError({
        code: "unknown_error",
        message: "An unexpected error occurred",
      });
    },
  });
}

export function parseApiResponse<T>(
  response: Response,
  payload: unknown
): Effect.Effect<T, HttpClientError> {
  if (response.ok && isApiSuccess<T>(payload)) {
    return Effect.succeed(payload.data);
  }

  const errorPayload = getApiFailure(payload)?.error;

  return Effect.fail(
    new HttpClientError({
      code: errorPayload?.code ?? "request_failed",
      message: errorPayload?.message ?? `Request failed with status ${response.status}`,
      status: response.status,
      details: errorPayload?.details,
    })
  );
}

export function tryFileRead(
  path: string
): Effect.Effect<string, FileSystemError> {
  return Effect.tryPromise({
    try: async () => {
      const { readFile } = await import("node:fs/promises");
      return readFile(path, "utf8");
    },
    catch: (error) =>
      new FileSystemError({
        operation: "read",
        message: error instanceof Error ? error.message : "Failed to read file",
        path,
      }),
  });
}

export function tryFileWrite(
  path: string,
  content: string
): Effect.Effect<void, FileSystemError> {
  return Effect.tryPromise({
    try: async () => {
      const [{ mkdir, writeFile }, { dirname }] = await Promise.all([
        import("node:fs/promises"),
        import("node:path"),
      ]);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content, "utf8");
    },
    catch: (error) =>
      new FileSystemError({
        operation: "write",
        message: error instanceof Error ? error.message : "Failed to write file",
        path,
      }),
  });
}

export function tryParseJson<T>(
  json: string,
  path: string
): Effect.Effect<T, FileSystemError> {
  return Effect.try({
    try: () => JSON.parse(json) as T,
    catch: (error) =>
      new FileSystemError({
        operation: "parse",
        message: error instanceof Error ? error.message : "Invalid JSON",
        path,
      }),
  });
}

export function runCliEffect<T, E>(
  effect: Effect.Effect<T, E>
): Promise<T> {
  return Effect.runPromise(
    effect.pipe(
      Effect.catchAll((error) => {
        if (error instanceof Error) {
          return Effect.fail(error);
        }
        return Effect.fail(new Error(String(error)));
      })
    )
  );
}

export function runCliEffectWithErrorHandling<T, E>(
  effect: Effect.Effect<T, E>,
  options: {
    onError: (error: E) => void;
  }
): Promise<T | null> {
  return Effect.runPromise(
    effect.pipe(
      Effect.matchEffect({
        onFailure: (error) => {
          options.onError(error);
          return Effect.succeed(null);
        },
        onSuccess: (value) => Effect.succeed(value),
      })
    )
  );
}

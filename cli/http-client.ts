import { CacheError } from "@/lib/core/errors";
import {
  HttpClientError,
  parseApiResponse,
} from "@/lib/effect/cli";
import { Effect } from "effect";

interface ApiSuccess<T> {
  ok: true;
  data: T;
}

interface ApiFailure {
  ok: false;
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
}

function isApiSuccess<T>(payload: unknown): payload is ApiSuccess<T> {
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

export interface HttpClient {
  delete<T>(path: string): Promise<T>;
  get<T>(path: string): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  postForm<T>(path: string, form: FormData): Promise<T>;
}

export interface HttpClientEffect {
  delete<T>(path: string): Effect.Effect<T, HttpClientError>;
  get<T>(path: string): Effect.Effect<T, HttpClientError>;
  patch<T>(path: string, body?: unknown): Effect.Effect<T, HttpClientError>;
  post<T>(path: string, body?: unknown): Effect.Effect<T, HttpClientError>;
  postForm<T>(path: string, form: FormData): Effect.Effect<T, HttpClientError>;
}

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json();

  if (response.ok && isApiSuccess<T>(payload)) {
    return payload.data;
  }

  const errorPayload = getApiFailure(payload)?.error;

  throw new CacheError(
    errorPayload?.code ?? "request_failed",
    errorPayload?.message ?? `Request failed with status ${response.status}`,
    response.status,
    errorPayload?.details
  );
}

function requestEffect<T>(
  baseUrl: string,
  token: string,
  path: string,
  init?: RequestInit
): Effect.Effect<T, HttpClientError> {
  return Effect.tryPromise({
    try: async () => {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(init?.headers ?? {}),
        },
      });

      const payload: unknown = await response.json();
      return { response, payload };
    },
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
  }).pipe(
    Effect.flatMap(({ response, payload }): Effect.Effect<T, HttpClientError> =>
      parseApiResponse<T>(response, payload)
    )
  );
}

export function createHttpClient(baseUrl: string, token: string): HttpClient {
  const normalizedBaseUrl = trimTrailingSlash(new URL(baseUrl).toString());

  async function request<T>(path: string, init?: RequestInit) {
    const response = await fetch(`${normalizedBaseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });

    return parseResponse<T>(response);
  }

  return {
    async get<T>(path: string) {
      return request<T>(path, { method: "GET" });
    },
    async post<T>(path: string, body?: unknown) {
      return request<T>(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    },
    async patch<T>(path: string, body?: unknown) {
      return request<T>(path, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    },
    async postForm<T>(path: string, form: FormData) {
      return request<T>(path, {
        method: "POST",
        body: form,
      });
    },
    async delete<T>(path: string) {
      return request<T>(path, { method: "DELETE" });
    },
  };
}

export function createHttpClientEffect(
  baseUrl: string,
  token: string
): HttpClientEffect {
  const normalizedBaseUrl = trimTrailingSlash(new URL(baseUrl).toString());

  return {
    get<T>(path: string) {
      return requestEffect<T>(normalizedBaseUrl, token, path, { method: "GET" });
    },
    post<T>(path: string, body?: unknown) {
      return requestEffect<T>(normalizedBaseUrl, token, path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    },
    patch<T>(path: string, body?: unknown) {
      return requestEffect<T>(normalizedBaseUrl, token, path, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    },
    postForm<T>(path: string, form: FormData) {
      return requestEffect<T>(normalizedBaseUrl, token, path, {
        method: "POST",
        body: form,
      });
    },
    delete<T>(path: string) {
      return requestEffect<T>(normalizedBaseUrl, token, path, { method: "DELETE" });
    },
  };
}

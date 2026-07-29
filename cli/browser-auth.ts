import { createServer } from "node:http";
import { Effect } from "effect";
import { BrowserAuthError } from "@/lib/effect/cli";

function getLoopbackAddress() {
  return "127.0.0.1";
}

export function buildBrowserLoginUrl(baseUrl: string, callbackUrl: string, name: string) {
  const url = new URL("/auth/cli", baseUrl);
  url.searchParams.set("callback", callbackUrl);

  if (name.trim()) {
    url.searchParams.set("name", name.trim());
  }

  return url.toString();
}

export function shouldAutoOpenBrowser(): boolean {
  return false;
}

export async function openBrowser(url: string) {
  throw new Error(`Browser auto-open is disabled. Open this URL manually: ${url}`);
}

export function openBrowserEffect(url: string): Effect.Effect<void, BrowserAuthError> {
  return Effect.fail(
    new BrowserAuthError({
      code: "server_error",
      message: `Browser auto-open is disabled. Open this URL manually: ${url}`,
    })
  );
}

export interface AuthCallbackSession {
  callbackUrl: string;
  codePromise: Promise<string>;
  close(): Promise<void>;
}

export async function startAuthCallbackServer(timeoutMs = 300000): Promise<AuthCallbackSession> {
  const state: {
    rejectToken?: (error: Error) => void;
    resolveToken?: (token: string) => void;
    timeoutId?: NodeJS.Timeout;
  } = {};

  const codePromise = new Promise<string>((resolve, reject) => {
    state.resolveToken = resolve;
    state.rejectToken = reject;
  });
  codePromise.catch(() => undefined);

  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url ?? "/", `http://${getLoopbackAddress()}`);

    if (requestUrl.pathname !== "/callback") {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const code = requestUrl.searchParams.get("code");

    if (!code) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Missing exchange code");
      return;
    }

    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }

    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(
      `<!doctype html><html><body><h1>Cache CLI login complete</h1><p>You can close this window.</p><script>window.close()</script></body></html>`
    );
    state.resolveToken?.(code);
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, getLoopbackAddress(), () => resolve());
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    throw new Error("Failed to bind the browser auth callback server");
  }

  state.timeoutId = setTimeout(() => {
    state.rejectToken?.(new Error("Timed out waiting for browser login"));
  }, timeoutMs);

  return {
    callbackUrl: `http://${getLoopbackAddress()}:${address.port}/callback`,
    codePromise,
    async close() {
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
      }

      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    },
  };
}

export function startAuthCallbackServerEffect(
  timeoutMs = 300000
): Effect.Effect<AuthCallbackSession, BrowserAuthError> {
  return Effect.gen(function* () {
    // Create state for the session
    const state = {
      resolveToken: null as ((token: string) => void) | null,
      rejectToken: null as ((error: Error) => void) | null,
      timeoutId: null as NodeJS.Timeout | null,
    };

    // Create the token promise
    const codePromise = new Promise<string>((resolve, reject) => {
      state.resolveToken = resolve;
      state.rejectToken = reject;
    });
    codePromise.catch(() => undefined);

    // Create the server
    const server = createServer((request, response) => {
      const requestUrl = new URL(request.url ?? "/", `http://${getLoopbackAddress()}`);

      if (requestUrl.pathname !== "/callback") {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }

      const code = requestUrl.searchParams.get("code");

      if (!code) {
        response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Missing exchange code");
        state.rejectToken?.(new Error("No exchange code provided in callback"));
        return;
      }

      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
      }

      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(
        `<!doctype html><html><body><h1>Cache CLI login complete</h1><p>You can close this window.</p><script>window.close()</script></body></html>`
      );
      state.resolveToken?.(code);
    });

    // Start the server
    yield* Effect.tryPromise({
      try: () =>
        new Promise<void>((resolve, reject) => {
          server.once("error", reject);
          server.listen(0, getLoopbackAddress(), () => resolve());
        }),
      catch: (error) =>
        new BrowserAuthError({
          code: "server_error",
          message: error instanceof Error ? error.message : "Failed to start auth callback server",
        }),
    });

    const address = server.address();

    if (!address || typeof address === "string") {
      // Close the server and fail
      yield* Effect.tryPromise({
        try: () =>
          new Promise<void>((resolve) => {
            server.close(() => resolve());
          }),
        catch: () =>
          new BrowserAuthError({
            code: "server_error",
            message: "Failed to close server after bind failure",
          }),
      }).pipe(Effect.catchAll(() => Effect.void));

      return yield* Effect.fail(
        new BrowserAuthError({
          code: "server_error",
          message: "Failed to bind the browser auth callback server",
        })
      );
    }

    // Set up timeout
    state.timeoutId = setTimeout(() => {
      state.rejectToken?.(new Error("Timed out waiting for browser login"));
    }, timeoutMs);

    // Build the session object
    const session: AuthCallbackSession = {
      callbackUrl: `http://${getLoopbackAddress()}:${address.port}/callback`,
      codePromise,
      close: () =>
        new Promise<void>((resolve, reject) => {
          if (state.timeoutId) {
            clearTimeout(state.timeoutId);
          }
          server.close((error) => {
            if (error) {
              reject(error);
              return;
            }
            resolve();
          });
        }),
    };

    return session;
  });
}

interface BrowserLoginExchangeSuccess {
  ok: true;
  data: {
    name: string;
    token: string;
  };
}

interface BrowserLoginExchangeFailure {
  ok: false;
  error?: {
    message?: string;
  };
}

export async function exchangeBrowserLoginCode(baseUrl: string, code: string) {
  const endpoint = new URL("/api/v1/auth/browser-login/exchange", baseUrl).toString();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  const payload = await response.json() as BrowserLoginExchangeSuccess | BrowserLoginExchangeFailure;

  if (!response.ok || !payload || payload.ok !== true) {
    const message = payload && "error" in payload && payload.error?.message
      ? payload.error.message
      : `Browser login exchange failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload.data;
}

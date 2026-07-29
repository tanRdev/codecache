import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { createHttpClientEffect, createHttpClient } from "@/cli/http-client";
import { Effect } from "effect";
import { createServer } from "node:http";

describe("http-client Effect", () => {
  let serverUrl: string;
  let server: ReturnType<typeof createServer>;

  beforeAll(async () => {
    server = createServer((req, res) => {
      const url = new URL(req.url || "/", `http://localhost`);

      // Check auth header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: { code: "unauthorized", message: "Missing token" } }));
        return;
      }

      if (url.pathname === "/api/success") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, data: { message: "success" } }));
        return;
      }

      if (url.pathname === "/api/error") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: { code: "bad_request", message: "Invalid input" } }));
        return;
      }

      if (url.pathname === "/api/server-error") {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: { code: "internal_error", message: "Server error" } }));
        return;
      }

      if (url.pathname === "/api/data") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
          const data = body ? JSON.parse(body) : {};
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, data: { received: data, method: req.method } }));
        });
        return;
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: { code: "not_found", message: "Not found" } }));
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const address = server.address();
    if (address && typeof address === "object") {
      serverUrl = `http://127.0.0.1:${address.port}`;
    }
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe("createHttpClientEffect", () => {
    it("should successfully make GET requests", async () => {
      const client = createHttpClientEffect(serverUrl, "test-token");

      const result = await Effect.runPromise(client.get("/api/success"));

      expect(result).toEqual({ message: "success" });
    });

    it("should successfully make POST requests with body", async () => {
      const client = createHttpClientEffect(serverUrl, "test-token");

      const result = await Effect.runPromise(
        client.post("/api/data", { test: "data" })
      );

      expect(result).toEqual({
        received: { test: "data" },
        method: "POST",
      });
    });

    it("should successfully make PATCH requests", async () => {
      const client = createHttpClientEffect(serverUrl, "test-token");

      const result = await Effect.runPromise(
        client.patch("/api/data", { updated: true })
      );

      expect(result).toEqual({
        received: { updated: true },
        method: "PATCH",
      });
    });

    it("should successfully make DELETE requests", async () => {
      const client = createHttpClientEffect(serverUrl, "test-token");

      const result = await Effect.runPromise(client.delete("/api/data"));

      expect(result).toEqual({
        received: {},
        method: "DELETE",
      });
    });

    it("should handle 4xx errors with typed error", async () => {
      const client = createHttpClientEffect(serverUrl, "test-token");

      const result = await Effect.runPromise(
        Effect.either(client.get("/api/error"))
      );

      if (result._tag === "Left") {
        expect(result.left.code).toBe("bad_request");
        expect(result.left.message).toBe("Invalid input");
        expect(result.left.status).toBe(400);
      } else {
        throw new Error("Expected failure but got success");
      }
    });

    it("should handle 5xx errors with typed error", async () => {
      const client = createHttpClientEffect(serverUrl, "test-token");

      const result = await Effect.runPromise(
        Effect.either(client.get("/api/server-error"))
      );

      if (result._tag === "Left") {
        expect(result.left.code).toBe("internal_error");
        expect(result.left.message).toBe("Server error");
        expect(result.left.status).toBe(500);
      } else {
        throw new Error("Expected failure but got success");
      }
    });

    it("should handle network errors", async () => {
      const client = createHttpClientEffect("http://localhost:59999", "test-token");

      const result = await Effect.runPromise(
        Effect.either(client.get("/api/success"))
      );

      if (result._tag === "Left") {
        expect(result.left.code).toBe("request_failed");
      } else {
        throw new Error("Expected failure but got success");
      }
    });

    it("should compose multiple requests with Effect", async () => {
      const client = createHttpClientEffect(serverUrl, "test-token");

      const program = Effect.gen(function* () {
        const first = yield* client.get<{ message: string }>("/api/success");
        const second = yield* client.post<{ received: { ref: string }; method: string }>("/api/data", { ref: first.message });
        return { first, second };
      });

      const result = await Effect.runPromise(program);

      expect(result.first).toEqual({ message: "success" });
      expect(result.second.received).toEqual({ ref: "success" });
    });
  });

  describe("createHttpClient (original)", () => {
    it("should still work with original Promise-based API", async () => {
      const client = createHttpClient(serverUrl, "test-token");

      const result = await client.get("/api/success");

      expect(result).toEqual({ message: "success" });
    });

    it("should throw CacheError on API error", async () => {
      const client = createHttpClient(serverUrl, "test-token");

      await expect(client.get("/api/error")).rejects.toThrow();
    });
  });
});

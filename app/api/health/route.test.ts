import { describe, expect, it } from "vitest";

describe("health route", () => {
  it("returns a basic health payload", async () => {
    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: {
        service: "cache",
        status: "ok",
      },
    });
  });
});

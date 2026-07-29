import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("local CLI", () => {
  let temporaryRoot: string;
  let configRoot: string;
  let databasePath: string;
  let sourcePath: string;
  let attachmentPath: string;
  let exportedAttachmentPath: string;

  beforeAll(async () => {
    temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cache-cli-e2e-"));
    configRoot = path.join(temporaryRoot, "config");
    databasePath = path.join(temporaryRoot, "library.sqlite");
    sourcePath = path.join(temporaryRoot, "retry.ts");
    attachmentPath = path.join(temporaryRoot, "notes.md");
    exportedAttachmentPath = path.join(temporaryRoot, "exported-notes.md");
    await writeFile(sourcePath, "export const retry = () => true;\n", "utf8");
    await writeFile(attachmentPath, "Add jitter before production use.\n", "utf8");
  });

  afterAll(async () => {
    await rm(temporaryRoot, { force: true, recursive: true });
  });

  async function run(...args: string[]) {
    const result = await execFileAsync(
      process.execPath,
      [path.join(process.cwd(), "bin", "cache.js"), ...args, "--format", "json"],
      {
        env: {
          ...process.env,
          CACHE_CLI_CONFIG_DIR: configRoot,
        },
      }
    );

    return JSON.parse(result.stdout) as { data: unknown; ok: boolean };
  }

  it("initializes, writes, searches, and validates without server secrets", async () => {
    const initialized = await run(
      "init",
      "--name",
      "local",
      "--database",
      databasePath
    );

    expect(initialized).toMatchObject({
      ok: true,
      data: {
        backend: "sqlite",
        databasePath,
        mode: "direct",
        name: "local",
      },
    });

    const created = await run(
      "add",
      sourcePath,
      "--title",
      "Retry helper",
      "--tag",
      "typescript"
    );
    expect(created).toMatchObject({
      ok: true,
      data: {
        id: expect.any(String),
        title: "Retry helper",
      },
    });
    const snippetId = (created.data as { id: string }).id;

    const search = await run("search", "retry");
    expect(search).toMatchObject({
      ok: true,
      data: [
        {
          title: "Retry helper",
          tags: ["typescript"],
        },
      ],
    });

    const validation = await run("storage", "validate");
    expect(validation).toMatchObject({
      ok: true,
      data: {
        backend: "sqlite",
        databasePath,
        valid: true,
      },
    });

    const attached = await run("attachment", "add", snippetId, attachmentPath);
    expect(attached).toMatchObject({
      ok: true,
      data: {
        id: expect.any(String),
        file_name: "notes.md",
      },
    });
    const attachmentId = (attached.data as { id: string }).id;

    await expect(run("attachment", "list", snippetId)).resolves.toMatchObject({
      ok: true,
      data: [
        {
          id: attachmentId,
          file_name: "notes.md",
        },
      ],
    });

    await expect(
      run("attachment", "get", attachmentId, "--output", exportedAttachmentPath)
    ).resolves.toMatchObject({
      ok: true,
      data: {
        outputPath: exportedAttachmentPath,
        success: true,
      },
    });
    await expect(readFile(exportedAttachmentPath, "utf8")).resolves.toBe(
      "Add jitter before production use.\n"
    );
  }, 20_000);
});

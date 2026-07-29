#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const entryPath = path.join(currentDirectory, "..", "cli", "index.ts");
const tsxCliPath = path.join(currentDirectory, "..", "node_modules", "tsx", "dist", "cli.mjs");

process.title = "cache";

const child = spawn(
  process.execPath,
  [tsxCliPath, entryPath, ...process.argv.slice(2)],
  {
    stdio: "inherit",
  }
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

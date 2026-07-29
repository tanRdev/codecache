import { defineConfig } from "tsup";

export default defineConfig({
  banner: {
    js: "#!/usr/bin/env node",
  },
  clean: true,
  dts: false,
  entry: {
    index: "cli/index.ts",
  },
  external: ["better-sqlite3"],
  format: ["esm"],
  minify: false,
  outDir: "packages/cli/dist",
  outExtension: () => ({ js: ".js" }),
  platform: "node",
  sourcemap: false,
  splitting: false,
  target: "node22",
});

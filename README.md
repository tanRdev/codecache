<div align="center">
  <img src="./app/icon.svg" width="72" alt="Cache logo" />
  <h1>Cache</h1>
  <p><strong>Your personal code library, on your machine.</strong></p>
  <p>
    Save useful code from the terminal, browse it in a focused web interface,
    and keep the entire library in files you control.
  </p>

  [![CI](https://github.com/tanRdev/codecache/actions/workflows/ci.yml/badge.svg)](https://github.com/tanRdev/codecache/actions/workflows/ci.yml)
  [![License: MIT](https://img.shields.io/badge/license-MIT-f47a34.svg)](./LICENSE)
  [![Node.js 22+](https://img.shields.io/badge/node-%3E%3D22-43853d.svg)](https://nodejs.org/)
</div>

## Why Cache?

Good snippets usually disappear into old projects, chat threads, and unnamed
files. Cache gives them a durable home without turning your personal library
into another hosted service.

- **Local first** — SQLite for metadata, regular files for attachments.
- **Fast from the terminal** — add, search, update, and retrieve without
  leaving your editor.
- **Comfortable in the browser** — a focused interface for browsing and
  editing larger snippets.
- **Portable by default** — back up or move the database and attachments like
  any other files.
- **Self-hostable** — optionally run the web app on infrastructure you control.

No managed accounts, billing, telemetry requirement, or hosted storage.

## Quick start

Install the CLI from the latest GitHub release:

```bash
npm install --global https://github.com/tanRdev/codecache/releases/latest/download/codecache-cli.tgz
cache init
cache add ./src/use-local-storage.ts --tag react --tag typescript
cache search local-storage
```

`cache init` creates a local profile and database automatically. On macOS, the
default database is stored under `~/Library/Application Support/Cache/`.

To run the current source checkout:

```bash
git clone https://github.com/tanRdev/codecache.git
cd codecache
npm install
npm run cache -- init
npm run cache -- search auth
```

## Web app

The browser app is intended for local use or self-hosting. It uses the same
SQLite-backed core as the CLI.

```bash
cp .env.example .env.local
openssl rand -base64 48 # SESSION_SECRET
openssl rand -base64 48 # OWNER_SETUP_TOKEN
openssl rand -base64 48 # ENCRYPTION_KEY
npm run dev
```

Set the generated values and an absolute `SQLITE_DATABASE_PATH` in
`.env.local`, then open [http://localhost:3000/setup](http://localhost:3000/setup).

A public landing-only build can use `NEXT_PUBLIC_DEPLOYMENT_MODE=marketing`.
That mode serves the product site, documentation, and health check while keeping
account, setup, and application API routes unavailable.

## CLI essentials

```bash
cache add ./file.ts --title "Example" --tag typescript
cache search authentication
cache get <snippet-id>
cache snippet update <snippet-id> ./updated.ts
cache rm <snippet-id>

cache attachment add <snippet-id> ./notes.md
cache attachment list <snippet-id>
cache attachment get <attachment-id> --output ./notes.md

cache profile list
cache storage get
cache storage validate
```

Commands use readable terminal output by default and support `--format json`
or `--format jsonl` for scripts.

## Architecture

```text
Browser UI ─┐
            ├── Core services ── SQLite + attachment files
Local CLI ──┘

Remote CLI ── HTTP API ── Self-hosted browser app
```

The repository contains:

- `app/` and `components/` — Next.js product site, docs, and browser app
- `cli/` — CLI parsing, profiles, interactive shell, and transports
- `lib/core/` — shared snippet and attachment services
- `lib/storage/` — SQLite and filesystem persistence
- `packages/cli/` — minimal publishable npm package
- `content/docs/` — product documentation

The product language is defined in [CONTEXT.md](./CONTEXT.md). Architectural
decisions live in [docs/adr](./docs/adr).

## Development

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build:cli
npm run build
```

Run the complete release check with:

```bash
npm run verify
```

## Data and security

- Local CLI profiles are stored with owner-only file permissions.
- Remote API tokens are redacted from human and structured CLI output.
- The full web app binds data to a single configured owner.
- Marketing deployments deny application and API routes.
- Rate limiting is in-process and per instance: counters reset on restart and
  are not shared between instances. Multi-instance deployments should enforce
  limits at the load balancer or reverse proxy; the built-in limiter fails
  closed on unexpected errors.
- Back up both the SQLite database and attachments directory.

See [SECURITY.md](./SECURITY.md) for vulnerability reporting and
[CONTRIBUTING.md](./CONTRIBUTING.md) for development guidance.

## Status

Cache is an early open-source project. The local CLI, browser app, API, search,
tags, and attachments are implemented. Backward compatibility is not guaranteed
until `1.0.0`.

## License

[MIT](./LICENSE)

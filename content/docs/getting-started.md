# Getting Started with Cache

Cache is a self-hosted snippet library for one local owner. The web app, CLI, and API all point at the same SQLite-backed source of truth.

## What You Get

- SQLite for snippets, sessions, API tokens, browser-login exchanges
- Local filesystem storage for attachments
- Single owner sign-in for self-hosted deployments
- Direct local CLI profiles and remote CLI profiles
- REST API for automation
- Optional landing-page-only deploy for docs and product site

## Key Features

| Feature | Description |
| --- | --- |
| CLI-first workflow | Save and search snippets from terminal |
| Fast search | Filter by text and tags |
| Attachments | Keep images, PDFs, markdown, CSV, and JSON with snippets |
| SQLite-only storage | One backend, one source of truth |
| Remote CLI auth | Browser login flow for CLI against running server |
| Self-hosted ownership | One owner account per instance |
| Local web UI | Full snippet browsing and editing on your own running app |

## Architecture

```text
Web UI -> Server Actions -> Core Services -> SQLite + local files
CLI direct -------------------------------> |
CLI remote -> HTTP API -------------------> |
Landing page (optional) -> docs and install steps only
```

## Next Steps

- [Installation](/docs/getting-started/installation)
- [Quick Start](/docs/getting-started/quickstart)
- [CLI Commands](/docs/cli/commands)

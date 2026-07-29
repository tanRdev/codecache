# Quick Start

Create a local snippet library in under a minute.

## 1. Install the CLI

```bash
npm install --global https://github.com/tanRdev/codecache/releases/latest/download/codecache-cli.tgz
```

Working from a source checkout instead?

```bash
npm install
npm run cache -- init
```

## 2. Initialize Cache

```bash
cache init
```

Cache creates a `local` profile, a unique local owner, and a SQLite database in
your operating system's application-data directory. No environment file,
account, or running server is required.

Use a specific database location when it belongs in an existing backup:

```bash
cache init --database /absolute/path/to/cache.sqlite
```

## 3. Save something useful

```bash
cache add ./README.md --title "Project notes" --tag docs
```

You can also pipe content:

```bash
git diff | cache add - --title "Refactor notes" --tag work-in-progress
```

## 4. Find it again

```bash
cache search docs
cache profile list
cache storage validate
```

## 5. Attach context

```bash
cache attachment add <snippet-id> ./notes.md
cache attachment list <snippet-id>
```

## Optional: run the browser app

The web app is available from a source checkout:

```bash
cp .env.example .env.local
npm run dev
```

The browser app has a single-owner setup flow and is also suitable for
self-hosting. See [Installation](/docs/getting-started/installation) for the
required secrets and storage paths.

## Optional: connect a remote CLI

```bash
cache auth login --name server --base-url http://localhost:3000
```

Remote mode sends the same CLI commands to a Cache server you control.

## Next steps

- [CLI Commands](/docs/cli/commands)
- [CLI Configuration](/docs/cli/configuration)
- [Storage](/docs/features/storage)

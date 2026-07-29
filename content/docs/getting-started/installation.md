# Installation

Install the local CLI or run the full browser app.

## Requirements

- Node.js 22+
- npm
- Writable persistent directory for database and attachments

## Local CLI

```bash
npm install --global https://github.com/tanRdev/codecache/releases/latest/download/codecache-cli.tgz
cache init
```

That is the complete setup for direct CLI mode. Cache selects a database path,
creates its parent directory, initializes the schema, and seeds the local owner.

Use `cache storage get` to see the active paths.

## Browser app setup

### 1. Clone and install

```bash
git clone https://github.com/tanRdev/codecache.git
cd codecache
npm install
```

### 2. Create environment file

```bash
cp .env.example .env.local
```

Set required variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEPLOYMENT_MODE=full
SESSION_SECRET=replace-with-at-least-32-characters
SQLITE_DATABASE_PATH=/absolute/path/to/cache.sqlite
ATTACHMENTS_ROOT=/absolute/path/to/cache-attachments
OWNER_SETUP_TOKEN=replace-with-at-least-32-characters
ENCRYPTION_KEY=replace-with-at-least-32-characters
```

Notes:

- `ATTACHMENTS_ROOT` is optional. If omitted, the app stores files next to the database.
- `OWNER_SETUP_TOKEN` is required to initialize the first owner account from `/setup`.
- `ENCRYPTION_KEY` is only needed for remote CLI browser-login exchange.
- `NEXT_PUBLIC_DEPLOYMENT_MODE=marketing` restricts the deployment to the landing page, documentation, static assets, and `/api/health`.

### 3. Prepare storage paths

```bash
mkdir -p "$(dirname "$SQLITE_DATABASE_PATH")"
mkdir -p "$ATTACHMENTS_ROOT"
```

### 4. Start app

```bash
npm run dev
```

Open `http://localhost:3000/setup` and create first owner account.

## Production Notes

- Put SQLite database and attachments on persistent volume.
- Set `NEXT_PUBLIC_APP_URL` to public HTTPS URL.
- Use reverse proxy or platform TLS in front of app.
- Keep `SESSION_SECRET`, `OWNER_SETUP_TOKEN`, and `ENCRYPTION_KEY` out of source control.

## Marketing-only site

If you want a public landing page while data stays local:

1. Deploy a build with `NEXT_PUBLIC_DEPLOYMENT_MODE=marketing`.
2. Keep the main Cache app in normal `full` mode.
3. Use deployed site for product overview and docs only.
4. Account, setup, dashboard, and application API routes return to the installation guide or a `404` response in marketing mode.

## Health Checks

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/ready
```

Expected responses:

- `/api/health`: service is up
- `/api/ready`: database is ready

## Troubleshooting

### App fails on startup

- Verify `SESSION_SECRET` exists and is at least 32 chars.
- Verify `SQLITE_DATABASE_PATH` is absolute and writable.
- If using remote CLI login, verify `ENCRYPTION_KEY` is at least 32 chars.

### Ready check fails

- Confirm database directory exists.
- Confirm process can create or write SQLite file.

### Attachments fail to save

- Confirm `ATTACHMENTS_ROOT` exists or can be created.
- Confirm directory is writable by app process.

## Next Steps

- [Quick Start](/docs/getting-started/quickstart)
- [Storage](/docs/features/storage)
- [CLI Configuration](/docs/cli/configuration)

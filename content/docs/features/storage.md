# Storage

Cache uses one storage backend: SQLite for app data and the local filesystem for attachments.

## Data Layout

| Data | Location |
| --- | --- |
| Users | SQLite |
| Sessions | SQLite |
| Snippets | SQLite |
| Tags | SQLite |
| API tokens | SQLite |
| Browser-login exchanges | SQLite |
| Attachments | Local filesystem |

## Configuration

Required:

```env
SESSION_SECRET=replace-with-at-least-32-characters
SQLITE_DATABASE_PATH=/absolute/path/to/cache.sqlite
```

Optional:

```env
ATTACHMENTS_ROOT=/absolute/path/to/cache-attachments
```

If `ATTACHMENTS_ROOT` is not set, attachment files are stored next to the database file.

## Operational Notes

- The app creates the database directory automatically.
- SQLite foreign keys are enabled automatically.
- Attachment files are written under per-user and per-snippet storage keys.

## Backups

Back up both the SQLite file and the attachment directory.

```bash
cp /srv/cache/cache.sqlite /srv/backups/cache-$(date +%Y%m%d).sqlite
rsync -av /srv/cache/attachments/ /srv/backups/attachments/
```

## Settings UI

Storage status appears in the app shell, but the backend remains fixed to SQLite plus local filesystem.

## CLI

Direct profiles support only `sqlite`:

```bash
cache init --name local --backend sqlite
cache storage get
cache storage set sqlite
```

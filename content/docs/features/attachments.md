# Attachments

Attachments keep supporting files next to snippets.

## Limits

| Limit | Value |
| --- | --- |
| Max file size | 5 MB |

## Supported MIME Types

- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`
- `application/pdf`
- `text/plain`
- `text/markdown`
- `text/csv`
- `application/json`

## Web Flow

When creating snippet in web UI:

1. Queue files in dropzone
2. Save snippet
3. App prepares upload
4. Browser uploads file to local upload route
5. App saves attachment metadata

For existing snippets, edit mode uploads immediately.

## CLI

```bash
cache attachment add <snippet-id> ./notes.md
cache attachment list <snippet-id>
cache attachment get <attachment-id> --output ./notes.md
cache attachment delete <attachment-id>
```

## API

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./notes.md" \
  http://localhost:3000/api/v1/snippets/<snippet-id>/attachments
```

Download:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/attachments/<attachment-id>/download \
  -o notes.md
```

## Storage

- Metadata lives in SQLite
- Binary content lives under attachment root on local filesystem
- Deleting snippet also deletes owned attachment files

## Good Uses

- Screenshots
- PDF docs
- Markdown notes
- JSON examples
- CSV fixtures

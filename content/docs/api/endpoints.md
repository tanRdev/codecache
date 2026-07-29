# API Endpoints Reference

All endpoints live under `/api/v1` unless noted.

## Auth

### `GET /auth/whoami`

Returns authenticated user id.

### `POST /auth/tokens`

Creates API token. Browser session required.

Request body:

```json
{
  "name": "CLI token"
}
```

### `GET /auth/browser-login`

Creates one-time browser-login exchange and redirects to localhost callback.

Query params:

- `callback`: required localhost callback URL
- `name`: optional token name

### `POST /auth/browser-login/exchange`

Consumes one-time code.

Request body:

```json
{
  "code": "exchange-code"
}
```

## Snippets

### `GET /snippets`

Query params:

- `query`
- repeated `tag`
- or comma-separated `tags`

### `POST /snippets`

Request body:

```json
{
  "title": "Example",
  "description": "Optional",
  "notes": "Optional",
  "language": "typescript",
  "code": "const x = 1;",
  "tags": ["typescript", "example"]
}
```

### `GET /snippets/:snippetId`

### `PATCH /snippets/:snippetId`

Body may include any subset of:

- `title`
- `description`
- `notes`
- `language`
- `code`
- `tags`

### `DELETE /snippets/:snippetId`

## Snippet Attachments

### `GET /snippets/:snippetId/attachments`

### `POST /snippets/:snippetId/attachments`

Multipart form upload with `file` and optional `mimeType`.

## Attachment Detail

### `GET /attachments/:attachmentId`

Returns blob download metadata.

### `DELETE /attachments/:attachmentId`

### `GET /attachments/:attachmentId/download`

Returns attachment bytes as download response.

## Storage

### `GET /storage`

Returns current storage settings.

### `POST /storage`

Only supported backend:

```json
{
  "backend": "sqlite"
}
```

## Health

Non-versioned endpoints:

- `GET /api/health`
- `GET /api/ready`

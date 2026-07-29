# Security

Cache has a straightforward security model: one owner, local data, and explicit API access.

## Authentication

### Owner Account

- One owner account per instance
- Owner creation is only allowed before an owner exists
- Sign-in uses email and password
- Password creation requires at least 12 characters
- Passwords are hashed with `scrypt`

### Sessions

- Session cookie name: `cache_session`
- `HttpOnly`
- `SameSite=Lax`
- `Secure` in production

### API Authentication

API requests can use either:

- A browser session cookie
- `Authorization: Bearer <token>`

## API Tokens

- Tokens use the `cache_pat_...` prefix
- Token values are hashed before SQLite storage
- `last_used_at` updates on successful authentication
- Token creation requires an authenticated browser session

## Remote CLI Login

Browser login creates a one-time exchange code for a localhost callback.

- Callback must be `http://127.0.0.1/...` or `http://localhost/...`
- Exchange payloads are encrypted with `ENCRYPTION_KEY`
- Exchange codes expire quickly and can only be consumed once

## Attachment Safety

- Max file size: 5 MB
- Allowed MIME types: JPEG, PNG, GIF, WebP, PDF, plain text, Markdown, CSV, JSON
- Upload routes validate MIME and content before saving
- Download routes return private, no-store responses

## Deployment Basics

- Keep the SQLite file and attachments on private persistent storage
- Use HTTPS in production
- Store secrets outside the repo
- Restrict permissions on the database, attachment directory, and env files

```bash
chmod 700 /srv/cache
chmod 600 /srv/cache/.env.local
chmod 600 /srv/cache/cache.sqlite
```

# API Authentication

Use browser session or bearer token.

## Bearer Token

```bash
curl -H "Authorization: Bearer cache_pat_..." \
  http://localhost:3000/api/v1/auth/whoami
```

Response:

```json
{
  "ok": true,
  "data": {
    "userId": "user-1"
  }
}
```

## Create API Token

Requires browser session:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"CLI token"}' \
  http://localhost:3000/api/v1/auth/tokens
```

## Browser Login Helpers for CLI

Start login redirect:

```bash
GET /api/v1/auth/browser-login?callback=http://127.0.0.1:4567/callback&name=CLI%20token
```

Exchange code:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"code":"exchange-code"}' \
  http://localhost:3000/api/v1/auth/browser-login/exchange
```

Callback must be localhost loopback URL.

# API Errors

Error shape usually follows:

```json
{
  "ok": false,
  "error": {
    "code": "validation_error",
    "message": "title is required",
    "details": null
  }
}
```

Some non-versioned attachment upload/download routes return simpler shape:

```json
{
  "error": "Upload session not found"
}
```

## Common Codes

| Code | Meaning |
| --- | --- |
| `unauthorized` | Missing or invalid session/token |
| `validation_error` | Request body, params, or upload invalid |
| `not_found` | Snippet, attachment, or upload session missing |
| `rate_limited` | In-memory rate limit exceeded |
| `internal_error` | Unexpected server error |
| `service_unavailable` | Readiness check failed |

## Common Cases

### Unauthorized

- Missing bearer token
- Invalid bearer token
- No browser session

### Validation error

- Missing snippet title or code
- Unsupported storage backend
- Missing upload file
- Invalid browser-login callback or code
- Attachment MIME not allowed
- Attachment exceeds 5 MB

### Not found

- Snippet belongs to another user
- Attachment belongs to another user
- Upload session expired or missing

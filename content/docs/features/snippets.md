# Snippet Management

Snippet management is the core workflow in Cache: create code records, edit them, tag them, attach supporting files, and retrieve them later.

## What a Snippet Contains

| Field | Required | Description |
| --- | --- | --- |
| **Title** | Yes | Descriptive name for the snippet |
| **Content** | Yes | The code or text content |
| **Language** | Usually detected | Programming language hint for display and search |
| **Tags** | No | Labels for organization |
| **Notes** | No | Additional context |
| **Attachments** | No | Related files |

## Creating Snippets

### Web App

1. Open the new snippet flow from the dashboard.
2. Enter a title.
3. Paste or type code.
4. Add optional tags and notes.
5. Save the snippet.

### CLI

```bash
cache add ./utils.ts --title "Utility Functions" --tag typescript --tag utils
cat ./script.sh | cache add - --title "Deploy Script" --tag bash
```

### API

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Array deduplication",
    "code": "const unique = [...new Set(array)];",
    "language": "javascript",
    "tags": ["javascript", "array"],
    "notes": "Fast way to remove duplicates"
  }' \
  https://cache.example.com/api/v1/snippets
```

## Editing Snippets

### Web Editing

Use the snippet detail screen or modal to update fields such as title, description, notes, language, code, tags, and attachments.

### CLI Editing

```bash
cache snippet update snip_abc123 --title "New Title"
cache snippet update snip_abc123 --tag new-tag
cache snippet update snip_abc123 ./updated.ts --language typescript
```

Passing `--tag` or `--tags` replaces the snippet's tag set. Omit both flags to
leave existing tags unchanged.

## Language Detection

Cache infers language from the file extension. If detection is wrong, set the
language explicitly with `--language` or use the web app.

## Workflow Tips

1. Save reusable code as soon as you know you will need it again.
2. Add tags for language, purpose, and project context.
3. Use notes to capture why the snippet exists.
4. Attach screenshots, markdown notes, or example payloads when context matters.

## Limits

| Limit | Value |
| --- | --- |
| Title length | 200 characters |
| Content size | 1 MB |
| Tags per snippet | 20 |
| Tag length | 50 characters |
| Notes length | 10,000 characters |
| Attachment size | 5 MB each |

## Troubleshooting

### Snippet Won't Save

- Check that title and code are present.
- Verify the active Cache instance is healthy.
- Review field validation messages in the UI or API response.

### Can't Find a Saved Snippet

- Re-run the search with simpler terms.
- Check tags and filters.
- Confirm you are connected to the expected Cache library.

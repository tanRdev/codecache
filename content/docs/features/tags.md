# Tags

Tags are the primary way to organize snippets in Cache. They keep one snippet discoverable from multiple contexts without forcing a folder hierarchy.

## Overview

Tags are labels you apply to snippets for categorization. A single snippet can have multiple tags.

### Tag Examples

A React authentication snippet might have tags such as:

```text
react, auth, typescript, hooks, jwt, frontend
```

## Using Tags

### Adding Tags

**Web App:**

1. Open a snippet.
2. Add tags in the tag input.
3. Save the snippet.

**CLI:**

```bash
cache add ./auth.ts --tag react --tag auth --tag typescript
cache snippet update snip_abc123 --tag jwt --tag hooks
```

**API:**

```bash
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["react", "auth", "typescript"]}' \
  https://cache.example.com/api/v1/snippets/snip_abc123
```

### Replacing or removing tags

```bash
cache snippet update snip_abc123 --tags react,typescript
cache snippet update snip_abc123 --tags ""
```

Update commands replace the complete tag set whenever `--tag` or `--tags` is
present. The empty `--tags` value removes every tag.

## Conventions

### Recommended Tag Taxonomy

```text
Language: javascript, typescript, python, rust, go
Framework: react, nextjs, express, fastapi
Purpose: auth, validation, utils, config, testing, deploy
Context: work, personal, learning, reference
Type: function, class, interface, query, script
```

### Naming Best Practices

- Use lowercase names.
- Prefer hyphenated tags when needed.
- Keep them short and specific.
- Avoid duplicates such as `js` and `javascript`.

## Filtering by Tags

### Web App

Use the dashboard filters and visible tags to narrow the result set.

### CLI

```bash
cache search "" --tags react
cache search "auth" --tags react
```

## Tag Statistics

```bash
cache search "" --format json | jq -r '.[].tags[]?' | sort | uniq -c | sort -rn
```

## Troubleshooting

### Tag Not Applying

1. Keep tag names short and URL-safe.
2. Save the snippet after editing tags.
3. Confirm the app instance is running normally.

### Tagged Snippet Not Showing Up

1. Re-run the query.
2. Verify spelling.
3. Confirm you are using the expected Cache instance.

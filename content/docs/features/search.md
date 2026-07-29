# Search

Find the code you need without leaving the app, terminal, or HTTP client. Cache exposes the same searchable library across all three interfaces.

## Overview

Cache searches:

- Snippet titles
- Code content
- Tags
- Notes
- Language identifiers
- Descriptions

## Search in the Web App

### Basic Search

1. Open the dashboard search input.
2. Type a query.
3. Review the filtered results.

The dashboard updates immediately as you type.

### Combining Search Terms

Multiple words narrow the result set:

```text
auth middleware typescript
```

## Search in the CLI

### Basic Search

```bash
# Search for a term
cache search "auth middleware"

# Search with filters
cache search "typescript" --tags react,hooks

# JSON output for scripting
cache search "deploy" --format json
```

### Search Options

| Flag | Description | Example |
| --- | --- | --- |
| `--tag` | Filter by a tag; repeat for more | `--tag auth --tag jwt` |
| `--tags` | Filter by tags (comma-separated) | `--tags auth,jwt` |
| `--format` | Output format | `--format jsonl` |

## Search via API

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://cache.example.com/api/v1/snippets?query=auth+middleware&tag=typescript"
```

## Search Tips

### Finding Recently Used Snippets

```bash
cache search "" --format json | jq 'sort_by(.updated_at) | reverse'
```

### Discovering Untagged Patterns

```bash
cache search "" --format json | jq -r '.[].tags[]?' | sort | uniq -c
```

### Exporting Search Results

```bash
cache search "typescript" --format json > typescript-snippets.json
```

## Troubleshooting

### No Results Found

1. Check spelling.
2. Try a simpler term.
3. Clear filters.
4. Make sure the current browser session or CLI profile points at the expected Cache instance.

### Slow Search

1. Use more specific search terms.
2. Add a tag filter.
3. Confirm the underlying app instance is healthy.

### Results Not Updating

1. Refresh the page or retry the command.
2. Confirm you are using the expected data source.
3. Re-open the snippet to verify the latest saved content.

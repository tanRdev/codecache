# Dashboard

The dashboard is the main authenticated view for browsing, searching, and opening snippets.

## What You See

```text
┌─────────────────────────────────────────────────────────────┐
│ Search [____________________]         [+ New Snippet]      │
├─────────────────────────────────────────────────────────────┤
│ Tag filters / metadata                                   │
├─────────────────────────────────────────────────────────────┤
│ Snippet list                                              │
│ - title                                                   │
│ - language                                                │
│ - tags                                                    │
│ - summary metadata                                        │
└─────────────────────────────────────────────────────────────┘
```

## Search

The search bar queries:

- Snippet titles
- Code content
- Tags
- Notes

Type a query to narrow the list immediately. Use the visible tags and snippet metadata to refine what you open next.

## Snippet List

Each row or card in the list gives you enough context to decide whether to open the snippet.

- **Title**: Open the snippet detail view
- **Language**: Quick signal for syntax and context
- **Tags**: Organization and filtering hints
- **Dates and attachment state**: Basic operational metadata

## Navigation

Use the dashboard as the quick way into deeper snippet editing. Once you know which snippet you need, open it and continue from the detail surface.

## Empty States

**No snippets yet:**

```text
┌─────────────────────────────────────────┐
│           No snippets yet               │
│                                         │
│   Create your first snippet to get      │
│   started.                              │
└─────────────────────────────────────────┘
```

**No search results:**

```text
┌─────────────────────────────────────────┐
│        No matches found                 │
│                                         │
│   Try adjusting your search terms       │
│   or filters.                           │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Search Not Working

1. Check that snippets exist in the current library.
2. Clear filters and retry a simple query.
3. Confirm you are signed into the expected Cache instance.

### Slow Loading

1. Check the health of the local or self-hosted app.
2. Large libraries may take longer to render.
3. Use search terms or tags to reduce the visible result set.

# Snippet Management

Snippet UI supports create, edit, tag, attach, download, and delete flows.

## Create

From new snippet page:

1. Paste code
2. Click save
3. Fill title if prompted
4. Optional: add description, notes, tags
5. Optional: queue attachments before save

Queued attachments upload after snippet is created.

## Edit

Snippet detail modal supports:

- title edits
- description edits
- language selection
- code edits
- notes edits
- tag add/remove
- immediate attachment upload in edit mode

## Attachments

Web UI supports these file types:

- JPEG
- PNG
- GIF
- WebP
- PDF
- plain text
- Markdown
- CSV
- JSON

Max file size is 5 MB.

Downloads use local authenticated download routes.

## Delete

Deleting snippet also deletes owned attachment records and local files.

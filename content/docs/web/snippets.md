# Snippet Management

Snippet UI supports create, edit, tag, attach, download, and delete flows.

## Create

From the **New** dialog on the dashboard (or the direct `/snippets/new` page):

1. Enter a title
2. Paste or type code
3. Optional: add description, notes, tags
4. Optional: queue attachments before save
5. Select **Save**

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
- SVG
- HTML
- CSS
- JavaScript

Max file size is 5 MB.

Attachment **View** and **Download** actions use authenticated file routes, so
files never need a public URL. Safe images, PDFs, and text formats can open in
the browser; active formats such as HTML and SVG always download.

## Delete

Delete actions ask for confirmation. Deleting a snippet also deletes its owned
attachment records and local files.

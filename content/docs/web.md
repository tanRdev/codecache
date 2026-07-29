# Web Interface

The Cache web app gives you a visual way to browse, search, create, and edit snippets while keeping the same data model used by the CLI and API.

## Interface Overview

The web interface is organized into several main areas:

### Navigation Structure

```
┌──────────────┬──────────────────────────────────────────┐
│ Cache        │ Library                         [+ New]  │
│ Dashboard    │ Search snippets...                       │
│              │ Tag filters                              │
│              │                                          │
│              │ Snippet table                            │
│ SQLite ready │                                          │
│ Sign out     │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Dashboard** | `/dashboard` | Browse, search, and filter all snippets |
| **Snippet Detail** | `/snippets/:id` | View, edit, and organize a specific snippet |
| **Documentation** | `/docs` | Built-in documentation (you are here) |
| **Owner setup** | `/setup` | Initialize the single owner account |
| **Sign in** | `/sign-in` | Open an existing local or self-hosted library |

### Design Principles

The web interface follows these design principles:

- **Dark-first aesthetic**: Ink-black surfaces, restrained typography, signal-yellow accents
- **Developer-centric**: Syntax highlighting and a code-first layout
- **Efficiency**: Minimal clicks to accomplish tasks
- **Context preservation**: Edit without losing your place
- **Instant feedback**: Debounced search and clear save states

## Accessing the Web Interface

### Local Development

When running locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production

Access your own running Cache app:

```
https://your-cache-instance.com
```

In landing-only mode, the deployed site serves documentation and marketing
pages only. The full web interface still runs on a local or self-hosted Cache
app.

### Authentication

- **Local/self-hosted app**: Sign in with owner email and password
- **Landing-page deploy**: No snippet login on deployed site

## Quick Start

### 1. Browse Your Snippets

Navigate to the **Dashboard** to see all your snippets:

- Snippets are displayed in a scrollable list
- Each snippet shows title, tags, language, and preview
- Click any snippet to view details

### 2. Search and Filter

Use the search bar at the top:

- **Text search**: Type to search titles, content, and tags
- **Tag filter**: Click tags to filter by category
- **Language matching**: Search by a language name such as `typescript`

### 3. Create a Snippet

Click **New**:

1. Enter a title
2. Paste or type your code
3. Add optional description, tags, and notes
4. Queue optional attachments
5. Click **Save**

### 4. Edit a Snippet

Click any snippet to open the detail view:

- Select **Edit**
- Update the title, description, language, or code
- Add or remove tags
- Update notes
- Select **Save changes** when ready

Dialogs support the standard `Esc` close behavior. Tag inputs accept `Enter` to
commit the current tag.

## Documentation Sections

Explore detailed web interface documentation:

- [Dashboard](/docs/web/dashboard) – Browse, search, and organize snippets
- [Snippets](/docs/web/snippets) – Create, edit, and manage individual snippets
- [Configuration](/docs/web/settings) – See which settings are managed outside the app

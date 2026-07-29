# Web Interface

The Cache web app gives you a visual way to browse, search, create, and edit snippets while keeping the same data model used by the CLI and API.

## Interface Overview

The web interface is organized into several main areas:

### Navigation Structure

```
┌─────────────────────────────────────────────────────────┐
│  Cache        Dashboard  Snippets  Settings  [Profile] │  ← Header
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Sidebar]              │  Main Content Area            │
│  - Quick filters        │                               │
│  - Tags                 │                               │
│  - Recent               │                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Dashboard** | `/dashboard` | Browse, search, and filter all snippets |
| **Snippet Detail** | `/snippets/:id` | View, edit, and organize a specific snippet |
| **Settings** | `/settings` | Configure storage and account access |
| **Documentation** | `/docs` | Built-in documentation (you are here) |

### Design Principles

The web interface follows these design principles:

- **Dark-first aesthetic**: Monospace typography, dark surfaces, orange accents
- **Developer-centric**: Keyboard shortcuts, syntax highlighting, code-first layout
- **Efficiency**: Minimal clicks to accomplish tasks
- **Context preservation**: Edit without losing your place
- **Instant feedback**: Real-time search, immediate saves

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
- **Language filter**: Filter by programming language

### 3. Create a Snippet

Click **"New Snippet"** or press `Ctrl+N`:

1. Enter a title
2. Paste or type your code
3. Add tags (comma-separated)
4. Add optional notes
5. Click **Save**

### 4. Edit a Snippet

Click any snippet to open the detail view:

- Edit title inline by clicking it
- Click the code editor to modify content
- Add or remove tags
- Update notes
- Changes save automatically

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open command palette / search |
| `Ctrl/Cmd + N` | Create new snippet |
| `Ctrl/Cmd + S` | Save current snippet |
| `Ctrl/Cmd + F` | Focus search |
| `Esc` | Close modals, cancel editing |
| `?` | Show keyboard shortcuts help |

## Documentation Sections

Explore detailed web interface documentation:

- [Dashboard](/docs/web/dashboard) – Browse, search, and organize snippets
- [Snippets](/docs/web/snippets) – Create, edit, and manage individual snippets
- [Settings](/docs/web/settings) – Configure storage and account preferences

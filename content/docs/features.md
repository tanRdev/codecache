# Features

Cache focuses on a small, reliable self-hosted snippet workflow.

## Core Features

| Feature | Description | Interfaces |
| --- | --- | --- |
| Snippet management | Create, edit, delete, organize snippets | Web, CLI, API |
| Search | Search by text and tags | Web, CLI, API |
| Tags | Flexible tag-based organization | Web, CLI, API |
| Attachments | Store related files next to snippets | Web, CLI, API |
| SQLite-only storage | Single backend for app data | All |
| Owner auth | One local owner account per instance | Web, API |
| Remote CLI auth | Browser login and bearer tokens for server access | CLI, API |
| Landing-page deploy | Optional docs and marketing site separate from app UI | Web |

## Storage Model

- Snippets, sessions, and API tokens live in SQLite
- Attachments live on local filesystem
- No hosted backend switching
- No billing gates
- No AI providers or provider-key setup

## Feature Guides

- [Snippets](/docs/features/snippets)
- [Attachments](/docs/features/attachments)
- [Search](/docs/features/search)
- [Tags](/docs/features/tags)
- [Storage](/docs/features/storage)
- [Security](/docs/features/security)

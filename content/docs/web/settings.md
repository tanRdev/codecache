# Configuration

Cache intentionally keeps deployment configuration outside the browser app.
There is no `/settings` screen in the current release.

What you can manage today:

- SQLite path and attachment root through environment variables
- owner setup through `/setup`
- owner sign-in through `/sign-in`
- remote CLI access through the browser-based `cache auth login` flow
- API tokens through authenticated API endpoints for automation

Storage remains fixed to SQLite plus local filesystem. Backend switching is not available.

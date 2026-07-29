# CLI Reference

The Cache CLI works in two modes.

- Direct mode: local profile backed by the SQLite adapter
- Remote mode: HTTP calls to a running Cache server

## Start

```bash
cache
```

Interactive shell supports `/help`, `/status`, `/login`, snippet commands, attachment commands.

## Profiles

### Direct profile

```bash
cache init --name local --backend sqlite
```

### Remote profile

```bash
cache auth login --name server --base-url http://localhost:3000
```

## Common Commands

```bash
cache profile list
cache profile use local
cache add ./file.ts --title "Example" --tag typescript
cache search auth
cache get <snippet-id>
cache snippet update <snippet-id> ./updated.ts --title "Updated"
cache rm <snippet-id>
cache attachment add <snippet-id> ./notes.md
cache attachment list <snippet-id>
cache attachment get <attachment-id> --output ./notes.md
cache attachment delete <attachment-id>
cache storage get
cache storage set sqlite
```

Run `npm run cache` instead when working from a source checkout.

See detailed pages:

- [Commands](/docs/cli/commands)
- [Configuration](/docs/cli/configuration)
- [Authentication](/docs/cli/authentication)

# CLI Commands Reference

## Profile

### `cache init`

Create direct sqlite profile.

```bash
cache init
cache init --name work --database /absolute/path/to/work.sqlite
```

### `cache profile list`

```bash
cache profile list
```

### `cache profile use <name>`

```bash
cache profile use local
```

## Auth

### `cache auth login`

Remote profile login. Uses browser flow in interactive TTY, or manual token flags.

```bash
cache auth login --name server --base-url http://localhost:3000
cache auth login --name server --base-url http://localhost:3000 --token <token>
```

### `cache auth whoami`

```bash
cache auth whoami
```

### `cache auth logout`

```bash
cache auth logout
```

## Snippets

### Create

```bash
cache add ./file.ts --title "Example" --tag typescript
cache snippet create ./file.ts --title "Example" --tag typescript
```

### Search

```bash
cache search auth
cache snippet list auth --tags api,typescript
```

### Get

```bash
cache get <snippet-id>
cache snippet get <snippet-id>
```

### Update

```bash
cache snippet update <snippet-id> ./updated.ts --title "Updated title"
```

### Delete

```bash
cache rm <snippet-id>
cache snippet delete <snippet-id>
```

## Attachments

### Add

```bash
cache attachment add <snippet-id> ./notes.md
```

### List

```bash
cache attachment list <snippet-id>
```

### Download

```bash
cache attachment get <attachment-id> --output ./notes.md
```

### Delete

```bash
cache attachment delete <attachment-id>
```

## Storage

```bash
cache storage get
cache storage set sqlite
cache storage validate
```

Only `sqlite` supported in direct mode.

## Output

```bash
cache profile list --format human
cache profile list --format json
cache search auth --format jsonl
```

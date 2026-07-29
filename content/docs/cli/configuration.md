# CLI Configuration

CLI stores profiles in local config directory.

## Config Location

- macOS: `~/Library/Application Support/Cache/profiles.json`
- Linux: `${XDG_CONFIG_HOME:-~/.config}/cache/profiles.json`
- Windows: `%LOCALAPPDATA%\Cache\profiles.json`
- Override: `CACHE_CLI_CONFIG_DIR=/custom/path`

## Profile Types

### Direct profile

```json
{
  "name": "local",
  "mode": "direct",
  "backend": "sqlite",
  "databasePath": "/Users/you/Library/Application Support/Cache/local.sqlite",
  "userId": "user-123"
}
```

### Remote profile

```json
{
  "name": "server",
  "mode": "remote",
  "appUrl": "http://localhost:3000",
  "token": "[stored token]"
}
```

## Create Profiles

```bash
cache init --name local
cache init --name work --database /absolute/path/to/work.sqlite
cache auth login --name server --base-url http://localhost:3000
```

## Useful Environment Variables

| Variable | Purpose |
| --- | --- |
| `CACHE_CLI_CONFIG_DIR` | Override CLI config directory |
| `NEXT_PUBLIC_APP_URL` | Default app URL fallback for interactive remote login |

## Notes

- Direct profiles only support `sqlite`.
- Direct profiles choose an OS-appropriate database path automatically.
- The profile file is written atomically with owner-only permissions.
- Remote profiles store normalized `appUrl` and token.
- Switching profile changes active runtime for later commands.

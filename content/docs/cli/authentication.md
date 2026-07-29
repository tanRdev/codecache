# CLI Authentication

CLI authentication only matters for remote profiles.

## Browser Login Flow

```bash
cache auth login --name server --base-url http://localhost:3000
```

Flow:

1. CLI starts localhost callback server
2. CLI prints browser login URL
3. You open URL in browser
4. Server redirects back with one-time code
5. CLI exchanges code for API token
6. CLI stores remote profile token

## Manual Token Login

```bash
cache auth login --name server --base-url http://localhost:3000 --token <token>
```

## Who Am I

```bash
cache auth whoami
```

Remote mode returns server-side profile info. Direct mode returns local profile identity.

## Logout

```bash
cache auth logout
```

Removes active profile from local CLI config.

## Security Notes

- Browser login callback must be localhost loopback URL
- Browser-login exchange requires server `ENCRYPTION_KEY`
- API tokens are bearer tokens; protect them like passwords

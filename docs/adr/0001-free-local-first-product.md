# Keep Cache free, local-first, and in one canonical repository

Cache is a free product whose canonical repository contains the CLI, browser
app, API, documentation, and marketing site. Users provide their own machine,
storage, and optional self-hosted runtime; Cache does not sell subscriptions or
operate managed user storage. The older public CLI-only repository is a
transition path, not a second product, because maintaining two implementations
created incompatible database schemas and made the public install story
unreliable.

## Consequences

- Billing, paid plans, and managed multi-tenant hosting are outside the product
  boundary.
- The CLI and browser app must use the same core services and storage model.
- Public releases, documentation, and install commands must point to artifacts
  built from the canonical repository.
- The marketing site may be hosted independently, but it must not expose the
  private application routes or imply that user data is hosted for them.

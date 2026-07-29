# Contributing

Thanks for taking the time to review or contribute to Cache.

## Before You Open a Pull Request

1. Read the current README and docs so the proposed change matches the shipped product.
2. Keep changes scoped. This repo is already active, so unrelated cleanup should be separate.
3. Prefer the smallest correct change over a broad refactor.

## Development Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Create the required secrets in `.env.local`, then open `http://localhost:3000/setup` to create the first owner account.

## Quality Gates

Run the strongest relevant checks before asking for review:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Or run everything together:

```bash
npm run verify
```

## Pull Request Expectations

- Explain the user-facing change clearly.
- Call out any behavior changes or docs updates.
- Include screenshots for landing page, docs, or other public UI changes when helpful.
- Avoid bundling unrelated cleanup into the same PR.

## Documentation

If you change setup, CLI, API, or public UI behavior, update the relevant docs in `content/docs/` and the README in the same change.

## Conduct

Participation in this repository is governed by [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

# Adoption Playbook (Pointer Mode)

Use this checklist when onboarding a consumer repo to the governance pack.

## Canonical-only policy (required)

In consumer repos, **only the stub files** are allowed:

- `AGENTS.md`
- `CODESTYLE.md`
- `SECURITY.md`
- `docs/GOVERNANCE.md` (generated stub from pointer mode)
- `.agentic-governance/**`

All canonical governance content must live in the npm package under:

- `node_modules/@brainwav/brainwav-agentic-governance/brainwav/governance/**`

Pointer mode enforces this rule: it forbids canonical governance directories or doc copies outside `.agentic-governance/overlays/` and `node_modules`.

## One-time install (recommended)

```bash
pnpm add -D @brainwav/brainwav-agentic-governance@<version>
pnpm exec brainwav-governance install --root . --mode pointer --profile delivery
pnpm exec brainwav-governance validate --root . --strict
```

## Upgrade flow

```bash
pnpm exec brainwav-governance upgrade --root .
pnpm exec brainwav-governance validate --root . --strict
```

## What to commit

- The stub files listed above
- `.agentic-governance/**`
- Any pack-specific overlays under `.agentic-governance/overlays/`

Do not commit canonical governance docs into the consumer repo.

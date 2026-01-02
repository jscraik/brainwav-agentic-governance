# Gold Standard Checklist (CI Contract)

This page defines what is **enforced in CI**, what is **advisory**, and what is **local-only** for the gold standard baseline (**as-of 2026-01-31**).

## Enforced in CI (hard fail)

- Governance validation (`pnpm exec brainwav-governance validate --strict`)
- Hash drift check (either included in validate or run `pnpm exec brainwav-governance sync-hashes --check`)
- Docs validation (repo command; may be pack-scoped)
- AGENTS integrity (`pnpm exec brainwav-governance validate-agents --strict` if enabled)
- Security scans (pack-scoped enforcement; release profile must pass required scanners)
- SBOM generation (CycloneDX) when required by change class / release profile

## Advisory (warnings)

- Coverage thresholds beyond required baseline
- Mutation score targets
- Non-blocking policy warnings in docs or governance checks

## Local-only (doctor output)

- Toolchain readiness checks for the active profile (release is strictest)
- Local environment readiness gaps

## Related docs

- `brainwav/governance/90-infra/compat.json`
- `brainwav/governance/docs/testing-qa.md`
- `AGENTS.md`

# Gold Standard Checklist (CI Contract)

This page defines what is **enforced in CI**, what is **advisory**, and what is **local-only** when operating at the gold standard baseline (Dec 31, 2025 / Jan 1, 2026).

## Enforced in CI (hard fail)

- Governance validation (`brainwav-governance validate --strict`)
- Hash drift check (`governance:sync-hashes:check`)
- Docs validation (`docs:validate`)
- AGENTS integrity (`governance:validate-agents`)
- Security scans (Semgrep, gitleaks, OSV)
- SBOM generation (CycloneDX)

## Advisory (warnings)

- Coverage thresholds beyond required baseline
- Mutation score targets
- Non-blocking policy warnings in docs or governance checks

## Local-only (doctor output)

- Toolchain version checks for release profile
- Local environment readiness gaps

## Related docs

- `brainwav/governance/90-infra/compat.json`
- `brainwav/governance/docs/testing-qa.md`
- `AGENTS.md`

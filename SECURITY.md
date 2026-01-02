# Security Policy

This repository defines governance rules and tooling that influence security‑critical systems. This document is the single entrypoint for how we handle security and vulnerability reporting.

---

## Standards & References (Jan 2026)

Pinned versions live in `brainwav/governance/90-infra/standards.versions.json` and are the source of truth. Updates must be followed by `pnpm governance:sync-hashes`.

We align to:

- OWASP Top 10:2025
- OWASP ASVS 5.0.0
- OWASP LLM Top 10 (2025 v1.1)
- NIST SSDF 1.1
- NIST AI RMF + GenAI Profile
- WCAG 2.2 (ISO/IEC 40500:2025)
- ISO/IEC 42001:2023
- SLSA v1.2, CycloneDX 1.7, SPDX 3.0.1, Sigstore Cosign

---

## Scope

In scope:
- Governance documentation and tooling in this repo
- CI/CD workflows and release processes

Out of scope:
- Vulnerabilities in external services (report to the vendor)
- Runtime systems in downstream projects (report to those projects)

---

## Reporting a Vulnerability

**Do not open public issues for security problems.**

1. Use GitHub’s “Report a vulnerability” flow (Security tab).
2. If GitHub is unavailable, contact the repository owner directly.

Include: impact, repro steps, affected versions, and any mitigations.

---

## Response Expectations

- Critical issues are triaged immediately.
- Fixes target the latest `main` release; no backports.

For additional governance context, see `AGENTS.md` and `brainwav/governance/00-core/llm-threat-controls.md`.

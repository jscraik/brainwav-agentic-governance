---
trigger: always_on
alwaysApply: true
---
# brAInwav Rules of AI -> AGENT_CHARTER.md

**Status**: CONSOLIDATED (stub only; not in governance precedence)  
**Canonical Location**: `governance/00-core/AGENT_CHARTER.md` -> **AI BEHAVIORAL RULES**  
**Last Updated**: 2025-12-04

This file is intentionally a **redirect stub**.

## Policy

- Do **not** duplicate AI behavior or governance policy text in consumer repositories.
- In pointer mode, consumer repos should contain only:
  - root stubs: `AGENTS.md`, `CODESTYLE.md`, `SECURITY.md`, `docs/GOVERNANCE.md`
  - `.agentic-governance/**` (including `.agentic-governance/overlays/**`)
- Any repo-specific additions must be **additive overlays** under `.agentic-governance/overlays/` (never edits to the canonical charter).

If you need to propose changes, open a PR against the canonical governance pack instead of editing local copies.

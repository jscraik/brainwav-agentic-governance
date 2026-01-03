---
trigger: always_on
alwaysApply: true
---
# brAInwav Agentic Governance Constitution

**Version**: 1.5.0  
**Ratified**: 2025-10-08  
**Last Amended**: 2025-12-03  
**Maintainer**: brAInwav Development Team

---

## Purpose

This constitution defines the **foundational principles** that govern all AI-assisted development. It complements and extends the consolidated `AGENT_CHARTER.md` (Rules of AI) and `CODESTYLE.md` with project-specific governance for feature development, agent behavior, and quality standards. It is part of the **Governance Pack** and is **binding** on all projects adopting this framework.

---

## Table of Contents

- [Purpose](#purpose)
- [I. Core Principles](#i-core-principles)
- [II. Development Workflow (Phases & HITL)](#ii-development-workflow-phases--hitl)
- [III. Quality Standards](#iii-quality-standards)
- [IV. Feature Development Standards](#iv-feature-development-standards)
- [V. Compliance & Governance](#v-compliance--governance)
- [V.1 Project-Specific Governance](#v1-project-specific-governance)
- [VI. Amendment Process](#vi-amendment-process)
- [VII. Enforcement](#vii-enforcement)

---

## I. Core Principles

### 1. Gold Production Standards (NON-NEGOTIABLE)

**No Mock Production Claims**: Never describe any implementation as "production-ready", "complete", "operational", or "fully implemented" if it contains any of the following in production paths:

- `Math.random()` or fabricated data
- Hardcoded mocks or placeholder adapters ("will be wired later")
- `TODO`/`FIXME`/`HACK`, or `console.warn("not implemented")`
- Fake metrics/telemetry

**Service Identity Logging**: All system outputs, error messages, health checks, and status logs **must** include a service identifier (`"[<service>]"` prefix and `service:"<service_name>"` in structured logs). A `brand:"<org>"` field is optional and may be required by overlays.

**Evidence-Based Status**: Status claims must be verified against passing gates and attached evidence.

**Type Safety & Style (prod paths)**: No `any` in TS, **named exports only**, max **40 lines per function**, guard clauses, strict boundary types, `async/await` with **cancellation** (`AbortSignal` or SDK equivalent).

**Domain Boundaries**: No cross-domain imports; interact via declared contracts (A2A topics, MCP tools/resources/prompts).

### 1.1 Canonical Governance Distribution (Pointer Mode)

**Canonical source of truth** for governance policy is the published governance package. Consumer repos must not copy or fork canonical governance docs.

**Allowed in consumer repos (pointer mode):**
- Root stubs: `AGENTS.md`, `CODESTYLE.md`, `SECURITY.md`, `docs/GOVERNANCE.md`
- `.agentic-governance/**` (including `.agentic-governance/overlays/**`)

**Forbidden in consumer repos (pointer mode):**
- Any copied canonical governance trees (e.g., `00-core/`, `10-flow/`, `20-checklists/`, `30-compliance/`, `90-infra/`, or `brainwav/governance/**`)
- Any duplicated canonical governance docs outside overlays

**Repo-specific additions** must be additive overlays under `.agentic-governance/overlays/` (never edits to canonical policy text).

### 2. Test-Driven Development (MANDATORY)

**Red–Green–Refactor**:

1) Write failing tests first  
2) Implement minimal pass  
3) Refactor while staying green

**Coverage Requirements**: ≥ **90% global**, ≥ **95% changed lines**; mutation ≥ **90%** where enabled. TDD plan stored per task.

### 3. Accessibility First (WCAG 2.2 AA)

Semantic HTML/ARIA, keyboard complete, target ≥ 44×44 CSS px, screen-reader coverage via `jest-axe`/axe/Playwright a11y.
**Normative reference**: **WCAG 2.2 AA (ISO/IEC 40500:2025)**.

### 4. Monorepo Integrity

Monorepo-specific rules are **pack-scoped**. Enable the appropriate monorepo pack (e.g., `pack:monorepo` / `pack:nx`) to enforce affected-only targets, dependency boundaries, and workspace rules.

Core governance remains project-neutral; do not hardcode monorepo assumptions into core policy.

### 5. Agent-First Architecture

**MCP** for external tools (contracts with Zod; audited via MCP audit events).  
**A2A** for inter-agent comms (event envelopes; no direct cross-domain imports).  
**Memory Adapter** for persistent context with adapter-defined API parity (see §II.3 & §III Documentation).

**Structured Outputs (REQUIRED)**: Any model output that drives code/files/network **must** be produced via **function/tool calling** or **JSON‑Schema–enforced structured outputs**. Free‑text is prohibited for machine‑consumed steps.

**Research Connector Surface**: The connector manifest defined by adapters (e.g., `config/connectors.manifest.json`) is the canonical semantic-knowledge interface. Agents must route fact-finding and entity enrichment through configured connectors unless the Constitution grants an explicit waiver.

**Academic Research Integration**: Agents must enhance implementation plans with academic research from multiple sources via configured connectors **and validate licenses** before oversight submission, per the Cortex-Aegis policy, when required by profile/change class.

### 6. Security by Default

- Semgrep (**block ERROR**), gitleaks (**block ANY**), OSV clean (when required by profile/change class)  
- **SBOM (CycloneDX)** (when required by profile/change class)  
- **Provenance (SLSA)** (when required by profile/change class)  
- **Sign & verify with Cosign bundle** artifacts (when required by profile/change class)  
- Minimal/pinned containers (non‑root, read‑only FS, drop caps)  
- **No secrets in code**. Use shared env loader (`scripts/utils/dotenv-loader.mjs` or `@governance/utils`) — **never call `dotenv.config()` directly**.  
- Secrets are retrieved **on demand** via an approved secret‑manager CLI (adapter-defined); never persisted in repo or long‑lived env vars.

### 7. Time Freshness Guard

All reasoning anchored to harness "today"; convert relative dates to **ISO-8601**; treat "latest/current" as freshness checks. (See `10-flow/cortex-aegis.md` § Time Freshness Policy.)

### 8. Hybrid Model Solution — Live/Recorded Inputs (Profile-Driven)

**Release profile (required):** production embeddings/rerank/generation must use **live** engines *or* verifiably recorded, time-stamped inputs with explicit model/engine identifiers and time-freshness evidence.

**Delivery profile (recommended):** prefer live; allow recorded inputs for deterministic CI/evals when explicitly documented and linked to evidence.

**Creative profile (allowed):** prototyping may use recorded inputs, but must not claim production readiness until promoted through delivery/release checks with evidence.

**Evidence:** attach model health output (engine, model IDs, vector dims/norms, latency) and the time-freshness record when required by profile/change class.

### 9. Governance Hooks (AGENTS.md + Aegis Oversight)

Agents must load the nearest `AGENTS.md` and record its SHA (`AGENTS_MD_SHA:<sha>`) in run state and logs. Agents must call **Cortex-Aegis** (`cortex_aegis_validate`) after planning and **before** file writes/network calls/long runs; logs must include `AEGIS_VALIDATE:OK`.

### 10. Observability & Trace Context (NORMATIVE)

All charter-governed logs are structured JSON and include: ISO‑8601 timestamp, `[<service>]` prefix, `service:"<service_name>"`, **W3C Trace Context** correlation (`traceparent` header value) and `trace_id`/`span_id` fields for **OpenTelemetry** correlation. A `brand` field is optional and may be required by overlays.

### 11. Identity & Secrets (Federated)

CI workflows and long‑lived services **must** use **OIDC/WIF** to cloud providers (AWS/Azure/GCP). Static long‑lived credentials are prohibited. Secret material is injected at runtime via approved secret‑manager references.

---

## II. Development Workflow (Phases & HITL)

### Phase Machine (R → G → F → REVIEW) — HITL Only at REVIEW

- **R (Red)**: Write failing tests; plan minimal pass. No `human_input` (except **Ask‑First ≤3** clarifications in G0/G1). Auto‑advance to **G** once new failing tests then pass on next commit and time‑freshness evidence is logged.
- **G (Green)**: Implement to pass; run security scans and model health checks when required by profile/change class. No `human_input`. Auto‑advance to **F** when tests pass and profile/change‑class gates are met.
- **F (Finished)**: Refactor, docs, a11y, SBOM/provenance, structure guard. No `human_input`. Auto‑advance to **REVIEW** when required a11y/scanner/supply‑chain/model‑health evidence is attached.
- **REVIEW**: **HITL permitted**; complete Code Review Checklist; approvals/waivers per Constitution.

**Forbidden**: Any `human_input` before REVIEW is a policy violation (aside from the Ask‑First G0/G1 allowance).

**Canonical details** (tokens, artifacts, CI mapping) are defined in:  
`brainwav/governance/10-flow/agentic-coding-workflow.md` (§4.4 Phase Machine, §6.1 Hard Rules, §6.2 Evidence Tokens).

### Evidence Tokens (CI-Scanned)

---

## III. Quality Standards

### Code Quality

ESLint/Biome/ast-grep; Python Ruff; Rust Clippy; no `console.log` in prod paths; deterministic outputs; structured logs with service identity + request/run IDs (brand optional); **OTel traces/logs/metrics with correlation**.

### Testing Requirements

Repo-standard test frameworks (e.g., Vitest, pytest); property-based for critical code; mutation testing where enabled. a11y tests via adapter tooling.

### Documentation

Each package requires README with purpose, setup, API, examples, service identity notes.  
Per-task artifacts stored under `~/tasks/[feature]/`.  
**Memory Adapter parity**: decisions/rationales appended to `.github/instructions/memories.instructions.md` **and** persisted via the configured Memory Adapter API.

### Runtime Surfaces & Auth

MCP requires API key by default (dev may allow no-auth only when explicitly configured in adapters). OAuth2 mode allowed with scopes: `search.read`, `docs.write`, `memory.read`, `memory.write`, `memory.delete`; RBAC + Add-Permissions-in-Token enabled. MCP config must match adapter registry and `.well-known/mcp.json` without hardcoded ports in core.

---

## IV. Feature Development Standards

Prioritized stories (P0–P3) that are **independently testable**; Given–When–Then acceptance criteria.  
Technical debt tracked via ADRs + Issues with payoff plan.

---

## V. Compliance & Governance

**Licensing**: Apache‑2.0; license validation via pack tooling; **SBOM via CycloneDX** when required.  
**Provenance**: **SLSA** attestations; verify with **Cosign bundle** when required.  
**Privacy**: Local-first; GDPR erasure; privacy-preserving telemetry.

**Review & Checklists (ENFORCED)**:

- A **human (non-author)** completes and posts the Code Review Checklist in `20-checklists/checklists.md` (Code Review section).  
- BLOCKER items must be PASS; MAJORs need fixes or a waiver; MINORs need a follow-up task.

---

<!-- PROJECT-SPECIFIC: START -->
## V.1 Project-Specific Governance

> **Instructions:** Add project-specific mission, values, and escalation paths here. This section is NOT overwritten when upgrading the governance pack.

### Project Mission

_Define your project's specific mission and how it aligns with brAInwav principles._

### Project Values

| Value | Description |
|-------|-------------|
| _e.g., User Privacy_ | _How this project prioritizes user privacy_ |

### Project Escalation Path

1. Project maintainer
2. Team lead
3. Governance pack maintainers

### Project-Specific Principles

<!-- Add any additional principles that tighten (not weaken) the base constitution -->

<!-- PROJECT-SPECIFIC: END -->

---

## VI. Amendment Process

**Proposing Changes**: Create ADR; include rationale/impact; maintainer approval; bump version; announce.  
**Conflict Resolution (highest → lowest)**:

1. **Governance Pack** with precedence:
   - `AGENT_CHARTER.md` (immutable ethics; consolidates Rules of AI)
   - **This Constitution**
   - `vision.md`, `agentic-coding-workflow.md` (includes Phase Machine §4.4), `20-checklists/checklists.md` (Code Review section), `assurance-system.md` (Time Freshness Policy), `checklists.md`
2. `CODESTYLE.md`  
3. Root `AGENTS.md`  
4. Package-level `AGENTS.md`  
5. Model guides (adapters)

---

## VII. Enforcement

**Automated**: CI gates (coverage/mutation, structure, security, a11y), evidence-token scan, checklist presence, model health checks when required, **trace-context verification**, env-loader rule, domain boundary checks.

**Manual**: Code owners approve; checklist verified; architecture decisions reviewed.

**Continuous Improvement**: Retros, metrics, periodic audits.

---

Co-authored-by: brAInwav Development Team

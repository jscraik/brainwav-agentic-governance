---
trigger: always_on
alwaysApply: true
---
<!-- governance/00-core/vision.md -->

# Agentic Governance Vision Document — Project-Neutral (v1.2, 2025-12-03)

## 0) North Star (End State)

This governance framework enables a self-contained, local-first **Agentic Development Runtime** that:

1) orchestrates agent workflows with strict phase gates,  
2) persists knowledge via a **Memory Adapter** with adapter-defined parity,  
3) exposes **only** controlled surfaces — **MCP**, **A2A**, **REST**, and **external model adapters** — guarded by policy, and  
4) ships an **A11y-first Ops Dashboard** for health, logs, metrics, traces, and manual controls, and  
5) applies uniformly across **every adopting project** so agents and developers share one contract regardless of repository.

> **Governance is code.** The runtime acknowledges the nearest `AGENTS.md`, emits evidence tokens, runs Aegis oversight before acting, treats **time freshness** as a first-class constraint, and assumes every adopting codebase follows the same playbook.

---

## 1) Core Principles

- **Local-first, vendor-neutral.** No provider preference; external APIs only via policy-guarded adapters.
- **Project-neutral governance.** Every adopting codebase inherits the same baseline contract; package `AGENTS.md` files may tighten rules but never fork process intent.
- **Deterministic & evidence-backed.** Reproducible runs; artifacted logs, traces, SBOM/provenance.
- **Single integration hub.** Exactly one MCP server; Tools/Resources/Prompts are **registered** (not embedded).
- **Tight domain boundaries.** No cross-domain imports; communicate via A2A topics or declared contracts/schemas.
- **Security, A11y, Observability by default.** API-key/OAuth, WCAG 2.2 AA, structured logs + OTel; secrets retrieved on-demand via approved secret-manager CLI with no long-lived copies.
- **Small, shippable steps.** Quality gates: coverage/mutation, a11y, security, structure guard.
- **Time Freshness Guard.** All dates anchored to harness "today"; ISO-8601 surfaced to users.
- **Hybrid Model — Profile-driven.** Live engines required for release; delivery allows recorded inputs with evidence; creative allows prototyping only.
- **AGENTS.md + Aegis Oversight.** Load nearest `AGENTS.md` (persist SHA); call `cortex_aegis_validate` before file writes/network calls/long runs.

---

## 2) System Boundaries (Allowed Interfaces)

- **MCP (Model Context Protocol)** over **HTTP/SSE** (optional **STDIO**)  
  Paths: `/mcp`, `/sse`, `/health`, `/metrics`
- **A2A** (Agent-to-Agent hub) for intra-runtime messaging (topics, intents, envelopes)
- **REST API** for programmatic control & integrations
- **External Adapters**: model and connector surfaces are adapter-defined and policy-guarded

> **No hardcoded ports in core governance.** Adapter packs define endpoint/port defaults and `.well-known/mcp.json`.

**Auth modes**
- **API key** by default (dev may allow no-auth only when explicitly configured in adapters).  
- **OAuth2 (IdP)** optional; token scopes must follow least privilege and be documented per project.

---

## 3) Architecture Overview

### 3.1 ASBR Orchestrator (LangGraph)
- Owns graphs, policies, **phase machine (R→G→F→REVIEW)**, and run lifecycle.
- Invokes MCP Tools/Resources/Prompts, A2A messages, Memory, RAG jobs.
- Emits structured telemetry (traces/metrics/logs) with `service:"<service_name>"`, run IDs, and phase transitions. Optional `brand` may be required by overlays.

### 3.2 MCP (Single Hub)
- **MCP** server exposing `/mcp`, `/sse`, `/health`, `/metrics`.
- Loads registries for Tools/Resources/Prompts; no business logic in the server.
- **Auth**: API-key or OAuth2; remote access via **secure tunnel**.

### 3.3 A2A Hub
- Central bus for topics/intents; policies for routing, retries/backoff, auditing.
- **No direct cross-domain imports**; use envelopes/contracts only.

### 3.4 Memory Adapter
- Single source of truth for memories (facts, episodes, embeddings, artifacts).
- CRUD + search APIs; retention/expiry; export/import.
- **Parity rule**: every write available via adapter-defined surfaces. Evidence persisted to `.github/instructions/memories.instructions.md`.

### 3.5 RAG Pipeline
- Ingestion → chunking → embedding → indexing → retrieval → post-processing (live/recorded per profile and evidence policy).
- Deterministic pipelines with versioned configs, replayable jobs, and batch evaluation hooks.

### 3.6 Agents
- Role-scoped (builder/reviewer/guardian) with explicit contracts and **evidence pointers**.
- Obey **phase machine** and **HITL at REVIEW only**; blocked otherwise.

### 3.7 Connectors & External Surfaces
- Adapter-defined connectors for bounded operation of governance framework in external runtimes.
- Rate-limits, audit, and error taxonomy standardized.

### 3.8 Ops Dashboard (React)
- Health, logs viewer, trace explorer, metrics, queue/state monitors.
- Manual controls: pause/resume, retry, drain, "run test flow".
- **A11y**: keyboard navigation, semantic roles, no color-only signaling.

### 3.9 Observability & Security
- **Metrics** (Prometheus), **Traces** (OpenTelemetry), **Logs** (structured/Pino-style).
- Security: timing-safe API-key checks, Host/CORS validation, secret vaults.
- **403 triage**: path, host/CORS, auth header, tunnel policy, dev no-auth alignment.

---

## 4) Packages: Vision & "Done Means"

> Names indicative — adapt to monorepo layout.

### 4.1 `packages/mcp-server`
**Vision:** Minimal MCP HTTP/SSE hub; loads registries; zero business logic.  
**Done means:** `/health`, `/mcp`, `/sse`, `/metrics` green; API-key on; secure tunnel tested; integration tests pass; **evidence tokens present** (`AGENTS_MD_SHA`, `AEGIS_VALIDATE:OK`, `service:`).

### 4.2 `packages/mcp-core`
**Vision:** Protocol utilities, schemas, adapters, error taxonomy.  
**Done means:** Zod types for Tools/Resources/Prompts; stable client; exhaustive unit tests; import-boundary guards.

### 4.3 `packages/mcp-registry`
**Vision:** Declarative registry with lazy loading.  
**Done means:** Hot-reload in dev; list/read/register APIs; smoke test of discoverable & callable Tool/Resource/Prompt via MCP.

### 4.4 `packages/a2a`
**Vision:** Central A2A hub (no per-package A2A).  
**Done means:** Topics/intents; at-least-once delivery; retries/backoff; message audit; fan-out/error-path tests.

### 4.5 `packages/memory-core`
**Vision:** Unified memory store (facts/episodes/embeddings/artifacts).  
**Done means:** Deterministic IDs; retention/export; vector adapters; >90% test coverage; **parity tests** (MCP & REST).

### 4.6 `packages/rag`
**Vision:** Deterministic ingestion/index/retrieval with **live** models.  
**Done means:** Config-driven jobs; snapshotable outputs; retrieval quality smoke; perf budget; **model health logs** attached when required (model IDs, dims/norms, latency).

### 4.7 `packages/agents`
**Vision:** Role-scoped agents with policy gates; evidence-backed outputs.  
**Done means:** JSON-schema I/O; blocking reviewer modes; trace correlation; E2E fixtures; **phase tokens** emitted.

### 4.8 `packages/orchestration`
**Vision:** LangGraph graphs + policy enforcement (phase, HITL gates).  
**Done means:** Golden path (ingest→index→query) and incident path; replayable runs; determinism checks; **HITL blocked pre-REVIEW**.

### 4.9 `packages/connectors`
**Vision:** Adapters for external model/connectors (runtime-specific packs).  
**Done means:** Sample adapter config; rate-limit & auth guards; 403 playbook; protected-resource metadata publishing OAuth scopes.

### 4.10 Platform Runtime Surfaces (scope note)
This vision doc is governance-focused. Runtime host/app specifics (e.g., dashboards, ASBR hosts) live in system architecture/runbook docs. Keep this section scoped to governance expectations; see platform docs for implementation targets.

---

## 5) Non-Goals

- Multiple MCP servers per package (duplication)  
- Interfaces beyond MCP/A2A/REST/external adapters  
- Opaque AI actions without evidence/logs

---

## 6) Success Metrics

- **Reliability:** ≥99% success on golden-path E2E; zero data-loss on restart.  
- **Quality:** CI gates all green; ≥90% unit coverage key packages; 95% span coverage in traces.  
- **Security:** All external calls authenticated; happy-path free of 403s; no secrets logged.  
- **A11y/UX:** Full keyboard coverage; no color-only indicators; screen-reader labels pass axe/jest-axe.  
- **Governance Evidence:** PRs contain:
  - `AGENTS_MD_SHA:<sha>`, `AEGIS_VALIDATE:OK`, `PHASE_TRANSITION:*`, `service:*`  
  - `MODELS:LIVE:OK engine=<id>` with model IDs and dims/norms  
  - Top-level Code Review Checklist link to `20-checklists/checklists.md`

---

## 7) Phase Machine & HITL Gating (Runtime Policy)

- **R (Red):** Write failing tests; plan minimal pass → auto-advance to **G** when failing → passing committed.  
- **G (Green):** Implement to pass; profile/change-class quality gates → **F**.  
- **F (Finished):** Refactor/docs/a11y/security/structure-guard + model health evidence when required → **REVIEW**.  
- **REVIEW:** HITL permitted; Code Review Checklist must PASS all BLOCKERs.

> Any `human_input` before REVIEW is a policy violation.

---

## 8) Evidence Protocol (Emitted & Verified)

- **AGENTS Acknowledgement:** `AGENTS_MD_SHA:<sha>` persisted in `governance/run.yaml` and first Aegis log.
- **Aegis Oversight:** `AEGIS_VALIDATE:OK` log required before act phases when profile/change class requires it.
- **Model Evidence:** model health output includes engine, model IDs, vector dims/norms, latency, and `MODELS:LIVE:OK` when live usage is required.
- **Time Freshness:** All surfaced dates are ISO-8601; relative terms normalized.

---

## 9) Project-Neutral Procedure & Steps

> **Applies to every adopting repository.** Follow these numbered steps end-to-end; reference documents provide deeper detail but the order is fixed.

1. **Bootstrap governance context** – Run `pnpm cortex:governance-bootstrap`, record hashes from `brainwav/governance/90-infra/governance-index.json`, and confirm the nearest `AGENTS.md` + package overrides. (Docs: `governance-quickstart.md`, `AGENT_CHARTER.md`).
2. **Classify the work item** – Select task type (Feature/Research/Fix/Refactor/Review) and tier per `agentic-coding-workflow.md` §2. Capture metadata in `tasks/<slug>/meta/task.json` before touching code.
3. **Create the task folder + context** – Populate the canonical structure from `agentic-coding-workflow.md` §3, run Context Builder, and log connector health + academic research in `context/research.md`.
4. **Plan and register risks** – Draft `plan/PLAN.md` (≤7 steps) + `plan/tdd-plan.md`, enumerate reuse candidates, and run Cortex-Aegis (`logs/aegis/*.json`, legacy `logs/vibe-check/*.json` allowed via adapters) prior to implementation.
5. **Scaffold then implement** – Establish failing milestone tests, wire OpenFeature flags, then execute micro-TDD loops (G3→G4) while emitting phase tokens (`PHASE_TRANSITION:R->G`, etc.) and updating `work/implementation-log.md`.
6. **Verify & evidence** – Run coverage/mutation/a11y/security suites (G5), attach SBOM + SLSA artifacts, capture contract snapshots, and update `evidence/tests.md` + `verification/*` outputs.
7. **Review & document** – Execute AI + HITL reviews (G6/G7), complete the Code Review Checklist, refresh READMEs/runbooks, and ensure `implementation-plan.md#reuse-ledger` + `SUMMARY.md` are current.
8. **Ship, monitor, archive** – Roll out per `ops/rollout-plan.md`, watch telemetry, finalize `archive.json`, sync Memory Adapter parity, and close the task with Evidence Triplet pointers recorded in the run manifest.

Every step emits the mandated tokens in §8 and inherits the phase machine rules in §7, ensuring teams in any adopting project progress identically.

---

## 10) Glossary

- **MCP:** Model Context Protocol — registry/invocation of Tools/Resources/Prompts.  
- **ASBR:** Agentic Second Brain Runtime — governance framework orchestrator on LangGraph.  
- **A2A:** Agent-to-Agent messaging hub.  
- **Phase Machine:** R→G→F→REVIEW gatekeeper of autonomy and HITL.

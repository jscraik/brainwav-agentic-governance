<!--
file_path: "AGENTS.md"
description: "Agent Operational Instructions for Cortex‑OS — Repository Root Reference (ArcTDD, Phase Machine, Governance-Index, Live-Only ML, Reuse-First, Academic License Validation)"
maintainer: "brAInwav Development Team"
last_updated: "2025-11-22"
version: "1.6.2"
status: "authoritative"
license: "Apache-2.0"
audit:
  provenance: "ChatGPT (edited)"
  reviewers: ["@jamiescottcraik"]
  signoff: []
-->

# AGENTS — Cortex‑OS (authoritative)

> **AGENTS.md is policy.** CI enforces the rules herein. Where this file references machine‑readable artefacts (manifests, logs, SHAs), merges **block** if evidence is missing or stale.

**Maintainer:** brAInwav Development Team  
**Scope:** Operational rules for all human and AI agents in this monorepo.  
**Normative keywords:** **MUST**, **SHOULD**, **MAY** use RFC‑2119 meanings.

---

## Quick Navigation

- [0) Purpose](#0-purpose)
- [0.1) ArcTDD Charter (MANDATORY)](#01-arctdd-charter-mandatory)
- [0.2) Glossary](#02-glossary)
- [1) Hierarchy of Authority](#1-hierarchy-of-authority)
- [2) Governance Index (SHA‑pinned)](#2-governance-index-sha-pinned)
- [2.1) Governance Bootstrap (Repo Attach)](#21-governance-bootstrap-repo-attach)
- [3) Mandatory Templates & Specs](#3-mandatory-templates--specs)
- [4) Personas & Authority](#4-personas--authority)
- [5) Boundaries & Interfaces 〔AGENTS‑BND‑005〕](#5-boundaries--interfaces-agentsbnd005)
- [6) Build, Run, Verify (Smart Nx + Agent‑Toolkit)](#6-build-run-verify-smart-nx--agenttoolkit)
- [7) Code Style Summary](#7-code-style-summary)
- [8) Tests & Quality Gates](#8-tests--quality-gates)
- [9) Security, Supply Chain, Compliance](#9-security-supply-chain-compliance)
- [10) Accessibility (WCAG 2.2 AA)](#10-accessibility-wcag-22-aa)
- [11) Oversight Gate (Cortex Aegis Check + Academic Licensing)](#11-oversight-gate-cortex-aegis-check--academic-licensing)
- [12) Observability & Telemetry 〔AGENTS‑OBS‑006〕](#12-observability--telemetry-agentsobs006)
- [13) Runtime Surfaces & Auth](#13-runtime-surfaces--auth)
- [14) Inputs & Outputs](#14-inputs--outputs)
- [15) Local Memory (operational default)](#15-local-memory-operational-default)
- [16) Agent‑Toolkit (MANDATORY)](#16-agenttoolkit-mandatory)
- [17) Commits, PRs, Branching](#17-commits-prs-branching)
- [18) Monorepo Layout & Nested `AGENTS.md`](#18-monorepo-layout--nested-agentsmd)
- [19) Environments, Ports, Bundling](#19-environments-ports-bundling)
- [20) Anti‑Patterns (CI fails) 〔AGENTS‑STY‑007〕](#20-anti-patterns-ci-fails-agents-sty-007)
- [21) Frontend Scope](#21-frontend-scope)
- [22) Where to Look Next](#22-where-to-look-next)
- [23) Time Freshness & Date Handling](#23-time-freshness--date-handling)
- [24) Task & Evidence Contract](#24-task--evidence-contract)
- [25) Hybrid Model Solution — Live Only 〔AGENTS‑HMS‑003〕](#25-hybrid-model-solution-live-only-agents-hms-003)
- [26) Code Review Checklist — Enforcement](#26-code-review-checklist--enforcement)
- [27) Waivers, Versioning & Change Control](#27-waivers-versioning--change-control)
- [28) Human vs Agent Responsibilities](#28-human-vs-agent-responsibilities)
- [29) Package `AGENTS.md` — Starter Template](#29-package-agentsmd--starter-template)
- [30) Maintainers & Contact](#30-maintainers--contact)
- [31) Changelog](#31-changelog)

---

## 0) Purpose

- Define how agents (humans + LLMs) plan, build, test, secure, ship, and audit work here.
- Centralize the “how we work” contract; **CI validates** key parts.
- Subprojects MAY ship their own `AGENTS.md`. The **nearest** file to a path is authoritative for that path; root remains ground truth for repo‑wide rules.

---

## 0.1) ArcTDD Charter (MANDATORY)

> You MUST read and comply with the brAInwav ArcTDD Charter **before coding**.  
> Canonical copy: `/.cortex/rules/CHARTER_FRAGMENT.md` (SHA‑256 recorded below).

- **Charter Location:** `/.cortex/rules/CHARTER_FRAGMENT.md`
- **Charter SHA‑256:** `8fdd538b1acc51035b66dd3ac9481464c341b657a841ed2d6ed0ba696fb46e0e` *(recomputed by CI)*
- **Enforcement:** Violations block merge via CI (`charter` job).
- **Waiver Activation Rule:** A waiver is **valid** only after `charter-enforce / danger` posts ✅ with a link to the **Apply Waiver** workflow run that recorded Maintainer approval.

**Guardrails (summary):** Step Budget ≤ 7 · Ask‑First ≤ 3 · Explain‑While‑Doing · Evidence Triplet · Recap ≤ 500 tokens · Brand Logs · Arc Protocol · North‑Star Test · Preflight Guards (academic research + license validation + connector health + vibe‑check + model health/smoke + trace context + SBOM/attestation + identity gate) · Session Hygiene.

---

## 0.2) Glossary

**Arc** — Vertical slice (2–5 commits, ≤120 min).  
**Evidence Triplet** — Milestone test red→green, contract snapshot, reviewer JSON pointer.  
**Preflight Guards** — Cortex Aegis check, academic research + license validation, connector health, trace context, live model health/smoke, SBOM/attestation, identity gate.  
**Run Manifest** — Machine log of tier, arcs, resets, evidence pointers: `tasks/<slug>/json/run-manifest.json`.

---

## 1) Hierarchy of Authority

1. **Governance Pack** (`/.cortex/rules/*`):

- `RULES_OF_AI.md`
- `CHARTER_FRAGMENT.md`
- `AGENT_CHARTER.md`
- `agentic-coding-workflow.md` (G0–G10)
- `agentic-phase-policy.md` (R→G→F→REVIEW)
- `AGENTIC_WORKFLOWS.cortex-os.md` (unified operational task-type workflows;
  bootstrap contract; run-manifest schema linkage; Cortex Aegis oversight;
  RepoPrompt evidence mapping; SHA‑pinned for enforcement)
- `constitution.md`
- `llm-threat-controls.md` *(if LLM/tools)*
- `skills-system-governance.md` *(if `skills/`)*
- `10-flow/_time-freshness.md`
- `vision.md`
- `TASK_FOLDER_STRUCTURE.md`

2) `CODESTYLE.md` (CI‑enforced)
3) **This** `AGENTS.md` (root)
4) Nearest package `AGENTS.md` (MAY tighten; MUST NOT weaken)
5) Model adapters (`/docs/models/*.md`) (MUST NOT weaken)

### 1.1) Operational Workflows (Unified)

`/.cortex/rules/AGENTIC_WORKFLOWS.cortex-os.md` consolidates task-type flows
(feature, fix, refactor, research), the bootstrap contract, required
run-manifest fields, Cortex Aegis oversight ordering, RepoPrompt evidence
placement, time freshness integration, and threat-control mapping references.
Tasks MUST treat it as binding; its SHA is verified via the governance index.

---

## 2) Governance Index (SHA‑pinned)

Agents and CI discover and verify rules via a canonical index:

```text
Canonical index: /.cortex/rules/governance-index.json
Alias (optional): /.cortex/rules/index.json (symlink for legacy tooling)
```

The index MUST list all binding docs with **paths and SHA‑256**. CI verifies
digests; the **agent bootstrap** refuses to act if digests don’t match.
`AGENTIC_WORKFLOWS.cortex-os.md` is SHA‑pinned in this index and enforced.
Tasks MUST reference this index in their run manifest:

```json
// tasks/<slug>/json/run-manifest.json (excerpt)
{
  "tier": "feature",
  "arcs": ["plan", "implement", "test", "review"],
  "evidence_triplet": {
    "milestone_test": "tasks/<slug>/logs/tests/milestone.log",
    "contract_snapshot": "tasks/<slug>/json/contracts-snapshot.json",
    "reviewer_pointer": "tasks/<slug>/json/reviewer.json"
  },
  "governance": {
    "rules_index": "/.cortex/rules/governance-index.json",
    "AGENTS_MD_SHA": "<computed>",
    "AGENTIC_WORKFLOWS_SHA": "<computed>",
    "llm_controls_map": "tasks/<slug>/verification/llm-controls-map.md"
  }
}
```

## 2.1) Governance Bootstrap (Repo Attach)

> **Purpose:** Make agents "governance aware" on repository attach **without** creating a task directory or run‑manifest.

Run once per session (IDE open, CI init, agent cold start):

```bash
pnpm cortex:governance-bootstrap
```

Generates `.cortex/agent-governance-context.json` containing:

- `repo_root`, `agents_md_path`, `AGENTS_MD_SHA`
- `governance_index_path`
- `workflows` mapping (`feature`, `fix`, `refactor`, `research`, `code_review`) → section hints in `AGENTIC_WORKFLOWS.cortex-os.md`
- MCP client configs derived from the transport registry `.cortex/mcp.runtime.json`:
  - `.cortex/mcp.claude.json` (Claude/desktop)
  - `.cortex/mcp.vscode.json` (VS Code / Claude Code)
  - Re-run bootstrap whenever `.cortex/mcp.runtime.json` changes.
- Optional `--health-check --task <slug>` will probe each MCP transport and write results to `tasks/<slug>/logs/connector-health/connector-health-*.json` for Cortex Aegis inputs.

> [brAInwav] **Health Check Operational Note:**  
> - Health checks are **informational only** and do **not** block the bootstrap process.  
> - If health check results show errors, agents **should investigate** but may proceed with operation unless otherwise instructed by governance or security policy.  
> - If no MCP servers are configured, health checks are **skipped** and a "not applicable" status is logged.  
> - Health check logs are retained in `tasks/<slug>/logs/connector-health/` and are subject to standard log rotation and retention policies (see [brAInwav Log Lifecycle Guide](docs/log-lifecycle.md)).  
> - For interpreting health check results, refer to the [Cortex Aegis documentation](https://github.com/jamiescottcraik/brAInwav/docs/cortex-aegis.md).  
**Key Rules:**

1. MUST run before deriving a system prompt or selecting a workflow.
2. MUST NOT create `tasks/<slug>/` or modify existing manifests.
3. SHOULD re‑run if `AGENTS.md` or any governance doc hash changes.
4. MUST log branded line `[brAInwav] cortex-governance-bootstrap …` for audit.
5. NOTE: Governance index hashes refresh when `/.cortex/rules/10-flow/agentic-coding-workflow.md` changes—rerun the bootstrap to cache the new digest.

**Preamble Injection Example:**

```text
You are operating in Cortex-OS. Governance: AGENTS.md, governance-index.json, AGENTIC_WORKFLOWS.cortex-os.md. When user states a task type, select matching workflow section and follow it.
```

**Difference vs Task Bootstrap (see §24):** No slug creation, no run‑manifest; pure discovery + metadata.

---

---

## 3) Mandatory Templates & Specs

MUST use the official templates; deviations fail review:

- `/.cortex/templates/feature-spec-template.md`
- `/.cortex/templates/research-template.md`
- `/.cortex/templates/tdd-plan-template.md`
- `/.cortex/templates/constitution-template.md`

**Reuse‑First delivery:** Effective **2025‑11‑12** with grace to **2025‑12‑10**;
after that, non‑compliant PRs are **BLOCKED** unless waived. Evidence lives in
`analysis/reuse-evaluation.md` + manifest pointer.

---

## 4) Personas & Authority

| Persona        | Permitted Actions                                          | Hard Limits                                              |
| -------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| **Assistant**  | Explain/summarize/answer (read‑only).                      | MUST NOT modify source.                                  |
| **Analyst**    | Scan repo, emit insights; convert `INITIAL.md` → `prp.md`. | No code changes.                                         |
| **Generator**  | Scaffold code/tests/docs/refactors under TDD.              | Output is draft; human reviews/commits; no self‑execute. |
| **Guardian**   | Threat‑model, SBOM, OWASP‑LLM checks, a11y/license audits. | Reports only; no code changes.                           |
| **Refactorer** | Identify debt; produce PRP for refactors.                  | MUST NOT change code directly.                           |

If anything clashes with `RULES_OF_AI`, the *Constitution* wins.

---

## 5) Boundaries & Interfaces 〔AGENTS‑BND‑005〕

- **No cross‑domain imports.** Interact via published packages and declared contracts (MCP/A2A/REST).
- Helpers live behind shared interfaces; no private leaks across domains.
- New surfaces require specs; Frontier adapters sit behind policy gates and observability.

---

## 6) Build, Run, Verify (Smart Nx + Agent‑Toolkit)

```bash
./scripts/dev-setup.sh
pnpm readiness:check
pnpm ensure:tools

pnpm dev
pnpm build:smart
pnpm test:smart
pnpm lint:smart
pnpm typecheck:smart
```

- **Environment baseline:** Node 24.11.x; pnpm 10.19.x pinned in `.mise.toml`.
- **Use Nx** (`nx run/affected`) and **Agent‑Toolkit** (see §16) for repo‑aware ops.

---

## 7) Code Style Summary

- Functional‑first; strict types at boundaries; **named exports only**.
- ≤ 40 lines per function; **guard clauses** not pyramids.
- `async/await` with **AbortSignal** for cancelable I/O; never swallow errors; use `cause`.
- UI: Next.js App Router, Suspense, Error Boundaries; **WCAG 2.2 AA**.

**Prod‑path hard checks:**
No `any` (except justified shims/tests), no `eval`, no ambient randomness/time,
no TODO/FIXME/HACK, no fake telemetry, no placeholder adapters.

---

## 8) Tests & Quality Gates

- TDD by default; tests co‑located.
- Coverage ≥ **90%** global; **95%** changed lines; Mutation ≥ **90%** (where enabled).
- E2E + a11y for user‑facing surfaces.
- Evidence Triplet (milestone test red→green, contract snapshot, reviewer JSON) is **mandatory**.

---

## 9) Security, Supply Chain, Compliance

- **Secrets:** fetch on‑demand via 1Password CLI `op`; no hard‑coded secrets or long‑lived envs.
- **Scanners:** Semgrep (**ERROR=block**), gitleaks (**ANY=block**), OSV/Audit per lockfile.
- **SBOM & Provenance:** CycloneDX (1.6+) + in‑toto/SLSA provenance; signed artefacts (Sigstore Cosign).
- **Containers:** minimal base, pinned digests, non‑root, read‑only FS, drop caps.
- **Standards mapping (advisory):** NIST SSDF practices; ISO/IEC 42001 alignment; OWASP LLM Top‑10 controls via `llm-threat-controls.md`.
- **Identity Gate:** CI/services authenticate via OIDC/WIF (no static cloud keys).
- **Docs validation:** `docs-validate` job MUST pass; policy links must resolve.

---

## 10) Accessibility (WCAG 2.2 AA)

- Semantic HTML/ARIA; consistent focus order; min target 44×44 CSS px.
- Keyboard complete; no color‑only signalling.
- CLI/TUI: `--plain` output for screen readers.
- Attach axe/jest‑axe reports when UI is affected.

---

## 11) Oversight Gate (Cortex Aegis Check + Academic Licensing)

Agents MUST call **Oversight** after planning **and** academic research
enhancement **and** license validation, **before** any file writes/network
calls/long runs.

```bash
pnpm oversight:vibe-check \
  --goal "<task>" \
  --plan "<≤7 steps (license‑compliant)>" \
  --session "<id>" \
  --save "tasks/<slug>/logs/vibe-check/initial.json" \
  --with-academic-research \
  --validate-licenses \
  --license-validation "tasks/<slug>/logs/academic-research/license-validation.json"
```

- **Research & Licensing (MANDATORY):** Enhance plans with multi‑source academic
  research (Wikidata, arXiv, Semantic Scholar, OpenAlex, Context7). Validate usage
  rights; include only SAFE/REVIEW content. Store findings + validation JSON under
  `tasks/<slug>/logs/academic-research/`.
- **Connector Health:** Probe research MCPs; attach `research/connectors-health.log`.
- **Responses:** MUST include `brand:"brAInwav"`, `[brAInwav]`, `trace_id`.

---

## 12) Observability & Telemetry 〔AGENTS‑OBS‑006〕

- OpenTelemetry traces/logs/metrics; W3C `traceparent` propagated; every log has `trace_id`.
- Performance budgets enforced in CI.
- AI provenance: `.cortex/audit/ai/AI_CONTRIB_LOG.yaml` entries for AI‑assisted commits.

---

## 13) Runtime Surfaces & Auth

- **MCP**: `/mcp`, `/sse`, `/health`, `/metrics` (API‑key required; SSE shares the guard).
- **OAuth2** (Auth0) optional (scopes: `search.read docs.write memory.read memory.write memory.delete`).
- **Default Ports:** MCP 3024 · Local Memory 3002 · MCP bridge 3026 · Connectors
  3030 · Pieces OS 39300 · Cortex Aegis (Oversight) 2091 · Wikidata MCP 3029 · arXiv MCP 3041.
- **Well‑known:** `.well-known/mcp.json` MUST match runtime.

---

## 14) Inputs & Outputs

- **Inputs:** Zod‑validated; bounded; deterministic seeds; explicit resource caps; reject unsanitized data; log reason codes.
- **Outputs:** human‑readable by default; `--json` available; ISO‑8601 timestamps;
  structured errors with evidence pointers (file:line, run IDs, URLs).

---

## 15) Local Memory (operational default)

Persist key decisions to BOTH:

- `.github/instructions/memories.instructions.md` and
- Local Memory MCP/REST (default port 3002).

Record IDs in `tasks/<slug>/json/memory-ids.json` and cite them in PRs.

**Profiles & Launch control:**
`~/.Cortex-OS/scripts/launchd/toggle-local-memory.sh` reinstalls the LaunchAgent,
restarts managed Qdrant (127.0.0.1:6333), and rebinds ports 3002/3026; removes
legacy agents.

---

## 16) Agent‑Toolkit (MANDATORY)

All agents MUST use **Agent‑Toolkit** (not individual tools) for repo‑aware work.

```bash
cd packages/agent-toolkit

# Multi-tool search (ripgrep + semgrep + ast-grep)
just scout "pattern" .

# AST analysis
just tsq "ast-query" src/

# Structural patches
just codemod 'find(:[x])' 'replace(:[x])' .

# Validate changed files
just verify changed-files.txt
```

- Outputs are **structured JSON**; attach to PR evidence.
- All searches respect `.gitignore` and project boundaries.

### 16.1) Fast Tools Prompt (codex-mastery)
<!-- FAST-TOOLS PROMPT v1 | codex-mastery | watermark:do-not-alter -->

Core fast tool usage mandates (supplements Agent‑Toolkit). Follow these rules
for any repository‑wide discovery or JSON manipulation.

**Search (ALWAYS use ripgrep, never grep):**

```bash
# Content search
rg "pattern"

# Find files by name (pipe from file list)
rg --files | rg "name-fragment"

# Language filtered search (example: Python defs)
rg -t python "def "
```

**File finding:** Prefer `fd` (or `fdfind` on Debian/Ubuntu). Respects `.gitignore`.

```bash
# Find TypeScript files named config
fd -e ts config
```

**JSON handling:** Use `jq` for parsing, filtering, transformation; avoid regex
parsing of JSON.

```bash
# Extract field
jq -r '.field' file.json

# Transform
jq '{id:.id, name:.spec.name}' input.json > reduced.json
```

**Install guidance:**

```bash
# macOS
brew install ripgrep fd jq

# Debian/Ubuntu
sudo apt update && sudo apt install -y ripgrep fd-find jq
# (optional) alias
echo 'alias fd=fdfind' >> ~/.zshrc
```

**Agent command substitutions:**

- grep → rg
- find / ls -R directory scanning → fd or `rg --files`
- cat | grep pattern file → `rg pattern file`
- Manual JSON field extraction → `jq` query

**Read limits & context:** Cap raw file reads to ≤250 lines. Prefer
`rg -n -A 3 -B 3 pattern` to supply local context without full file dumps.

**JSON hygiene:** Never mutate JSON with ad‑hoc sed/awk unless `jq` is
insufficient; if so, document justification.

<!-- END FAST-TOOLS PROMPT v1 | codex-mastery -->

---

## 17) Commits, PRs, Branching

- Conventional Commits (scoped), signed commits/tags.
- Keep diffs small; pair tests with implementation.
- PRs must pass: lint, types, tests, security, structure, coverage/mutation.
- Use `/.github/pull_request_template.md`; link specs/plans; cite Governance sections touched.
- Reviewer posts a completed `/.cortex/rules/code-review-checklist.md` as a top‑level PR comment.
- If code/content under `packages/<name>/` changed, update that package’s `AGENTS.md` **and** `README.md`, or explicitly confirm no changes required.

---

## 18) Monorepo Layout & Nested `AGENTS.md`

- Apps → `apps/`; packages → `packages/`; shared libs → `libs/`.
- Nx + ESLint enforce dependency boundaries.
- Package `AGENTS.md` MAY tighten rules; MUST NOT weaken root.

---

## 19) Environments, Ports, Bundling

- **Env loader:** `scripts/utils/dotenv-loader.mjs` or `@cortex-os/utils`; **do not** call `dotenv.config()` directly.
- **Secrets:** `op run …` for ephemeral injection.
- **Single‑file deployable bundles** for services (e.g., MCP server with
  `bundle:single`); no workspace‑relative resolution in production artefacts.
  Update runbooks when bundling commands/paths change.

---

## 20) Anti‑Patterns (CI fails) 〔AGENTS‑STY‑007〕

Default exports; >40‑line functions; promise chains without `await`; `any` in prod;
ambient randomness/time; `eval`; missing brand logs/errors; placeholder adapters;
fake telemetry; cross‑domain imports; memory parity skipped; unpinned bumps;
speculative parallelism without mitigations; “will be wired later” in prod paths.

---

## 21) Frontend Scope

Root defines repo‑wide expectations (Next.js App Router, Suspense, Error
Boundaries, WCAG 2.2 AA). Framework specifics belong in package `AGENTS.md` or
`/docs/frontend/<framework>.md`.

---

## 22) Where to Look Next

**Governance Pack:** `/.cortex/rules/*`

- `vision.md`, `agentic-coding-workflow.md`, `agentic-phase-policy.md`,
  `code-review-checklist.md`, `RULES_OF_AI.md`, `llm-threat-controls.md`,
  `skills-system-governance.md`, `constitution.md`
- `AGENTIC_WORKFLOWS.cortex-os.md` (authoritative operational workflows consolidation)

**Templates:** `/.cortex/templates/*`
**Other:** `CODESTYLE.md`, `docs/agents/code-planner-agent.md`, `docs/oauth/chatgpt-403-troubleshooting.md`

---

## 23) Time Freshness & Date Handling

Anchor to harness timezone + today. Treat “latest/current” as freshness checks.
Convert relative language to ISO‑8601. Distinguish past vs future explicitly.

---

## 24) Task & Evidence Contract

**Task dir:** `tasks/<slug>/` (see `/.cortex/rules/TASK_FOLDER_STRUCTURE.md`)

```
tasks/<slug>/
├─ implementation-plan.md
├─ tdd-plan.md
├─ implementation-checklist.md
├─ implementation-log.md
├─ code-review.md
├─ lessons-learned.md
├─ SUMMARY.md
├─ json/
│  ├─ baton.v1.json
│  ├─ plan-bundle.v1.json
│  ├─ run-manifest.json
│  ├─ concurrency-report.json
│  └─ memory-ids.json
├─ logs/
│  ├─ vibe-check/{initial.json,final.json}
│  └─ academic-research/{findings.json,license-validation.json,compliant-findings.json,final-findings.json}
├─ research/{repo-notes.md,memory-findings.md}
├─ verification/{structure-validation.log,trace-context.log,wcag/*.json}
├─ sbom/*.json
└─ attestations/*.bundle
```

Run manifest MUST track tier, arcs (≤7 steps), session resets, and evidence pointers. Include `governance.rules_index` (see §2).

---

## 25) Hybrid Model Solution — **Live Only** (Ollama / Frontier) 〔AGENTS‑HMS‑003〕

**Rules:** No stubs/fakes/recordings/"dry_run" for embeddings/rerankers/generation.
Real engines only; fallback chain Ollama → Frontier (all live). If
unavailable, mark **blocked**; seek waiver.

**Evidence:**

```bash
pnpm models:health && pnpm models:smoke
# attach model IDs, vector shapes/norms, latency samples, brand + engine
```

---

## 26) Code Review Checklist — Enforcement

**Source of truth:** `/.cortex/rules/20-checklists/checklists.cortex-os.md`
A **human (non‑author)** posts a completed checklist as a top‑level PR comment.
BLOCKER items must be PASS; MAJOR fixed or waived; MINOR may follow‑up.
CI mirrors the filled checklist to `.cortex/audit/reviews/<PR_NUMBER>-<SHORT_SHA>.md`.

---

## 27) Waivers, Versioning & Change Control

- **Waivers:** Maintainer or Constitution delegate MAY approve.
  Store `/.cortex/waivers/<waiver_id>.md` with `waiver_id`, `rule_id(s)`, `approver`, `expiry`, `reason`, **Apply Waiver** workflow link.
- **SemVer:** This document uses SemVer; bump MINOR for new rules; PATCH for clarifications.
- **Run Manifest:** CI MAY evaluate older manifests against newer gates for regression checks.

### 27.1) CI Enforcement Matrix (excerpt)

| Rule ID         | Description                                | CI Job               | Script/Check                               |
| --------------- | ------------------------------------------ | -------------------- | ------------------------------------------ |
| AGENTS‑CHK‑001  | Checklist token present                    | `agents-guard`       | grep for `CODE-REVIEW-CHECKLIST:`          |
| AGENTS‑PRV‑002  | Oversight logs attached                    | `agents-guard`       | search `brAInwav-vibe-check` in artefacts  |
| AGENTS‑HMS‑003  | Live model evidence present                | `models-smoke`       | verify model IDs/vector norms in logs      |
| AGENTS‑ACL‑004  | Package `AGENTS.md` not weakening root     | `structure-validate` | compare rule sets                          |
| AGENTS‑ACL‑011  | Academic license validation evidence       | `agents-guard`       | check `license-validation.json`            |
| AGENTS‑RFU‑012  | Reuse‑First compliance evidence            | `reuse-first`        | verify `analysis/reuse-evaluation.md`      |
| AGENTS‑DOC‑005  | Docs validation (no ERROR)                 | `docs-validate`      | `.cortex/gates/validate-docs.ts`           |
| AGENTS‑TRC‑006  | Trace Context verification                 | `trace-verify`       | `verify-trace-context.ts`                  |
| AGENTS‑MEM‑007  | Local Memory parity (IDs present)          | `memory-parity`      | check `json/memory-ids.json` + repo mirror |
| AGENTS‑A11Y‑008 | WCAG reports attached (if UI touched)      | `a11y-check`         | jest-axe/axe                               |
| AGENTS‑LLM‑009  | LLM Threat Controls mapping present        | `llm-threats`        | grep `llm-controls-map.md`                 |
| AGENTS‑SKL‑010  | Skills governance artefacts (if `skills/`) | `skills-guard`       | manifest/boundaries checks                 |

---

## 28) Human vs Agent Responsibilities

| Area               | Human                  | Agent                       |
| ------------------ | ---------------------- | --------------------------- |
| Scope & Priorities | Owns                   | Proposes                    |
| Code Changes       | Reviews & merges       | Generates under TDD         |
| Security/A11y Gate | Signs blockers/waivers | Lints, tests, reports       |
| Memory Entries     | Reviews/audits         | Writes; enforces MCP parity |

---

## 29) Package `AGENTS.md` — Starter Template

```md
# AGENTS — [PACKAGE_NAME]

- Inherits root AGENTS.md + Governance Pack.
- Maintainer: [OWNER_HANDLE]
- Last updated: [YYYY‑MM‑DD]
- Version: [MAJOR.MINOR.PATCH]

## Local Targets

- Test: `pnpm --filter [PACKAGE_NAME] test`
- Lint: `pnpm --filter [PACKAGE_NAME] lint`
- Typecheck: `pnpm --filter [PACKAGE_NAME] typecheck`

## Contracts

- Publishes events: `[topic:<NAME>]`
- MCP tools/resources: `[TOOL_1, TOOL_2]`

## Local Gates (tighten only)

- Coverage ≥ [92]% global; Mutation ≥ [90]%.
- A11y checks: `axe`/`jest-axe` as applicable.

## Notes

- Framework‑specific guidance belongs here (e.g., Angular) — **not** in the root file.
```

---

## 30) Maintainers & Contact

- GitHub: `@jamiescottcraik`
- Issues: open under the relevant package and label `governance`
- Emergencies: see `/.cortex/rules/constitution.md` escalation tree

---

## 31) Changelog

- **1.6.0 — 2025‑11‑11**

  - Added **Governance Index** (SHA‑pinned) requirement and manifest pointer.
  - Tightened **Oversight Gate** with academic **license validation** evidence and connector‑health logging.
  - Clarified **reuse‑first** transition (WARN→BLOCK timeline) and evidence placements.
  - Strengthened **live‑only ML** proof and OIDC/WIF identity gate.
  - Documented **single‑file bundling** rule for deployable services.
  - Added explicit **LLM Threat Controls** mapping artefact (`llm-controls-map.md`).
  - Aligned security language with **CycloneDX SBOM**, **in‑toto/SLSA**, and **NIST SSDF** (advisory mapping).

- **1.5.0 — 2025‑11‑05**

  - Academic License Validation framework; mandatory academic research enhancement.
  - Evidence package requirements under `logs/academic-research/`; CLI hooks.

- **1.4.0 — 2025‑11‑05**

  - Reuse‑First Delivery Policy rollout; grace window; CI attestation hooks.

- **1.3.0 — 2025‑10‑22**

  - Merged & tightened; standardized task dir; added new CI gates.

- **1.2.0 — 2025‑10‑14**

  - Consolidated AGENTS docs; DRY’d prohibitions to `CODESTYLE.md`.

---

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer
  running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`)
  instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool
  first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` MCP tool to
  analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use
  the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of
  assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

```text

**Adoption checklist (quick):**
- Add `/.cortex/rules/governance-index.json` with paths + SHA‑256 for all governance docs; wire its path into each `tasks/<slug>/json/run-manifest.json`.
- Ensure the agent bootstrap loads & verifies the index before acting; refuse to run on hash mismatch.
- Extend CI/Danger to (a) verify the index and (b) require the Oversight + academic license evidence bundle.
- Keep your existing brand tokens, phase machine, and Evidence Triplet flow—this update only strengthens linkage and enforcement.
::contentReference[oaicite:0]{index=0}
```text

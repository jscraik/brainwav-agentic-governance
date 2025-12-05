# Cortex-OS
> Production-ready AI agent orchestration runtime with strict governance and MCP integration

![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)
![Node.js Version](https://img.shields.io/badge/node-24.x%20Active%20LTS-brightgreen)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Test Coverage](https://img.shields.io/badge/coverage-95%25+-brightgreen)
![Security](https://img.shields.io/badge/security-OWASP%20compliant-green)
<img alt="Branch Coverage" src="https://raw.githubusercontent.com/jamiescottcraik/Cortex-OS/main/reports/badges/branch-coverage.svg" />
<img alt="Mutation Score" src="https://raw.githubusercontent.com/jamiescottcraik/Cortex-OS/main/reports/badges/mutation-score.svg" />

---

## Quick Links

⏱️ **[5-Minute Setup](./docs/quick-start.md)** | 🏗️ **[Architecture](./docs/architecture/architecture-overview.md)** | 🤝 **[Contributing](./CONTRIBUTING.md)** | 📘 **[Full Docs](./docs/README.md)**

**For Contributors:** [Quick Reference Guide](./AGENTS-QUICK.md) — Top 10 rules, setup, common workflows
**For AI Agents:** [AI Agent Rules](./AGENTS-AI.md) — Phase machine, evidence requirements, constitutional rules
**For Maintainers:** [Production Standards](./SECURITY.md) — Compliance checklist, security requirements

---

## Key Features

**🤖 AI Agent Orchestration** – Multi-agent workflows with A2A communication and event-driven architecture

**🔍 Advanced RAG System** – Retrieval-Augmented Generation with unified embeddings and citation tracking

**🔌 MCP Integration** – Standardized tool integration via Model Context Protocol with FastMCP v3 features

**🛡️ Security First** – OWASP compliance, OAuth 2.1 + PKCE, SBOM generation, vulnerability scanning

**📊 Quality Gates Enforce 95% Coverage, 90% Mutation Score** – TDD by default with automated enforcement

**🚀 Production Ready** – Docker deployment, CI/CD pipelines, health checks, graceful shutdown

[View all features →](./docs/architecture-overview.md)

---

## 🔧 Agent Toolkit (MANDATORY)

The `packages/agent-toolkit` provides a **unified, contract-driven interface** for all development
operations. This toolkit is **REQUIRED** for maintaining monorepo uniformity and code quality.

## 🧭 ArcTDD Task Workflow

1. Install workspace dependencies if you have not already: `pnpm install`.
2. Scaffold a new charter-compliant task from the repo root:
   ```bash
   pnpm task:new --slug lint-cleanup --tier fix
   ```
   The script shells out to the bundled CLI at `packages/agents/dist/task-new.js`, so no runtime transpilers are required.
3. Navigate to the generated `tasks/<slug>/` directory to find `run-manifest.json`, `TASK.md`, and the evidence triplet folders.

### Troubleshooting

- If `pnpm` aborts with a JSON parse error, confirm `package.json` is strict JSON (no comments) and re-run the command.
- To refresh the bundled CLI after editing `packages/agents/scripts/task-new.ts`, run `pnpm --filter @cortex-os/agents bundle:task-new` and commit the updated `packages/agents/dist/task-new.js` artifact.
- Additional CLI details live in [`packages/agents/README.md`](packages/agents/README.md).

### Core Integration Pattern

```typescript
import { createAgentToolkit } from '@cortex-os/agent-toolkit';

const toolkit = createAgentToolkit();
// Use TypeScript interface for programmatic access
await toolkit.multiSearch('pattern', './src');
await toolkit.validateProject(['*.ts', '*.py', '*.rs']);
```

### Shell Interface (Just Recipes)

- `just scout "pattern" path` - Multi-tool search (ripgrep + semgrep + ast-grep)
- `just codemod 'find(:[x])' 'replace(:[x])' path` - Structural modifications
- `just verify changed.txt` - Auto-validation based on file types

### When Agents MUST Use Agent-Toolkit

1. **Code Search Operations** - Instead of raw grep/rg commands
2. **Structural Modifications** - For any refactoring or codemod operations  
3. **Quality Validation** - Before commits, PRs, or code changes
4. **Cross-Language Tasks** - Unified interface for TypeScript/Python/Rust
5. **Pre-Commit Workflows** - Automated validation pipelines

### Architecture Compliance

Agent-toolkit follows Cortex-OS principles:

- **Contract-first**: Zod schemas ensure type safety
- **Event-driven**: A2A integration ready
- **MCP compatible**: Tool exposure for agent consumption
- **Layered design**: Clean domain/app/infra separation

---

## 🚀 Smart Nx Execution (Affected-Only)

Run only affected projects based on git changes for 60-90% faster CI execution:

```bash
pnpm build:smart       # affected build with base/head auto-detect
pnpm test:smart        # affected test
pnpm lint:smart        # affected lint
pnpm typecheck:smart   # affected typecheck
```

**[Full documentation →](./docs/nx-smart-mode.md)** - Learn about codemap snapshots, non-interactive mode, dry-run previews, and troubleshooting.

---

### Latest Maintenance

- **2025-09-27** – Reinforced the brAInwav Prisma bootstrap in `apps/api` so
  `pnpm --filter @cortex-os/api build` stays green with mutable logging and
  fallback delegates aligned to brAInwav standards.
- Implementation staged: Added a `.well-known/mcp.json` discovery manifest to the
  Node MCP hub (`packages/mcp-server`) so ChatGPT MCP connectors can discover the
  brAInwav endpoint. Deploy and verify with
  `curl https://cortex-mcp.brainwav.io/.well-known/mcp.json` before rerunning
  connector setup.

---

## Autonomous Software Behavior Reasoning (ASBR) Runtime

Clean, governed monorepo with strict architectural boundaries and
comprehensive quality gates.

[Documentation](./README.md#documentation) • [Quick Start](./docs/quick-start.md) •
[Architecture](./docs/architecture-overview.md) • [Python Integration](./docs/python-integration.md) •
[Contributing](./README.md#contributing) • [Packages](./README.md#packages)

---

## 📊 Quality Gate & Metrics

Strict quality enforcement with automated tracking:

| Metric | PR Gate (BLOCKER) | Aspirational Target |
|--------|------------------|---------------------|
| **Branch Coverage** | ≥65% | 90% |
| **Mutation Score** | ≥75% | 90% |
| **Line Coverage** | - | 95% |

**Check locally:** `pnpm quality:gate`

**[Full documentation →](./docs/quality-gates.md)** - Learn about metrics tracking, badge generation, mutation testing, and troubleshooting.

## Overview

Cortex-OS is a production-ready **Autonomous Software Behavior Reasoning (ASBR)
Runtime** enabling AI agents to collaborate through event-driven architecture
and Model Context Protocol (MCP) integrations. The system implements strict
governance boundaries, comprehensive testing, and security practices.

### 🎯 Key Features

- **🤖 AI Agent Orchestration** – Multi-agent workflows with A2A communication
- **🧠 Multimodal AI Processing** – Comprehensive support for images, audio, PDFs with OCR, vision analysis, and cross-modal search
- **🔍 Advanced RAG System** – Retrieval-Augmented Generation with unified embeddings and citation tracking
- **🔌 MCP Integration** – Standardized tool integration via MCP with FastMCP v3 advanced features
- **🛡️ Security First** – OWASP compliance, OAuth 2.1 + PKCE, SBOM generation, vulnerability scanning
- **📊 Comprehensive Observability** – OpenTelemetry instrumentation, monitoring, tracing, analytics hooks
- **🏗️ Governed Architecture** – Import boundaries (ESLint + Nx), strict architectural rules
- **🧪 Quality Gates & TDD** – 95/95 coverage targets, mutation testing ≥80%, automated TDD coach integration
- **🚀 Production Ready** – Docker deployment, CI/CD pipelines, health checks, graceful shutdown
- **🎯 Reality Filter** – Truthfulness verification and accuracy validation for all AI agents

---

## Quick Start (Condensed)

See the full guide: [docs/quick-start.md](./docs/quick-start.md)

```bash
git clone https://github.com/jamiescottcraik/Cortex-OS.git
cd cortex-os

# Run automated setup (installs deps, auto-trusts mise, sets up hooks, lints, validates structure)
./scripts/dev-setup.sh

# Bootstrap governance (Required for governance tools)
pnpm cortex:governance-bootstrap

# For a minimal setup with lightweight hooks:
# ./scripts/dev-setup.sh --minimal

# Optional: customize workspace home (defaults to ~/.Cortex-OS)
export CORTEX_OS_HOME="$HOME/.Cortex-OS"

# Verify installation
pnpm readiness:check
pnpm dev
```

Helpful:

```bash
pnpm build
pnpm test:coverage
pnpm security:scan
pnpm structure:validate
pnpm test:integration:langgraph   # LangGraph integration harness suite

# Husky-only hooks
# Manually run a quick pre-commit equivalent if needed:
pnpm biome:staged  # format + lint staged files
pnpm test:safe     # safe, minimal tests
```

### Workspace filter convention

Use **package names**, not relative paths, when targeting projects with pnpm filters. For the Cortex OS runtime app, run:

```bash
pnpm --filter @apps/cortex-os dev
pnpm --filter @apps/cortex-os test
```

## Governance Tools

### Memory Management
- **Memorize Command**: `.cortex/commands/memorize.mjs`
  - Stores task context and decisions into the local memory system.
  - Usage: `node .cortex/commands/memorize.mjs [slug]`

### Templates
- **Adapter Template**: `.cortex/templates/adapter.template.ts` - For creating new integration adapters.


## Architecture Snapshot

### High-Level Architecture

Cortex-OS is a governed monorepo implementing a unified memory architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Clients                                  │
├──────────┬──────────┬──────────┬──────────┬───────────────┤
│ Claude   │ ChatGPT  │ VS Code  │ Editors  │ Others        │
│ Desktop  │          │          │          │               │
└─────┬────┴─────┬────┴─────┬─────┬─────┬─────┬───────┘
      │          │          │     │     │     │
      │ STDIO    │ HTTP/    │ HTTP/│     │     │
      │ (stdio)  │ stream   │ stream│     │     │
      │          │ (sse)    │ (poll)│     │     │
┌─────▼─────┐  ┌─▼───────────────────────▼─────┐ ┌───▼───┐
│ cortex-   │  │          cortex-mcp         │ │Tools  │
│ os (app)  │  │        (MCP Server)         │ │mount  │
└───────────┘  └─────┬────────────────────┬────┘ └───────┘
                      │                    │
                ┌─────▼─────┐        ┌─────▼─────┐
                │ rest-api  │        │ agent-    │
                │ (gateway) │        │ toolkit   │
                └───────────┘        └───────────┘
                      │                    │
                      └────────┬───────────┘
                               │
                    ┌──────────▼──────────┐
                    │     memory-core    │
                    │   (Single Source   │
                    │      of Truth)     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Storage Layer    │
                    │  SQLite + Qdrant    │
                    └─────────────────────┘
```

### Core Principles

- **Single Source of Truth** - `memory-core` contains all business logic
- **Thin Adapter Pattern** - MCP, REST, and agent-toolkit adapters delegate to `memory-core`
- **Event-Driven Architecture** - All operations emit A2A events for observability
- **Transport Agnostic** - Supports STDIO, HTTP/streamable, and REST access patterns
- **Governed Boundaries** - Strict import validation and architectural rules

### Key Components

- **UI + runtime apps** mount feature packages via dependency injection
- **Feature packages** communicate via **A2A events** and **MCP tools**
- **Contracts + schemas** in `libs/typescript/contracts`
- **Governance rules & structure validation** in `.cortex/`
- **Agent-Toolkit integration** with tools path resolution prioritizing `$HOME/.Cortex-OS/tools/agent-toolkit`

More detail: [Architecture Overview](./docs/architecture-overview.md) • Full reference: [architecture.md](./docs/architecture.md)

---

## Python Integration (Instructor + Ollama)

Structured LLM usage standardized via `cortex_ml.instructor_client` with
Instructor + Ollama (OpenAI-compatible). Deterministic defaults
(`temperature=0.0`, `seed=42`).

Full guide: [Python Integration](./docs/python-integration.md)

---

## Documentation

### 📚 Core Documentation

- **[Architecture Guide](./docs/architecture.md)** – System design and patterns
- **[Architecture Overview](./docs/architecture-overview.md)** – High-level summary
- **[Quick Start](./docs/quick-start.md)** – Fast setup path
- **[Python Integration](./docs/python-integration.md)** – Instructor + Ollama
- **[Deployment Guide](./docs/deployment.md)** – Production deployment
- **[Security Guide](./docs/security.md)** – Security practices and compliance
- **[Streaming Modes](./docs/streaming-modes.md)** – Token, aggregated, and JSON streaming (CLI + config)
- **[Changelog](./CHANGELOG.md)** – Release notes and feature updates

### 🛠️ Development Documentation

- **[Development Setup](./docs/development-setup.md)** – Local environment
- **[Testing Guide](./docs/testing.md)** – Strategies and practices
- **[ADR-004: Node 24 Active LTS](./docs/architecture/decisions/004-node-24-active-lts.md)** – Runtime baseline & upgrade playbook
- **[Contributing Guide](./CONTRIBUTING.md)** – How to contribute
- **[Code of Conduct](./CODE_OF_CONDUCT.md)** – Community guidelines
- **[Memory Tuning Guide](./docs/memory-tuning.md)** – Current temporary workspace memory mitigation
- **Policy Hot Reload (Structure Guard)** – Runtime dynamic policy updates. Integration & events:
  [simple-tests/README.md#policy-hot-reload-structure-guard](./simple-tests/README.md#policy-hot-reload-structure-guard)

### 📖 Package Documentation

| Package            | Description                  | Documentation                                   |
| ------------------ | ---------------------------- | ----------------------------------------------- |
| `cortex-ai-github` | AI-powered GitHub automation | [README](./packages/cortex-ai-github/README.md) |
| `cortex-code`      | Terminal user interface      | [README](./apps/cortex-code/README.md)          |
| `cortex-webui`     | Modern web dashboard         | [README](./apps/cortex-webui/README.md)         |
| `a2a`              | Agent-to-agent communication | [README](./packages/a2a/README.md)              |
| `mcp`              | Model Context Protocol       | [README](./packages/mcp/README.md)              |
| `memory-core`      | State management & local memory | [README](./packages/memory-core/README.md)      |
| `rag`              | Retrieval-Augmented Generation | [README](./packages/rag/README.md)              |
| `orchestration`    | Multi-agent workflows        | [README](./packages/orchestration/README.md)    |
| `tdd-coach`        | Test-driven development tools | [README](./packages/tdd-coach/README.md)        |

---

## Packages

### 🤖 AI & Automation

- **[cortex-ai-github](./packages/cortex-ai-github/)** – GitHub automation
- **[agents](./packages/agents/)** – Core AI agent behaviors
- **[rag](./packages/rag/)** – Retrieval-Augmented Generation pipeline
- **[orchestration](./packages/orchestration/)** – Multi-agent workflows

### 🔌 Communication & Integration

- **[a2a](./packages/a2a/)** – JSON-RPC 2.0 agent messaging
- **[mcp](./packages/mcp/)** – Model Context Protocol integration
- **[mcp-bridge](./packages/mcp-bridge/)** – MCP transport bridge
- **[mcp-registry](./packages/mcp-registry/)** – MCP plugin registry

### 💾 Data & Memory

- **[memory-core](./packages/memory-core/)** – Unified state management (Neo4j/Qdrant)
- **[registry](./packages/registry/)** – Service registry and discovery
- **[mvp](./packages/mvp/)** – MVP core functionality

### 🛡️ Security & Quality

- **[security](./packages/security/)** – OWASP compliance and mTLS
- **[simlab](./packages/simlab/)** – Simulation test environment
- **[contracts](./libs/typescript/contracts/)** – Type-safe contracts

### 🖥️ User Interfaces

- **[cortex-os](./apps/cortex-os/)** – Runtime application
- **[cortex-code](./apps/cortex-code/)** – Terminal UI & command-line tooling (successor to cortex-cli)
- **[cortex-webui](./apps/cortex-webui/)** – Web dashboard

---

## Development & Quality Gates (Summary)

### 🔁 Streaming Modes (CLI Summary)

The CLI and runtime support flexible model output streaming with strict precedence control.

- Default behavior: token deltas streamed to stdout
- Aggregated final output: use `--aggregate` (or set config `stream.mode = "aggregate"`)
- Force token streaming when aggregate is configured: `--no-aggregate`
- JSON event streaming for programmatic consumption: `--json` (alias) or `--stream-json` (emits events: `delta`, `item`, `completed`)
- Precedence: CLI flag > environment (`CORTEX_STREAM_MODE`) > config file > internal default
- Install workspace git hooks with `pnpm dlx husky install` (also runs automatically during `pnpm install`, but re-run this command if hooks are missing).

See full spec & examples: [Streaming Modes Documentation](./docs/streaming-modes.md)

```bash
pnpm lint               # Smart Nx lint (changed scope; quality profile)
pnpm lint:security      # ESLint security profile (opt-in)
pnpm test:coverage      # 90% coverage threshold
pnpm security:scan      # Semgrep OWASP profiles
pnpm structure:validate # Governance/import rules
pnpm nx graph           # Dependency visualization
scripts/list-rust-editions.sh -e 2024  # Audit crates pinned to Rust 2024 edition
scripts/cleanup-duplicate-configs.sh   # Remove/consolidate duplicate config files
```

> `pnpm lint` now routes through the smart Nx wrapper for faster, scope-aware linting. Run `pnpm lint:security` when you need the security-focused ESLint profile.

> **Latest:** Improved streaming modes with unified `--stream-mode` flag, JSON schema validation,
> and comprehensive automation examples. See [`docs/streaming-modes.md`](./docs/streaming-modes.md).

### Offline-by-default network policy

- Tests run with outbound sockets disabled; only loopback hosts (`localhost`, `127.0.0.1`, `::1`) are allowlisted by default.
- Extend the allowlist for staged targets by exporting `TEST_NETWORK_EXTRA_HOSTS=staging.example.com,api.staging.example.com` before running suites; the shared guard logs structured events for every block.
- Temporary live-network spikes require maintainer-approved waivers plus `ALLOW_TEST_NETWORK=1` and should execute via the manual **Network Smoke** workflow (`.github/workflows/network-smoke.yml`) with the waiver ID recorded.
- Remove `TEST_NETWORK_EXTRA_HOSTS` entries and clear `ALLOW_TEST_NETWORK` immediately after the spike so CI keeps blocking outbound calls.
- Reusable workflows such as `quality-gates.yml` export `ALLOW_TEST_NETWORK=1` for non-test steps (builds, diff guards, artifact uploads) when the caller leaves the new `allow-non-test-network` input at its default (`true`). Set the input to `false` when a consumer wants every step to inherit the sandbox without forking the workflow.
- The `tdd-coach` CLI exposes `--allow-test-network` to flip the override for a single validation run; it emits start/end warnings and restores the previous value automatically so local shells stay hardened.
- Nightly telemetry runs (`.github/workflows/network-override-report.yml`) publish JSON summaries of every CI run that set `ALLOW_TEST_NETWORK`; see [`docs/ops/network-observability.md`](./docs/ops/network-observability.md) for usage.
- When you need an approved live-network check, schedule it in a dedicated job that sets `ALLOW_TEST_NETWORK=1`, list the waiver or approval link in the job summary, and ensure teardown hooks run after the suite to restore the default sandbox.

### 🧪 Coverage & Mutation Badges

Badges are generated locally and (optionally) committed so the README can reference static SVGs:

```bash
# Record branch coverage sample and generate badges
pnpm coverage:branches:record
pnpm badges:generate

# Run mutation tests, enforce threshold, then regenerate badges
pnpm mutation:enforce
pnpm badges:generate

# TDD Coach integration for real-time validation
make tdd-setup
make tdd-validate
make tdd-watch
```

Scripts:

| Script | Purpose |
| ------ | ------- |
| `coverage:branches:record` | Run coverage + append branch % to history file |
| `coverage:branches:report` | Show branch coverage trend |
| `coverage:branches:enforce` | Fail if branch coverage < 65% (env `BRANCH_MIN` override) |
| `mutation:test` | Run Stryker mutation tests (targeted scope) |
| `mutation:enforce` | Run Stryker then enforce `MUTATION_MIN` (default 75%) |
| `mutation:badges` | Run Stryker then generate both badges |
| `badges:generate` | Generate SVG badges from existing reports |

Outputs:

- Branch coverage history: `reports/branch-coverage-history.json`
- Mutation report JSON: `reports/mutation/mutation.json`
- Badges: `reports/badges/{branch-coverage.svg,mutation-score.svg}`
- Metrics JSON (for Pages / API): `reports/badges/metrics.json`

Nightly workflow (`badge-refresh.yml`) regenerates coverage, mutation score, badges, and publishes a
GitHub Pages artifact (includes `index.html`, badges, and `metrics.json`). This enables low‑latency
cached badge rendering while allowing programmatic consumption of the combined metrics at:

```text
https://<github-user>.github.io/Cortex-OS/metrics.json
```

Example JSON shape:

```json
{
  "branchCoverage": 92.31,
  "mutationScore": 76.45,
  "generatedAt": "2025-09-14T02:17:12.345Z"
}
```

To manually refresh locally (e.g., before pushing a quality improvements PR):

```bash
pnpm coverage:branches:record
pnpm mutation:enforce  # ensures threshold >= 75%
pnpm badges:generate
git add reports/badges reports/branch-coverage-history.json reports/mutation/mutation.json
git commit -m "chore(badges): manual refresh" && git push
```

CI Workflows:

- `ci-smoke-micro-edge.yml` – fast heuristic & negative-path guard (<5s)
- `ci-mutation-guard.yml` – mutation score enforcement (`MUTATION_MIN`)

Adjust thresholds via env overrides in CI if needed.

---

## 🔋 Memory Management & Agent Guidance

This repository experienced a transient spike in memory usage during
`pnpm install` and concurrent Nx tasks. A focused, reversible mitigation
set is in place. Agents (LLMs, automation scripts) and developers must
respect these constraints until the baseline is declared stable.

### Implemented Mitigations (Active)

| Layer | Change | File | Purpose | Revisit When |
|-------|--------|------|---------|--------------|
| pnpm  | `childConcurrency: 2` | `pnpm-workspace.yaml` | Limit simultaneous lifecycle scripts | After two stable low-RSS installs |
| pnpm  | `useNodeVersion: 24.8.0`, `engineStrict: true` | `pnpm-workspace.yaml` | Avoid duplicate toolchains / watchers | If multi-version testing required |
| Nx    | `parallel: 1`, `maxParallel: 1` | `nx.json` | Serialize heavy tasks to lower peak | When memory plateau acceptable |
| Graph | Added `.nxignore` patterns | `.nxignore` | Reduce hashing + watcher churn | If excluded dirs become needed |
| Tool  | Memory sampler script | `scripts/sample-memory.mjs` | Consistent RSS / heap telemetry | Likely keep (low overhead) |

See [ADR 004: Adopt Node.js 24 Active LTS](./docs/architecture/decisions/004-node-24-active-lts.md) for the toolchain rationale and rollout playbook.

Full detail & rollback: **[Memory Tuning Guide](./docs/memory-tuning.md)**.

### Required Behaviors (Agents & Devs)

1. Do **not** raise Nx parallelism or remove `childConcurrency` without two
  comparative sampler runs (before vs after).
2. Always sample during bulk ops: `node scripts/sample-memory.mjs --tag <label> \
  --out .memory/<label>.jsonl -- pnpm <command>`.
3. Prefer incremental refactors—avoid unnecessary workspace-wide rebuilds.
4. Large dependency PRs: include sampler diff (pre/post install) + rationale.
5. Agents must use `@cortex-os/agent-toolkit` `multiSearch` instead of raw
  recursive greps to minimize IO storms.

### Quick Sampling Examples

Install (cold):

```bash
rm -rf node_modules .pnpm-store
node scripts/sample-memory.mjs --tag install-cold --interval 1500 --out .memory/install-cold.jsonl -- pnpm install
```

Focused build:

```bash
node scripts/sample-memory.mjs --tag build --interval 2000 --out .memory/build.jsonl -- pnpm nx run cortex-os:build
```

Tail peak candidate:

```bash
awk '{print $0}' .memory/build.jsonl | jq '.rssMB' | sort -n | tail -1
```

### Escalation Criteria

Open an issue titled `perf(memory): escalation` if ANY:

- Peak RSS > 2.5x baseline after a small dependency addition
- Sustained upward drift across three comparable runs
- Install > 15 min wall time with unchanged dependency graph

### Rollback (Condensed)

See full guide, but nominally:

```bash
sed -i.bak 's/"parallel": 1/"parallel": 2/' nx.json
sed -i.bak 's/"maxParallel": 1/"maxParallel": 2/' nx.json
# Edit pnpm-workspace.yaml to remove childConcurrency/useNodeVersion/engineStrict if justified
```

### Future (Optional)

- Add automated peak parser to CI summary
- Enforce memory budget via sentinel script (fail if > threshold)
- Integrate flamegraphs for largest builds

---

### 🛡️ Code Quality & Security Automation

This repository enforces a layered quality model combining fast local feedback, pre-push hard gates, and CI/PR decoration:

| Layer             | Scope             | Tools                                                                                                     | Failing Effect                    |
| ----------------- | ----------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Pre-commit (fast) | Staged files only | Biome/ESLint formatting, minimal lint, pattern guard, `.env` presence check                               | Blocks commit (fix immediately)   |
| Pre-push (full)   | Entire workspace  | Typecheck (TS/py), Ruff, Semgrep focused profiles, tests + coverage, structural governance                | Blocks push (stops degraded code) |
| CI Workflows      | Trusted baseline  | Semgrep SARIF (OWASP + LLM + Top 10), optional SonarCloud, structure validation, license + security scans | Blocks merge via required checks  |

### 🧪 TDD Enforcement

This repository enforces Test-Driven Development practices using the TDD Coach package:

| Layer          | Scope         | Tools                  | Failing Effect                     |
| -------------- | ------------- | ---------------------- | ---------------------------------- |
| Development    | Real-time     | TDD Coach Watch Mode   | Immediate feedback in IDE          |
| Pre-commit     | Staged files  | TDD Coach Validation   | Blocks non-TDD compliant commits   |
| CI/CD Pipeline | Pull requests | TDD Coach Status Check | Blocks merge of non-compliant code |

To enforce TDD practices:

```bash
# Set up TDD Coach
make tdd-setup

# Check current TDD status
make tdd-status

# Validate specific files
make tdd-validate FILES="src/file1.ts src/file2.ts"

# Run in watch mode during development
make tdd-watch
```

See [TDD Enforcement Guide](./docs/tdd-enforcement-guide.md) for detailed instructions.

#### Semgrep Usage

Baseline (captures current state – do NOT run casually unless intentionally resetting):

```bash
pnpm security:scan:baseline   # writes reports/semgrep-baseline.json
```

Diff against baseline (local developer check before large refactors / PR polish):

```bash
pnpm security:scan:diff       # generates current + compares; exits non-zero on NEW findings
```

CI pipeline runs (excerpt):

```bash
pnpm security:scan:ci         # produces JSON report consumed for SARIF conversion
```

Reports directory structure (examples):

```text
reports/
  semgrep-baseline.json   # canonical baseline – versioned in repo if approved
  semgrep-current.json    # transient diff artefact
  semgrep-results.json    # CI raw scan output
```

#### SonarCloud (Optional)

`sonar-project.properties` config exists at repo root. CI workflow (`sonar.yml`) performs:

1. Install + cache dependencies
2. Run tests & collect coverage
3. Invoke Sonar scanner for PR decoration + quality gate

To disable: delete the workflow or restrict with a branch condition.

#### Common Commands

```bash
pnpm lint:all             # Full lint suite across workspace
pnpm security:scan        # Focused Semgrep (primary OWASP profile)
pnpm security:scan:all    # Expanded profiles (OWASP + LLM + MITRE ATLAS)
pnpm security:scan:diff   # New issues vs baseline only
pnpm test:coverage        # Enforces 90%+ threshold
pnpm structure:validate   # Governance / import boundary integrity
```

#### Developer Workflow Tips

- Keep baseline churn intentional – treat resets as mini change-control events.
- Prefer suppressions (`// semgrep-disable-next-line <rule-id>`) with justification comments.
- Run `pnpm security:scan:diff` before pushing if you touched risky surfaces (auth, network, dynamic exec, file IO).
- Use `nx graph` to visualize dependency impact of refactors prior to wide code moves.
- Use the canonical variable catalog in `.env.example`; keep the tracked `.env` scrubbed
  (no real secrets) and load real values via untracked overlays or a secret manager.

Further detail: see [`SECURITY.md`](./SECURITY.md) and future `docs/code-quality.md` (placeholder to expand if needed).

---

## 🚀 CI/CD Workflows Architecture

Modern, reusable GitHub Actions with 60% faster setup and improved caching:

**Core Workflows:**
- `quality-gates.yml` - PR quality checks (lint, typecheck, tests)
- `security-modern.yml` - Security scanning (CodeQL, Semgrep, secrets)
- `supply-chain-security.yml` - SBOM generation, vulnerability assessment

**Scheduled:**
- `scheduled-lint.yml` - 3x daily governance checks
- `nightly-quality.yml` - Coverage tracking and metrics
- `deep-security.yml` - Weekly comprehensive scans

**[Full documentation →](./docs/ci-cd-workflows.md)** - Learn about workflow categories, migration benefits, caching strategies, and troubleshooting.

---

## Automated Linting & Scheduled Quality Runs

In addition to on-demand commands and the existing **nightly quality** workflow, the repository includes a **scheduled lint** workflow: `scheduled-lint.yml`.

### Schedule

Runs three times daily at 10:00, 14:00, and 20:00 UTC (GMT). You can also trigger it manually via the Actions tab.

### Workflow Steps

| Phase             | Command                      | Purpose                                               |
| ----------------- | ---------------------------- | ----------------------------------------------------- |
| Biome (changed)   | `pnpm biome:ci`              | Fast style + formatting validation                    |
| ESLint (quality)  | `pnpm lint:quality`          | Core quality & import rules                           |
| ESLint (security) | `pnpm lint:security`         | Security-focused rules (sonarjs, boundaries)          |
| Ruff (Python)     | `pnpm python:lint`           | Python style & lint consistency                       |
| Structure         | `pnpm structure:validate`    | Enforces architecture governance                      |
| Pattern Guard     | `pnpm lint:ripgrep:hardened` | Detects secrets, debug statements, forbidden patterns |
| AST Policy        | `pnpm lint:ast-grep:check`   | Enforces structural AST policies                      |

All steps soft-fail (`|| true`) to ensure an aggregated summary; review logs for violations.
Promote to hard failure by removing `|| true` once baseline is clean.

### Local Parity

```bash
pnpm lint:all            # Aggregated lint suite
pnpm structure:validate  # Governance integrity
# Manual pre-commit equivalent (Husky hooks run automatically on commit)
pnpm biome:staged  # format + lint staged files
pnpm test:safe     # quick, low-risk tests
```

### Future Enhancements (Optional)

1. Open an issue automatically if violations increase week-over-week.
2. Upload SARIF for AST-Grep + pattern guard to unify security dashboards.
3. Persist weekly lint trend JSON similar to coverage trend.

---

## Contributing

We welcome contributions! See the [Contributing Guide](./CONTRIBUTING.md) for details.

Quick Flow:

1. Fork
2. Branch: `git checkout -b feature/awesome`
3. Implement + tests + docs
4. `pnpm lint && pnpm test`
5. Commit & push
6. Open PR (follows template)

---

## License

Apache-2.0 – see [LICENSE](./LICENSE)

---

## Support

- **📧 Email**: <support@cortex-os.dev>
- **💬 Discussions**: [GitHub Discussions](https://github.com/jamiescottcraik/Cortex-OS/discussions)
- **🐛 Issues**: [GitHub Issues](https://github.com/jamiescottcraik/Cortex-OS/issues)
- **📖 Documentation**: <https://docs.cortex-os.dev>

---

## Acknowledgments

- Model Context Protocol (MCP)
- A2A event-driven agent patterns
- OWASP & MITRE guidance
- OpenAI + Instructor ecosystem

---

Built with ❤️ by the Cortex-OS Team

<!-- markdownlint-disable MD013 -->

![GitHub Stars](https://img.shields.io/github/stars/jamiescottcraik/Cortex-OS?style=social) ![GitHub Forks](https://img.shields.io/github/forks/jamiescottcraik/Cortex-OS?style=social) ![GitHub Issues](https://img.shields.io/github/issues/jamiescottcraik/Cortex-OS) ![GitHub PRs](https://img.shields.io/github/issues-pr/jamiescottcraik/Cortex-OS)

<!-- markdownlint-enable MD013 -->

## Submodules

This repository uses `git submodule` for certain external, read-only references.

Currently included:

| Path                    | Upstream                              | Purpose                                                                                            |
| ----------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `external/openai-codex` | <https://github.com/openai/codex.git> | Reference implementation; selectively copy patterns (no direct cross-imports in governed domains). |

See overlay governance guide: [openai-codex overlay](./docs/submodules/openai-codex.md)

### Working With Submodules

Clone (including submodules):

```bash
git clone --recurse-submodules https://github.com/jamiescottcraik/Cortex-OS.git
```

If you already cloned without `--recurse-submodules`:

```bash
git submodule update --init --recursive
```

Pull latest (root + all submodules):

```bash
git pull --recurse-submodules
# Or explicitly
git submodule update --remote --merge
```

Inspect status:

```bash
git submodule status
```

Pin a submodule to a newer upstream commit:

```bash
cd external/openai-codex
git fetch origin
git checkout <new-commit-or-tag>
cd -
git add external/openai-codex
git commit -m "chore(submodule): bump openai-codex to <sha>"
```

Remove a submodule (example for `external/openai-codex`):

```bash
git submodule deinit -f external/openai-codex
rm -rf .git/modules/external/openai-codex
git rm -f external/openai-codex
# Edit .gitmodules if other entries remain
```

> Governance: Do **not** import submodule code directly across feature boundaries.
> Copy needed snippets into governed packages and add tests + attribution.

## MCP developer helpers

This repository includes a couple of small helper scripts to make Model Context Protocol (MCP)
local development more reproducible across machines.

- `tools/mcp/wrap_local_memory.sh` — a repo-local wrapper that locates an installed `local-memory`
  binary (or respects `LOCAL_MEMORY_BIN`), then execs it with the forwarded arguments. The VS Code
  MCP configuration is set to call this wrapper so maintainers don't need to hardcode user-specific
  absolute paths.

- `tools/mcp/check_mcp_paths.sh` — a small diagnostic script that verifies the presence of an
  executable `local-memory` and the Node MCP server bin `packages/mcp-server/bin/mcp-server.js`.

Quick checks:

```bash
# Run the environment diagnostic (exit 0 on success)
./tools/mcp/check_mcp_paths.sh

# If your local-memory binary is installed in a non-standard location, set the override:
LOCAL_MEMORY_BIN=/custom/path/local-memory ./tools/mcp/check_mcp_paths.sh

# The wrapper is used automatically by VS Code via .vscode/mcp.json. You can also run it directly:
./tools/mcp/wrap_local_memory.sh --mcp
```

If you run into issues, the diagnostic script prints actionable hints. For CI or non-interactive
environments set `LOCAL_MEMORY_BIN` to the absolute binary path.

## Port Configuration

Cortex-OS uses several ports for different services. See `ports.env` for the complete list:

### MCP Ports
- **Pieces OS**: `39300` - Pieces MCP server (required for Pieces CLI integration)
- **Cortex MCP**: `3023` - Main Cortex-OS MCP server
- **Memory MCP**: `3024` - Local memory MCP server with Cloudflare tunnel access
  - Cloudflare tunnel: https://cortex-mcp.brainwav.io
  - External integrations connect via the tunnel URL
- **MCP Health**: `3025` (default) - Express health endpoint powered by the Node hub (`MCP_HEALTH_PORT` overrides)
- **Memory API**: `3002` - Local memory REST API

### Core Services
- **Cortex Runtime**: `3000` - Main runtime server
- **WebUI Backend**: `3001` - Web application backend
- **WebUI Frontend**: `5173` - Development server

### Quick Port Check

```bash
# Verify all required ports are available
./scripts/system/check-port-conflicts.sh

# Check if Pieces OS is running on its port
lsof -i :39300

# Check if MCP server is running and accessible via tunnel
curl -I http://localhost:3024/health
curl -I https://cortex-mcp.brainwav.io/health
```

### External MCP Integration

For external integrations (ChatGPT, Claude Desktop, VS Code, Cursor):

- **Local Development**: Connect to `http://localhost:3024`
- **External Access**: Connect via Cloudflare tunnel: `https://cortex-mcp.brainwav.io`
- **Authentication**: Configure with MCP tokens or API keys as needed

### Pieces CLI Setup

The Pieces CLI provides access to Pieces OS Long-Term Memory (LTM):

```bash
# Install Pieces CLI
bash ./scripts/install-pieces-cli.sh

# Enable Pieces MCP integration
export PIECES_MCP_ENABLED=true

# Run Pieces CLI
pieces run --ignore-onboarding
```

See `docs/pieces-cli-installation.md` for complete setup instructions.

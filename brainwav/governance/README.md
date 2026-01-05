# Agentic Governance Framework

## Table of Contents

- [Packaging](#packaging)
- [Core + Packs + Adapters](#core-packs-adapters)
- [📂 Directory Structure](#directory-structure)
- [🚀 Quick Start](#quick-start)
  - [For Engineers & Agents](#for-engineers-agents)
  - [For Reviewers](#for-reviewers)
  - [For Maintainers](#for-maintainers)
  - [For Adopters](#for-adopters)
- [📚 Core Documents (00-core/)](#core-documents-00-core)
  - [constitution.md](#constitutionmd)
  - [AGENT_CHARTER.md](#agentchartermd)
  - [RULES_OF_AI.md → AGENT_CHARTER.md](#rulesofaimd-agentchartermd)
- [🔄 Workflow Documents (10-flow/)](#workflow-documents-10-flow)
  - [governance-quickstart.md](#governance-quickstartmd)
  - [agentic-coding-workflow.md](#agentic-coding-workflowmd)
  - [cortex-aegis.md](#cortex-aegismd)
- [✅ Quality Checklists (20-checklists/)](#quality-checklists-20-checklists)
  - [checklistsgovernance-os.md](#checklistsgovernance-osmd)
  - [Legacy checklist files](#legacy-checklist-files)
- [⚙️ Infrastructure Files (90-infra/)](#infrastructure-files-90-infra)
  - [governance-index.json](#governance-indexjson)
  - [generated/](#generated)
  - [governance-maintainers.md](#governance-maintainersmd)
  - [GOVERNANCE_HASH_UPDATE.md → governance-maintainers.md](#governancehashupdatemd-governance-maintainersmd)
  - [structure-guard.json](#structure-guardjson)
  - [export-freeze.snapshot.json](#export-freezesnapshotjson)
  - [dependency-cruiser-memory.cjs](#dependency-cruiser-memorycjs)
- [🔄 Document Lifecycle](#document-lifecycle)
  - [Precedence Order](#precedence-order)
  - [Recent Consolidations (2025-11-22)](#recent-consolidations-2025-11-22)
- [🔧 Common Tasks](#common-tasks)
  - [Finding the Right Document](#finding-the-right-document)
  - [Making Changes](#making-changes)
- [📖 External References](#external-references)
  - [Related Root Documents](#related-root-documents)
  - [Related Documentation](#related-documentation)
- [🆘 Getting Help](#getting-help)
  - [Document Questions](#document-questions)
  - [Emergency Governance Issues](#emergency-governance-issues)
- [🏢 Project-Specific Governance](#project-specific-governance)
  - [Project Governance Contacts](#project-governance-contacts)
  - [Project-Specific Channels](#project-specific-channels)
  - [Local Governance Additions](#local-governance-additions)
  - [Project Document Registry](#project-document-registry)


**Status**: Canonical governance structure  
**Last Updated**: 2026-01-01  
**Maintainers**: brAInwav Development Team

---

## Packaging
- Source anchors: keep `<!-- PACK:key=value -->` markers in governance docs so pack builds stay in sync.
- Mapping: see `90-infra/governance-pack.map.yaml` for anchor -> field mapping used by tooling.
- Build: `governance-pack/dist/` is committed and used by CI/agents; update it when pack sources change.

## Core + Packs + Adapters

- **Core**: mandatory policy (AGENTS, step budget, Evidence Triplet, hash index, AI risk controls).
- **Packs**: opt-in capability bundles (`governance-pack/packs/*`). Includes `sdd` (spec -> plan -> tasks).
- **Adapters**: GitHub Actions templates and stack-specific command mappings.

Control catalog lives in `90-infra/control-registry.core.yaml` with schema validation in `90-infra/control-registry.schema.json`.
Standards versions are pinned in `90-infra/standards.versions.json`.

**Portfolio drift control**: All repos using pointer mode MUST pin the same governance major/minor version.
Use Renovate/Dependabot (or equivalent) to keep the fleet aligned; drift beyond one minor requires a waiver.

## 📂 Directory Structure

The governance directory is organized by purpose and audience:

```
brainwav/governance/
├── 00-core/           # Foundational law (constitution, charters, core rules)
├── 10-flow/           # Operational workflows (how to work)
├── 20-checklists/     # Quality validation (gate checks, reviews)
└── 90-infra/          # Machine-readable files (indexes, schemas, config)
```

---

## 🚀 Quick Start

### For Engineers & Agents

**Start here**: [`10-flow/governance-quickstart.md`](./10-flow/governance-quickstart.md)

This single document provides:

- 5 canonical workflows (Feature, Research, Fix, Refactor, Review)
- Role-to-gate mapping
- Entry points to all other governance docs

### For Reviewers

**Primary reference**: [`20-checklists/checklists.md`](./20-checklists/checklists.md)

Unified checklist source covering:

- Local development checks
- PR author responsibilities
- Code review criteria
- CI validation gates
- ArcTDD gate-specific checklists

### For Maintainers

**Infrastructure guide**: [`90-infra/governance-maintainers.md`](./90-infra/governance-maintainers.md)

### For Adopters

**Recommended path**: [`10-flow/governance-quickstart.md`](./10-flow/governance-quickstart.md) → [`docs/documentation-governance.md`](./docs/documentation-governance.md)

Comprehensive guide for:

- Hash sync procedures
- Infrastructure file purposes
- Document lifecycle management
- Emergency procedures

---

## 📚 Core Documents (00-core/)

### constitution.md

The supreme governing document defining:

- Core values and principles
- Governance structure
- Amendment procedures
- Conflict resolution

### AGENT_CHARTER.md

Complete specification for AI agent behavior:

- ArcTDD guardrails (Step Budget, Ask-First, Proof Required, etc.)
- AI Behavioral Rules (consolidated from RULES_OF_AI.md)
- Evidence Triplet requirements
- Service identity logging standards

### RULES_OF_AI.md → AGENT_CHARTER.md

**Status**: Consolidated stub pointing to AGENT_CHARTER.md

---

## 🔄 Workflow Documents (10-flow/)

### governance-quickstart.md

**Entry point** for all governance navigation:

- Quick workflow selection
- Gate overview
- Role matrices
- Links to detailed docs

### agentic-coding-workflow.md

Detailed operational specification:

- ArcTDD gates G0–G10
- 5 canonical flows with step-by-step guidance
- Task folder structure requirements
- Repo Prompt integration points
- Evidence requirements

### cortex-aegis.md

Assurance system documentation:

- When to invoke Cortex-Aegis
- Academic research integration
- Time Freshness Policy
- MCP tool usage patterns

---

## ✅ Quality Checklists (20-checklists/)

### checklistsgovernance-os.md

**Single canonical source** for all validation criteria:

- Local development checks
- PR author checklist
- Code review checklist
- CI validation requirements
- ArcTDD gate-specific checklists
- Cortex-Aegis integration checklist

### Legacy checklist files

**Status**: Converted to stubs pointing to unified checklistsgovernance-os.md

- CHECKLISTgovernance-os.md
- ci-review-checklists.md
- code-review-checklist.md

---

## ⚙️ Infrastructure Files (90-infra/)

### governance-index.json

Canonical registry of governance documents with SHA-256 hashes and precedence order.

### generated/

Machine-generated views from control catalog and other policy sources (do not edit directly).

### governance-maintainers.md

Complete maintainer guide consolidating:

- Hash update procedures (from GOVERNANCE_HASH_UPDATE.md)
- Infrastructure file purposes
- Troubleshooting
- Emergency procedures

### GOVERNANCE_HASH_UPDATE.md → governance-maintainers.md

**Status**: Consolidated stub pointing to comprehensive maintainers guide

### structure-guard.json

File system structure validation rules.

### export-freeze.snapshot.json

Dependency graph snapshot for import/export validation.

### dependency-cruiser-memory.cjs

Dependency cruiser configuration for memory-related packages.

---

## 🔄 Document Lifecycle

### Precedence Order

When documents overlap or conflict, the **precedence list** in
`brainwav/governance/90-infra/governance-index.json` is authoritative:

1. **00-core/constitution.md** (supreme law)
2. **00-core/AGENT_CHARTER.md** (agent behavior & rules)
3. **10-flow/** documents (operational workflows)
4. **20-checklists/** documents (quality gates)
5. **30-compliance/** documents (regulatory requirements)
6. **CODESTYLE.md** + **SECURITY.md** (repo-wide standards)

Infrastructure registries (schemas, compatibility pins, control catalogs) are
listed under `infra`, and research summaries live under `reference`. Those lists
inform tooling and context, but do not override normative policy.

### Recent Consolidations (2025-11-22)

To reduce duplication and improve maintainability:

- ✅ **RULES_OF_AI.md** → merged into AGENT_CHARTER.md § AI Behavioral Rules
- ✅ **GOVERNANCE_HASH_UPDATE.md** → merged into governance-maintainers.md
- ✅ **Multiple checklists** → unified into checklistsgovernance-os.md

Original files converted to stubs for backward compatibility.

---

## 🔧 Common Tasks

### Finding the Right Document

| Task | Document | Section |
|------|----------|---------|
| Starting new work | governance-quickstart.md | § Standard Flows |
| Understanding a gate | agentic-coding-workflow.md | § Gate Templates |
| Running quality checks | checklistsgovernance-os.md | § Local Dev / PR Author |
| Reviewing code | checklistsgovernance-os.md | § Code Review |
| Calling Cortex-Aegis | cortex-aegis.md | § When to Call |
| Updating hashes | governance-maintainers.md | § Hash Update Procedure |
| Understanding rules hierarchy | AGENT_CHARTER.md | § Hierarchy of Authority |
| Time/date handling | cortex-aegis.md | § Time Freshness Policy |

### Making Changes

1. Edit document(s) as needed
2. Run `pnpm governance:sync-hashes` to update SHA-256 checksums
3. Test with affected workflows
4. Update this README if structure changes

---

## 📖 External References

### Related Root Documents

- `/AGENTS.md` - Root-level agent operational rules
- `/CODESTYLE.md` - Coding conventions and testing standards
- `/README.md` - Repository overview and install guidance

### Related Documentation

- `brainwav/governance/docs/` - Core governance reference docs
- `brainwav/governance/runbooks/` - Operational runbooks
- `.github/instructions/` - GitHub Copilot instructions

---

## 🆘 Getting Help

### Document Questions

- **Slack**: #cortex-ops
- **GitHub**: @brAInwav-devs
- **Email**: <governance@brainwav.dev>

### Emergency Governance Issues

See [`90-infra/governance-maintainers.md`](./90-infra/governance-maintainers.md) § Emergency Procedures

---

<!-- PROJECT-SPECIFIC: START -->
## 🏢 Project-Specific Governance

> **Instructions:** Edit this section to add project-specific governance contacts and procedures. This section is NOT overwritten when upgrading the governance pack.

### Project Governance Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| Governance Lead | _@your-handle_ | Primary |
| Security Contact | _@security-lead_ | Security issues |
| On-Call | _See PagerDuty_ | P0 incidents |

### Project-Specific Channels

- **Slack**: _#your-project-ops_
- **GitHub Team**: _@your-org/your-team_
- **Email**: _team@your-domain.com_

### Local Governance Additions

<!-- Add any project-specific governance procedures that extend the framework -->

### Project Document Registry

<!-- List any project-specific governance documents not in the framework -->
| Document | Location | Purpose |
|----------|----------|--------|
| _Project Runbook_ | _/docs/runbook.md_ | _Ops procedures_ |

<!-- PROJECT-SPECIFIC: END -->

---

**Maintained by**: brAInwav Development Team  
**Version**: 2025.11.0

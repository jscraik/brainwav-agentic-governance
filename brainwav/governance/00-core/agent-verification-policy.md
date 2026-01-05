# Agent Verification & KYA Policy

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Scope](#2-scope)
- [Enforcement by Profile](#enforcement-by-profile)
- [Check IDs (stable)](#check-ids-stable)
- [3. AgentFacts Metadata Requirements](#3-agentfacts-metadata-requirements)
- [4. Validation Pipeline](#4-validation-pipeline)
- [5. Trust & Revocation](#5-trust-revocation)
- [6. Integration Requirements](#6-integration-requirements)
- [7. Tooling](#7-tooling)
- [8. Audit & Reporting](#8-audit-reporting)
- [9. References](#9-references)


**Version**: 1.0.0  
**Status**: Authoritative  
**Last Updated**: 2025-12-04  
**Source Research**: arXiv:2506.13794 (AgentFacts), arXiv:2510.25863 (AAGATE)

---

## 1. Purpose

Establish a cryptographically verifiable "Know Your Agent" (KYA) process for every autonomous or semi-autonomous component deployed under the governance framework. This policy operationalizes AgentFacts (arXiv:2506.13794) and aligns with the AAGATE zero-trust governance plane (arXiv:2510.25863).

---

## 2. Scope

- Applies to: AI agents, MCP servers, orchestration bots, sentinel/coordinator agents, reviewer neurons.
- Covers: onboarding, metadata publication, signature validation, trust scoring, revocation.
- Excludes: purely human-operated scripts (documented separately) and disposable single-run scripts under human supervision.

---

## Enforcement by Profile

- **Creative:** missing KYA metadata is **WARN**; focus on capturing provenance for new agents.
- **Delivery:** missing signatures/attestations are **WARN** or **FAIL** depending on risk classification.
- **Release:** missing AgentFacts signature/attestation checks are **FAIL** unless explicitly waived with expiry.

## Check IDs (stable)

- `kya.agentfacts.present`
- `kya.signature.valid`
- `kya.attestation.present`
- `kya.revocation.checked`
- `kya.trustscore.history.linked`

---

## 3. AgentFacts Metadata Requirements

| Field | Description | Source |
| --- | --- | --- |
| `agent_id` | Stable UUIDv7 assigned at onboarding | Governance registry |
| `capabilities` | Declarative list of actions/tools, each with scope + limits | Agent maintainer |
| `model_dependencies` | Models + versions the agent can call | Model inventory |
| `data_access` | Namespaces, sensitivity levels, lawful basis | Data governance |
| `risk_tags` | Autonomy, safety, privacy, security tags (AURA gamma score) | Runtime governance service |
| `trust_score` | Dynamic Trust Factor (0–100) | Governance-as-a-Service ledger |
| `attestations` | Signed statements from validators (security, privacy, compliance) | Authority keyholders |
| `signature` | Ed25519 signature across canonical metadata | AgentFacts signer |

Metadata is published as JSON under `governance/registry/agents/<agent_id>.json` and mirrored to the runtime registry.

---

## 4. Validation Pipeline

1. **Author Drafts Metadata**: Maintainer fills template (`templates/agentfacts.jsonc`).
2. **Automated Lint**: `pnpm agentfacts:validate <path>` ensures schema compliance + deterministic field ordering.
3. **Multi-Authority Signatures**:
   - Security validator signs `security.attestation` (scope: threat modeling + controls).
   - Privacy validator signs `privacy.attestation` (scope: data access + retention).
   - Governance validator signs `governance.attestation` (scope: lawful use, scope alignment).
4. **Root Signature**: Governance registry signs the canonical hash; signature stored in `signature.root`.
5. **Publication**: CI copies metadata to `registry/` and updates `json/memory-ids.json` with reference.
6. **Runtime Sync**: Runtime governance service ingests metadata and exposes it via `/kya/<agent_id>` endpoint.

---

## 5. Trust & Revocation

- **Initial Trust Score**: 80, unless risk tags include `security-high` (then 60).
- **Trust Factor Updates** (GaaS, arXiv:2508.18765):
  - +5 for successful audits, +2 for compliant runs, −10 for policy violation, −25 for incident involvement.
  - Scores <50 trigger automatic sandboxing; <30 forces suspension pending review.
- **Revocation**:
  - Publish `revocations/<agent_id>.json` with reason, effective date, remediation.
  - Update `runtime-governance-service.md` steps to quarantine revoked agents.

---

## 6. Integration Requirements

- **Model Card Linkage**: Every entry in `templates/model-card-template.md` must reference `agent_id`, trust score history URL, and latest attestation bundle.
- **Checklist Additions**: `20-checklists/checklists.md` includes KYA verification steps for PR authors/reviewers.
- **Memory Provenance**: `10-flow/memory-governance.md` references AgentFacts signatures for persistent memory writes.
- **Runtime Enforcement**: Sentinel/coordinator agents verify AgentFacts signature before allowing tool execution.

---

## 7. Tooling

The governance pack defines the **expected artifacts** and validation checks. Generation tooling is implementation-specific and may be implemented by a repo-local script or a separate tool.

**Recommended artifact locations (consumer repo):**
- `.agentic-governance/agents/<agent_id>/agentfacts.json`
- `.agentic-governance/agents/<agent_id>/attestations/<timestamp>.bundle`

**Recommended workflow:**
1) Create/update AgentFacts JSON.
2) Create a detached signature/attestation bundle and store it under `attestations/`.
3) Run `brainwav-governance validate --strict` to verify presence, signature requirements, and policy compliance.

---

## 8. Audit & Reporting

- Quarterly audit ensures signature freshness, trust decay handling, and revocation coverage.
- `audit/agentfacts/<YYYY-MM>/report.md` captures sample checks, anomalies, and remediation.
- Runtime governance logs every failed signature check to `logs/runtime-governance/signature-failures.log`.

---

## 9. References

- AgentFacts standard — arXiv:2506.13794
- AAGATE — arXiv:2510.25863
- Governance-as-a-Service — arXiv:2508.18765
- Runtime governance blueprint — `10-flow/runtime-governance-service.md`

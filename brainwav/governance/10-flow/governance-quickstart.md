# AI-Native Agentic Governance Quickstart

This **governance quickstart** is the entry point for **workflow selection**. Keep it short; use it to decide the flow, then jump to the full workflow spec.

---

## 1. Purpose (who/what)

**What this is**: the minimal “how we work with agents” guide for AI-assisted delivery.

**Who it is for**: humans, agents, CI, and external contributors who need the same ruleset.

---

## 2. Core principles (non‑negotiable)

- Humans own direction and merge decisions; agents do first-pass execution.
- Every change is traceable via tasks, evidence, and hashes.
- Evidence Triplet is mandatory for implementation work.
- Governance is code: versioned, enforced, auditable.
- The Assurance System validates plans and high‑risk work.

---

## 3. Fast flow selector

Pick the smallest flow that fits:

- **Feature** — new capability or scope expansion.
- **Fix** — reproducible bug/incident/regression.
- **Refactor** — quality cleanup, no behavior change.
- **Research** — exploration / feasibility, no code required.

If unsure, start with **Research**, then promote to Feature/Fix/Refactor after evidence is collected.

---

## 4. Standard flows (summary)

### Feature
1. Create task folder + North‑Star acceptance criteria.
2. Research sweep + plan draft.
3. Cortex‑Aegis validation (plan).
4. Implement + tests + evidence.
5. PR with Evidence Triplet.

### Fix
1. Capture reproducer + failing test.
2. Minimal fix plan; run Aegis if risk ≥ medium.
3. Implement fix; failing → passing proof.
4. Regression checks; evidence updated.

### Refactor
1. Document invariants + baselines.
2. Plan + risk notes.
3. Refactor + proof behavior is unchanged.

### Research
1. Research plan + citations.
2. Aegis (time‑freshness + licenses).
3. Decision memo; no code required.

---

## 5. Assurance System (when to call)

Call it for:

- Feature / Fix / high‑risk refactor
- Security/privacy/compliance changes
- Research validity / time freshness

Outputs: JSON verdict + required follow‑ups + evidence pointers.

---

## 6. Checklists & CI

- [Unified Checklists](../20-checklists/checklists.md)
- CI enforces hashes, evidence, and quality gates.

---

## 7. Where to go next

- [Agent Charter](../00-core/AGENT_CHARTER.md)
- [Constitution](../00-core/constitution.md)
- [Agentic Coding Workflow](../10-flow/agentic-coding-workflow.md)
- [Assurance System](../10-flow/assurance-system.md)

---

<!-- PROJECT-SPECIFIC: START -->
## 8. Project‑Specific Workflow Configuration

> Add project-specific flow adjustments here (tighten only; do not weaken).

### Custom Gates

| Gate | Name | Requirements |
|------|------|-------------|
| _none_ | — | — |

### Project Flow Overrides

<!-- Document project-specific flow modifications -->

### Additional Tools & Integrations

| Tool | Purpose | Integration Point |
|------|---------|------------------|
| _none_ | — | — |

<!-- PROJECT-SPECIFIC: END -->

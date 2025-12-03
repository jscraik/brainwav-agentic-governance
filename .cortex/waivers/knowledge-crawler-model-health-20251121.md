# Preflight Guard Waiver: Model Health

**Waiver ID:** `knowledge-crawler-model-health-20251121`
**Rule ID:** `AGENTS-PRV-009` (Preflight Guards - Model Health)
**Task:** knowledge-crawler
**Session:** 01JuNbkWKotDLWb6UtuyWQf5
**Created:** 2025-11-21
**Brand:** brAInwav

---

## Reason

Embedding services (MLX/Ollama/Frontier) are not currently running in the development environment. The `models:health` and `models:smoke` commands cannot be executed during the planning phase preflight guard execution.

---

## Compensating Controls

1. **Deferred Execution:** Model health checks will be executed during **Arc 1 implementation** when embedding services are started for development.

2. **Specification-Only Validation:** The planning phase uses specification-level validation:
   - ✅ Embeddings package (`@cortex-os/embeddings`) exists and is documented
   - ✅ Live-only ML policy documented in spec (no stubs/fakes)
   - ✅ Fallback chain specified: MLX → Ollama → Frontier
   - ✅ Vector dimensions documented (768-dim for nomic-embed-text)

3. **Implementation Requirements:** Arc 1 implementation checklist includes:
   - Step 1: Start embedding services (MLX or Ollama)
   - Step 1: Execute `pnpm models:health && pnpm models:smoke`
   - Step 1: Verify `MODELS:LIVE:OK` marker in logs
   - Step 1: Document model IDs, vector shapes, latency samples

4. **No Stubs/Fakes:** Implementation will use **live-only** models per AGENTS.md §25:
   - No stub/fake/recording/dry_run modes permitted
   - Real engines only
   - If unavailable during Arc 1, task will be marked **blocked**

---

## Evidence Required

When this waiver is retired (Arc 1 implementation), the following evidence MUST be attached:

- [ ] `tasks/knowledge-crawler/logs/model-health.log` with:
  - `MODELS:LIVE:OK` marker
  - Model IDs (e.g., `nomic-embed-text`)
  - Vector dimensions (768-dim)
  - Latency samples (P50, P95, P99)
  - Brand token (`[brAInwav]`)
  - Trace ID

- [ ] Updated `run-manifest.json` with:
  - `preflight_guards.manual.model_health.status: "pass"`
  - Log evidence pointer

---

## Expiry

**This waiver expires when:**
- Arc 1 implementation begins, OR
- 2025-12-10 (30-day maximum), whichever comes first

**Retirement condition:** Model health check successfully executed with live services.

---

## Approver

**Approved by:** @jamiescottcraik (maintainer)
**Approval method:** Hybrid approach (Option C) selected by user during planning phase
**Apply Waiver workflow:** _(will be linked after PR creation and workflow execution)_

---

## Remediation Plan

- [x] Document model health requirements in specification
- [x] Add model health check to Arc 1 implementation checklist
- [ ] Start embedding services before Arc 1 implementation
- [ ] Execute `pnpm models:health && pnpm models:smoke`
- [ ] Attach evidence to run manifest
- [ ] Update waiver status to "retired"

---

## Risk Assessment

**Risk Level:** LOW

**Justification:**
- Planning phase does not require live models
- Implementation phase will enforce live-only policy
- Specification documents all requirements
- Arc 1 checklist includes mandatory model health verification
- No deployment/production impact during planning

---

## Related Documents

- Specification: `KNOWLEDGE_CRAWLER_SPEC_UPDATED.md` §1.4 (Embeddings)
- Implementation: `KNOWLEDGE_CRAWLER_IMPLEMENTATION_CHECKLIST.md` Arc 1, Step 1
- Policy: `AGENTS.md` §25 (Hybrid Model Solution — Live Only)
- Run Manifest: `tasks/knowledge-crawler/json/run-manifest.json`

---

**[brAInwav]** Model Health Waiver — Planning Phase Only
**Status:** Active until Arc 1 implementation
**License:** Apache-2.0

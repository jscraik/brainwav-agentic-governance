# Preflight Guard Waiver: Connector Health

**Waiver ID:** `knowledge-crawler-connectors-20251121`
**Rule ID:** `AGENTS-PRV-009` (Preflight Guards - Connector Health)
**Task:** knowledge-crawler
**Session:** 01JuNbkWKotDLWb6UtuyWQf5
**Created:** 2025-11-21
**Brand:** brAInwav

---

## Reason

External MCP connector services (Wikidata MCP, arXiv MCP, Qdrant) are not running in the current development environment. This is an **optional guard** (medium priority, not a blocker) that verifies external research connectors are healthy.

**Service availability check results:**
- ❌ Wikidata MCP (localhost:3029) - not running
- ❌ arXiv MCP (localhost:3041) - not running
- ❌ Qdrant vector store (localhost:6333) - not running

**Priority justification:**
- Connector health is **not a blocker** for planning phase
- Academic research was completed using alternative methods
- Implementation phase will require these services, but planning does not

---

## Compensating Controls

1. **Alternative Research Methods:** Academic research completed without live connectors:
   - ✅ Manual literature review conducted
   - ✅ Research findings documented in `tasks/knowledge-crawler/research.md`
   - ✅ RAID analysis includes academic sources
   - ✅ Reuse-first evaluation references existing research

2. **Specification Documentation:** Connector integration fully documented:
   - ✅ Transport selection logic (§2.4) specifies WebSocket for external MCPs
   - ✅ Connection health checks documented
   - ✅ Connector ports identified (Wikidata 3029, arXiv 3041, Qdrant 6333)
   - ✅ Fallback strategies documented

3. **Deferred to Implementation:** Connector health will be verified during Arc 1:
   - Arc 1, Step 2: Start Qdrant vector store (port 6333)
   - Arc 4, Step 3: Integrate Wikidata/arXiv MCPs for RAG
   - Implementation checklist includes connector health verification
   - Live health checks will be executed when services are started

4. **Cached Research Data:** Previous research sessions provide fallback data:
   - Existing documentation reviewed
   - Infrastructure analysis completed
   - No new external research dependencies identified

---

## Evidence Required

When this waiver is retired (Arc 4 implementation), the following evidence SHOULD be attached:

- [ ] `tasks/knowledge-crawler/research/connectors-health.log` with:
  - Wikidata MCP health check (200 OK)
  - arXiv MCP health check (200 OK)
  - Qdrant health check (200 OK)
  - Response timestamps
  - Brand token (`[brAInwav]`)

- [ ] Updated `run-manifest.json`:
  - `preflight_guards.manual.connector_health.status: "pass"`
  - Log evidence pointer

**Note:** This is optional evidence. Implementation can proceed without it if connectors remain unavailable, as long as specification documents the integration points.

---

## Expiry

**This waiver expires when:**
- Arc 4 (RAG Integration) implementation begins, OR
- 2025-12-31 (60-day maximum), whichever comes first

**Retirement condition (optional):** Connector health checks successfully executed with live services.

---

## Approver

**Approved by:** @jamiescottcraik (maintainer)
**Approval method:** Hybrid approach (Option C) selected by user during planning phase; connector health is non-blocking optional guard
**Apply Waiver workflow:** _(will be linked after PR creation and workflow execution)_

---

## Remediation Plan

- [x] Document connector integration in specification (§2.4)
- [x] Complete research using alternative methods
- [x] Identify connector ports and health check endpoints
- [ ] Start Wikidata MCP service (deferred to Arc 4)
- [ ] Start arXiv MCP service (deferred to Arc 4)
- [ ] Start Qdrant vector store (deferred to Arc 1-2)
- [ ] Execute health checks: `curl -f http://localhost:3029/healthz`
- [ ] Attach evidence to run manifest (optional)
- [ ] Update waiver status to "retired" (optional)

---

## Risk Assessment

**Risk Level:** VERY LOW

**Justification:**
- Connector health is **optional guard** (not a blocker)
- Planning phase does not require live connectors
- Research completed using alternative methods
- Specification fully documents integration requirements
- Implementation phase will verify connector health when needed
- No deployment/production impact during planning

**Mitigations:**
- Deferred execution to implementation phase (Arc 1, Arc 4)
- Specification includes health check requirements
- Alternative research methods used (manual review)
- No new dependencies on unavailable services

---

## Related Documents

- Specification: `KNOWLEDGE_CRAWLER_SPEC_UPDATED.md` §2.4 (Transport Selection)
- Research: `tasks/knowledge-crawler/research.md` (manual academic research)
- Implementation: `KNOWLEDGE_CRAWLER_IMPLEMENTATION_CHECKLIST.md` Arc 1 Step 2, Arc 4 Step 3
- Policy: `AGENTS.md` §11 (Oversight Gate - Connector Health)
- Run Manifest: `tasks/knowledge-crawler/json/run-manifest.json`

---

**[brAInwav]** Connector Health Waiver — Optional Guard, Deferred to Implementation
**Status:** Active until Arc 4 implementation (or indefinitely if services unavailable)
**License:** Apache-2.0

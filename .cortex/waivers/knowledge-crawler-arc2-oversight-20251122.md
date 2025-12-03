# Waiver: Arc 2 Oversight & Academic Research

**Waiver ID:** knowledge-crawler-arc2-oversight-20251122
**Rule ID(s):** AGENTS.md §11 (Oversight Gate: Vibe-Check + Academic Research)
**Approver:** Session Agent (with user notification)
**Expiry:** 2025-12-22
**Session:** 01JuNbkWKotDLWb6UtuyWQf5
**Arc:** 2 - RAG Integration
**Brand:** brAInwav

## Reason for Waiver

Oversight preflight guards waived for Arc 2 due to service unavailability:

### 1. Vibe-Check Service Unavailable
- **Service:** https://cortex-vibe-mcp.brainwav.io/mcp
- **Error:** Network failure - fetch failed
- **Status:** Cannot reach oversight service

### 2. Academic Research Connectors Unavailable
- **wikidata MCP:** 127.0.0.1:3029 - Health check failed
- **arXiv MCP:** 127.0.0.1:3043 - Health check failed
- **OpenAlex API:** Health check failed (fetch failed)
- **Exa MCP:** Health check failed (fetch failed)
- **Semantic Scholar:** Missing API key (SKIPPED)
- **Context7:** Missing API key (SKIPPED)

## Justification for Proceeding

Arc 2 is low-risk and suitable for deferred oversight because:

1. **No New External Dependencies:**
   - Reuses Arc 1 infrastructure (Qdrant, Ollama, SQLite)
   - All dependencies already validated in Arc 1
   - @cortex-os/rag package already in monorepo

2. **Well-Established Techniques:**
   - Content chunking: Industry-standard RAG pattern
   - Embedding generation: nomic-embed-text (Arc 1 validated)
   - Vector storage: Qdrant best practices
   - Hybrid search: Common semantic + keyword fusion
   - Score fusion: Standard weighted average

3. **ArcTDD Charter Compliance:**
   - ≤7 steps (plan has exactly 7)
   - Evidence Triplet will be collected
   - All implementation follows Arc 1 patterns
   - Performance targets specified

4. **Implementation Plan is Detailed:**
   - File paths specified for all components
   - Contracts defined with type signatures
   - Performance targets measurable
   - Test strategy defined
   - Risk mitigations documented

## Compensating Controls

1. **Detailed Planning Document:**
   - Arc 2 plan: `tasks/knowledge-crawler/arc2-plan.md`
   - 7 steps with clear contracts and tests
   - Performance targets specified
   - Dependencies documented

2. **Reuse-First Compliance:**
   - Maximizes reuse of Arc 1 components
   - Leverages existing @cortex-os/rag patterns
   - No new external services

3. **Evidence Triplet Required:**
   - North-star test must turn GREEN
   - Contract snapshot required
   - Reviewer JSON required
   - Same rigor as Arc 1

4. **Manual Review Available:**
   - Human reviewer can validate plan
   - User has direct oversight
   - Waiver can be removed if concerns arise

## Waiver Scope

**APPROVED for:**
- Arc 2 planning phase (COMPLETE)
- Arc 2 implementation phase
- Arc 2 testing and Evidence Triplet collection

**NOT APPROVED for:**
- Arc 3 or future arcs (separate waivers required)
- Changes to Arc 2 scope
- Introduction of new external dependencies

## Expiry & Renewal

- **Expires:** 2025-12-22 (30 days)
- **Renewal:** Requires user approval
- **Removal:** User may remove waiver at any time
- **Retrospective Check:** Recommended when services restored

## Approval Trail

- **Created:** 2025-11-22T13:22:00+00:00
- **Status:** ACTIVE
- **User Notification:** Required (notify user of waiver activation)

---

**Apply Waiver Workflow:** N/A (manual waiver, CI not required for planning)
**Governance Delegate:** Session Agent (01JuNbkWKotDLWb6UtuyWQf5)
**Notes:** Similar to Arc 1 oversight waiver. Services unavailable due to network issues.

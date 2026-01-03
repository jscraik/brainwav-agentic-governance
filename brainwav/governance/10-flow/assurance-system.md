# Assurance System for Agentic Workflows

> The autonomous quality and governance assurance system for AI-native software development.

---

## 1. What is the Assurance System?

**The Assurance System** is the automated validation system that validates agentic development workflows against governance, security, and quality requirements. It serves as the "guardrail" for AI agents and humans, ensuring that plans, implementations, and changes align with governance principles and compliance requirements.

**Key Capabilities**:

- Plan validation against governance frameworks
- Risk assessment and mitigation recommendations
- Evidence verification and audit trail generation
- Time-freshness validation for research and external sources
- Compliance checking for security, privacy, and accessibility standards

---

## 2. Time Freshness Policy

### 2.1 Context Anchoring

The user's timezone and "today" date are runtime values. Agents must emit a freshness anchor token when a plan or research depends on recency:

`TIME_FRESHNESS:OK tz=<IANA> today=<YYYY-MM-DD>`

Treat dates before this as past and after this as future. When asked for "latest", "most recent", "today's", etc., do not assume knowledge is current; verify freshness or ask the user.

### 2.2 Secret Handling

Retrieve all API keys, SSH credentials, and tokens at runtime via an approved secret-manager CLI and never cache them in files or long-lived environment variables.

### 2.3 Freshness Validation

The Assurance System MUST validate time-freshness for:

- External research sources and citations
- API documentation references
- Security vulnerability databases
- Dependency version checks
- Compliance standard updates

---

## 3. When to Call the Assurance System

### 3.1 Mandatory Invocation

- **Feature Implementation (G2 + G5)**: All feature flows must call the Assurance System at plan validation (G2) and verification (G5) stages
- **High-Risk Changes**: Any modification with risk tags ≥ `medium` or touching security/privacy boundaries
- **Contract Changes**: API modifications, schema updates, or interface changes
- **Research Validation**: Academic source verification and time-freshness checks (required in delivery/release for medium+ risk; optional in creative)
- **Compliance Requirements**: When WCAG, security, or regulatory compliance is involved

### 3.2 Optional but Recommended

- Fix flows for non-trivial bugs or system-level issues
- Refactoring that affects multiple packages or core abstractions
- New tool/connector integrations in the MCP ecosystem
- Experimental or prototype implementations

---

## 4. Academic Research Integration (Profile-Driven)

### 4.1 Available Academic MCP Providers

Before running Cortex-Aegis validation, plans SHOULD be enhanced with research when available. Requirements are profile-driven:
- **Release:** MUST for medium+ risk and external-call/model/data-boundary changes
- **Delivery:** SHOULD for medium+ risk
- **Creative:** OPTIONAL (document uncertainties instead)

Provider endpoints/ports are adapter-specific. Do not hardcode ports in core governance docs; packs/adapters define endpoints and health checks.

Provider lists are non-normative. The assurance system consumes artifacts; the model/provider is a project decision recorded in evidence.

### 4.2 Research Workflow

```typescript
// Example: Query academic sources via MCP
await mcpClient.callTool('mcp_wikidata_vector_search', { query: '<concept>' });
await mcpClient.callTool('mcp_arxiv_search', { query: '<research topic>' });
await mcpClient.callTool('mcp_context7_get-library-docs', { context7CompatibleLibraryID: '<lib>' });

// Store findings for Aegis consumption
fs.writeFileSync(
  'tasks/<slug>/logs/academic-research/findings.json',
  JSON.stringify(researchResults, null, 2)
);
```

### 4.3 License Validation Requirements

- **License Risk Assessment**: Classify all academic sources by risk level (SAFE/REVIEW/RESTRICTED/PROHIBITED)
- **Content Filtering**: Only include SAFE and REVIEW content in implementation plans
- **Attribution Compliance**: Ensure proper citation and attribution for all used content
- **Documentation**: Store license validation results alongside research findings

---

## 5. Implementation Guidelines

### 5.1 MCP Tool Invocation

```typescript
// Call Cortex-Aegis MCP tool (canonical)
const response = await mcpClient.callTool('cortex_aegis_validate', {
  goal: '<task summary>',
  plan: '1. Step one. 2. Step two. ... (max 7 steps)',
  sessionId: '<task-slug>-<timestamp>',
  gate: 'G2|G5|other',
  riskTags: ['security', 'privacy', 'compliance']
});

// Save response to evidence
fs.writeFileSync(
  'tasks/<slug>/evidence/aegis-report.json',
  JSON.stringify(response, null, 2)
);
```

### 4.2 Response Handling

- **BLOCK verdicts** halt workflow progression until resolved
- **WARN verdicts** require human review and disposition in `evidence/review-notes.md`
- **PASS verdicts** enable automatic gate progression

### 4.3 Output Schema

**Primary Response** (`evidence/aegis-report.json`):

```json
{
  "verdict": "PASS|WARN|BLOCK",
  "timestamp": "ISO-8601-timestamp",
  "version": "aegis-framework-version",
  "validations": [...],
  "recommendations": [...],
  "requiredActions": [...],
  "auditTrail": {...}
}
```

**Audit Logs** (`logs/aegis/*.json`, legacy `logs/vibe-check/*.json` allowed):

- Detailed validation traces for compliance auditing
- Evidence collection and verification logs  
- Time-stamped decision rationale

---

## 5. Configuration & Integration

### 5.1 Server Configuration

**Endpoint**: adapter-defined (no hardcoded ports in core governance)

**Required Environment Variables**:

- `CORTEX_AEGIS_HTTP_URL`: Aegis service endpoint (if adapter uses env vars)
- `ACADEMIC_RESEARCH_ENABLED`: Enable/disable research integration (adapter-defined)
- `AEGIS_COMPLIANCE_FRAMEWORKS`: Active compliance frameworks (adapter-defined)

### 5.2 Task Integration Points

**Required Files**:

- `evidence/aegis-report.json`: Primary validation results
- `logs/aegis/*.json`: Audit trail (legacy naming for compatibility)
- `run-manifest.json.evidence.aegisReport`: Relative path reference

**Gate Dependencies**:

- G2 (Plan): Mandatory for feature flows, recommended for others
- G5 (Verify): Mandatory for feature flows and high-risk changes
- Ad-hoc: Available for any validation requirements

---

## 6. Legacy Compatibility (Vibe Check → Cortex-Aegis)

### 6.1 Vibe Check Migration

**Transition Period**: 2025-11-22 through 2025-12-31

- Legacy `vibe_check` tool calls redirect to `cortex_aegis_validate`
- Existing log paths (`logs/vibe-check/`) may be maintained for compatibility via pack/adapters.
- Gradual migration of references from "vibe check" to "Cortex-Aegis"

**Breaking Changes After 2025-12-31**:

- `vibe_check` tool will be deprecated
- New log structure under `logs/aegis/`
- Updated tool names and parameters

### 6.2 Connector Outage Protocol

**Fallback Behavior**:

- Academic research requirements become optional during connector outages
- Validation proceeds with available data and explicit uncertainty markers
- Manual review requirements increase for plans developed during outages

---

## 7. Related Documentation

**Core Governance**:

- [Constitution](../00-core/constitution.md) - Foundational principles
- [Agent Charter](../00-core/AGENT_CHARTER.md) - Agent behavior requirements
- [Time Freshness Policy](./cortex-aegis.md#time-freshness-policy) - Source validation rules

**Workflow Integration**:

- [Governance Quickstart](../10-flow/governance-quickstart.md) - Overview and flow mapping
- [Agentic Workflow](../10-flow/agentic-coding-workflow.md) - Detailed gate specifications
- [Unified Checklists](../20-checklists/checklists.md) - Section 7 Aegis requirements

- When any research connector is unavailable, check connector health via adapter-defined `/health` endpoints and record the evidence path.
- Document the outage in a waiver JSON at `logs/academic-research/<slug>-<timestamp>-waiver.json` with service identity (`[<service>]`) metadata
- Record the waiver pointer in `run-manifest.json` and schedule a follow-up check within 72 hours
- Plans submitted to Oversight must surface outstanding uncertainties (e.g., connector uptime, attestation tooling) so reviewers can challenge mitigations early

**Enhanced Plan Format with Research Integration:**

```
Plan for: "Implement API rate limiting"
1. Research rate limiting patterns and best practices (Research-backed: peer-reviewed citations)
2. Design token bucket algorithm based on academic standards (Research-backed: methodology citations)
3. Implement Redis-based rate limiter with research-validated algorithm properties (Research-backed: evidence notes)
4. Add comprehensive testing based on peer-reviewed validation methods (Research-backed: testing citations)
5. Create monitoring dashboards using academically-proven metrics (Research-backed: metrics citations)
6. Document with academic references and proven methodologies
7. Deploy with gradual rollout based on research-backed deployment strategies
```

**Academic Research Enhancement Process:**

1. **Automatic Query Generation**: Extract key concepts from the plan and generate academic search queries
2. **Multi-Source Research**: Execute searches across all academic databases simultaneously
3. **License Validation**: Assess risk levels and filter content by usage rights
4. **Evidence Integration**: Incorporate license-compliant findings into plan steps with proper citations
5. **Validation**: Cross-reference approaches across multiple academic sources
6. **Documentation**: Store research evidence and license validation alongside Aegis responses

### 3.2 Legacy server setup (pack-scoped)

Legacy server setup steps (monorepo paths, Nx targets, local launch agents) are pack-scoped. Enable `pack:legacy-vibe-check` if you must run the legacy server; otherwise prefer `cortex_aegis_validate` via the canonical adapter.

Provider lists are non-normative. The assurance system consumes artifacts; the model/provider is a project decision recorded in evidence.

### 3.3 JSON-RPC Fallback

POST to the adapter-configured MCP endpoint (e.g., `${CORTEX_AEGIS_HTTP_URL}/mcp`) with:

```json
{
  "jsonrpc": "2.0",
  "id": "<uuid>",
  "method": "tools/call",
  "params": {
    "name": "cortex_aegis_validate",
    "arguments": {
      "goal": "<task summary>",
      "plan": "1. Step one. 2. Step two.",
      "sessionId": "<session-id>"
    }
  }
}
```

- Include headers: `Content-Type: application/json` and `Accept: application/json, text/event-stream`.
- Save the raw response to `logs/aegis/<slug>.json` (legacy `logs/vibe-check/` allowed via adapters).

---

## 4. Evidence Package (merge gate)

To satisfy CI and review:

1. Commit the JSON response at `logs/aegis/<slug>.json` inside the task folder (legacy `logs/vibe-check/` allowed via adapters).
2. Record the command (or HTTP POST) with timestamp and session ID in `~/tasks/<slug>/notes.md` or `decisions.md`.
3. Reference the artifact in the PR description and attach the same path in review evidence (Code Review Checklist).
4. Map each finding or mitigation to the applicable OWASP LLM Top 10 control ID(s) listed in `00-core/llm-threat-controls.md`; include the mapping in the PR evidence comment.
5. Capture the proposed edit envelope: directories, allowed file globs, max files, and max total LOC. Store alongside the JSON response (e.g., `edit-envelope.json`) so CI can enforce the declared patch budget.
6. Ensure all oversight-related logs contain `[<service>]` and `service:"<service_name>"` for audit search; `brand` is optional unless required by overlays.

Failure to meet any item keeps the PR in a blocked state (`agents-guard` job).

---

## 5. Error Handling and Escalation

- **Server unreachable / health check fails:** stop work, mark the task blocked, and escalate per the Constitution. Do **not** bypass the gate without a formally recorded waiver under `governance/waivers/`.
- **HTTP 406 or schema errors:** verify headers and ensure the plan contains numbered steps ≤ 7. Correct and retry.
- **Timeouts:** retry once after confirming server health; repeated timeouts require escalation.
- **Session resets:** if a session reset occurs, perform a new validation before resuming implementation.

---

## 6. Related Resources

- Runbook for escalation: `brainwav/governance/runbooks/incident.md`
- Governance reference: `brainwav/governance/10-flow/agentic-coding-workflow.md` §0.1 and §G5
- CLI helper source: `scripts/oversight-aegis-check.mjs` (legacy: `scripts/oversight-vibe-check.mjs`)
- Oversight evidence index: `brainwav/governance/audit/`

---

# Academic Research Integration Template

## Table of Contents

- [Required Workflow Steps](#required-workflow-steps)
  - [Step 1: Pre-Research Setup](#step-1-pre-research-setup)
  - [Step 2: Research Query Generation](#step-2-research-query-generation)
  - [Step 3: Multi-Source Academic Research with License Validation](#step-3-multi-source-academic-research-with-license-validation)
  - [Step 4: License Validation and Content Filtering](#step-4-license-validation-and-content-filtering)
  - [Step 5: License-Compliant Research Synthesis and Plan Enhancement](#step-5-license-compliant-research-synthesis-and-plan-enhancement)
  - [Step 6: License-Compliant, Research-Backed Plan Format](#step-6-license-compliant-research-backed-plan-format)
  - [Step 7: Aegis Oversight with Research and License Integration](#step-7-aegis-oversight-with-research-and-license-integration)
  - [Step 8: Evidence Storage and License Compliance](#step-8-evidence-storage-and-license-compliance)
- [Required Evidence Package](#required-evidence-package)
  - [Files Required for CI Compliance:](#files-required-for-ci-compliance)
  - [Evidence Validation Criteria:](#evidence-validation-criteria)
- [Quality Standards](#quality-standards)
  - [Research Quality Metrics:](#research-quality-metrics)
  - [Plan Enhancement Standards:](#plan-enhancement-standards)
- [Integration Scripts](#integration-scripts)
  - [Automated Research Integration:](#automated-research-integration)


**Purpose**: Standard workflow for integrating academic research into planning and implementation cycles.

**Status**: Mandatory when research/oversight packs are enabled and the active profile/change class requires academic research (see assurance-system.md).

**Neutrality:** Connector endpoints, provider lists, and tooling are adapter/pack-scoped. This template defines the evidence artifacts and workflow only.

---

## Required Workflow Steps

### Step 1: Pre-Research Setup

```bash
# Create task directory with academic research structure
mkdir -p ./tasks/<slug>/logs/academic-research
mkdir -p ./tasks/<slug>/research/evidence

# Verify configured research connectors are healthy (adapter-defined)
# Use pack-provided health check commands or endpoints and record results.

# Store health check results
echo "$(date): Research connectors health check completed" >> ./tasks/<slug>/research/connectors-health.log
```

### Step 2: Research Query Generation

Generate academic search queries based on the implementation goal:

```typescript
// Extract key concepts from implementation plan
const concepts = extractTechnicalConcepts(goal, plan);
const academicQueries = [
  `${concepts.primary} best practices 2024 2025`,
  `${concepts.domain} optimization patterns techniques`,
  `${concepts.technology} implementation research`,
  `${concepts.useCase} state-of-the-art approaches`,
  `${concepts.problem} solutions academic research`
];
```

### Step 3: Multi-Source Academic Research with License Validation

Execute parallel searches across configured research connectors:

```typescript
// Execute research using adapter-defined MCP tools
const primaryResults = await mcpClient.callTool('<research_connector_search>', {
  query: `${concepts.primary} patterns techniques`,
  limit: 20
});

const secondaryResults = await mcpClient.callTool('<research_connector_search>', {
  query: `${concepts.technology} optimization`,
  limit: 15
});

// Store findings (shape is connector-specific)
fs.writeFileSync(
  './tasks/<slug>/logs/academic-research/findings.json',
  JSON.stringify({
    primary: primaryResults,
    secondary: secondaryResults
  }, null, 2)
);
```

### Step 4: License Validation and Content Filtering

Validate academic content licenses and filter for compliance:

Use pack-provided license validation tooling or a manual checklist and record results:

```bash
# Example (adapter-defined)
<license-validate-command> \
  --input ./tasks/<slug>/logs/academic-research/findings.json \
  --output ./tasks/<slug>/logs/academic-research/license-validation.json
```

### Step 5: License-Compliant Research Synthesis and Plan Enhancement

Analyze validated research findings and enhance the implementation plan:

```typescript
// License-compliant research integration framework
const enhancedPlan = {
  originalSteps: plan,
  licenseValidation: licenseValidationResults,
  researchFindings: {
    provenApproaches: extractHighlyCitedPapers(primaryResults, 'SAFE'),
    recentInnovations: extractRecentPapers(secondaryResults, 'SAFE', 'REVIEW'),
    knowledgeRelationships: extractResearchRelationships(primaryResults, 'SAFE'),
    domainPatterns: extractResearchPatterns(secondaryResults, 'SAFE', 'REVIEW')
  },
  enhancedSteps: plan.map((step, index) => ({
    ...step,
    researchBacking: findLicenseCompliantEvidence(step, researchFindings),
    confidenceLevel: calculateEvidenceConfidence(step, researchFindings),
    alternativeApproaches: identifyAlternativeApproaches(step, researchFindings),
    licenseCompliance: verifyLicenseCompliance(step, licenseValidationResults)
  }))
};
```

### Step 6: License-Compliant, Research-Backed Plan Format

Format the plan with academic citations, evidence, and license compliance:

```
Plan for: "<implementation goal>"
1. Research and analyze <domain> patterns (License: SAFE/REVIEW, Research-backed: peer-reviewed citations)
2. Design solution using proven <technology> approaches (License: SAFE/REVIEW, Research-backed: connector citations)
3. Implement core functionality with research-validated <concept> properties (License: SAFE/REVIEW, Research-backed: evidence notes)
4. Add testing strategy based on peer-reviewed validation methods (License: SAFE/REVIEW, Research-backed: testing citations)
5. Create monitoring using academically-proven metrics collection (License: SAFE/REVIEW, Research-backed: metrics citations)
6. Document implementation with academic references and proven methodologies (All sources license-compliant)
7. Deploy with research-backed gradual rollout strategy (License: SAFE/REVIEW, Research-backed: deployment citations)
```

### Step 7: Aegis Oversight with Research and License Integration

Execute Aegis validation with academic research and license validation:

```typescript
// Call cortex_aegis_validate MCP tool with research-enhanced plan
const response = await mcpClient.callTool('cortex_aegis_validate', {
  goal: '<task summary>',
  plan: '<license-compliant-research-enhanced-steps>',
  sessionId: '<session-id>'
});

// Save response with research and license evidence
fs.writeFileSync(
  './tasks/<slug>/logs/aegis/initial.json',
  JSON.stringify({
    ...response,
    research: {
      findings: require('../academic-research/findings.json'),
      licenseValidation: require('../academic-research/license-validation.json')
    }
  }, null, 2)
);
```

### Step 8: Evidence Storage and License Compliance

Store all research evidence for governance compliance:

```bash
# Store license-compliant academic research evidence
cat ./tasks/<slug>/logs/academic-research/compliant-findings.json \
  > ./tasks/<slug>/logs/academic-research/final-findings.json

# Local Memory MCP parity with license compliance
echo "## License-Compliant Academic Research Findings for <task>" >> ~/.github/instructions/memories.instructions.md
echo "- Date: $(date)" >> ~/.github/instructions/memories.instructions.md
echo "- Research sources: adapter-defined connectors" >> ~/.github/instructions/memories.instructions.md
echo "- License validation: $(jq -r '.compliance_score' ./tasks/<slug>/logs/academic-research/license-validation.json)% compliant" >> ~/.github/instructions/memories.instructions.md
echo "- Key findings: $(jq -r '.summary' ./tasks/<slug>/logs/academic-research/final-findings.json)" >> ~/.github/instructions/memories.instructions.md

# Store memory IDs for reference including license validation
echo '{"academicResearchMemoryId": "'$(<memory-store-command> --type academic-research --path ./tasks/<slug>/logs/academic-research/final-findings.json)'", "licenseValidationMemoryId": "'$(<memory-store-command> --type license-validation --path ./tasks/<slug>/logs/academic-research/license-validation.json)'"}' \
  > ./tasks/<slug>/json/memory-ids.json
```

---

## Required Evidence Package

### Files Required for CI Compliance:

```
./tasks/<slug>/
├── logs/
│   ├── academic-research/
│   │   ├── findings.json                    # Complete research synthesis
│   │   ├── license-validation.json          # License compliance results
│   │   ├── compliant-findings.json          # Filtered license-compliant research
│   │   └── final-findings.json              # Final research evidence for implementation
│   └── aegis/
│       └── initial.json                     # Aegis validation with research & license evidence
├── research/
│   ├── connectors-health.log                # Academic connector health status
│   └── evidence/
│       ├── connector-primary.json           # Connector search results (primary)
│       ├── connector-secondary.json         # Connector search results (secondary)
│       └── connector-notes.json             # Connector notes/metadata
└── json/
    └── memory-ids.json                      # Local memory parity IDs
```

### Evidence Validation Criteria:

1. **Research Completeness**: All academic databases queried with relevant results
2. **Evidence Integration**: Plan steps include research citations and confidence levels
3. **Governance Compliance**: All evidence stored in correct locations with proper formatting
4. **Identity Compliance**: All logs include `[<service>]` and `service:"<service_name>"` (brand optional unless required by overlays)
5. **Trace Context**: All research queries include W3C trace IDs for correlation

---

## Quality Standards

### Research Quality Metrics:

- **Source Diversity**: Minimum 3 different academic databases
- **Recency**: At least 50% of sources from 2023-2025
- **Citation Quality**: Preference for highly-cited papers (citation count > 10)
- **Evidence Strength**: Each plan step must have supporting academic evidence
- **Confidence Scoring**: Document evidence confidence levels (High/Medium/Low)

### Plan Enhancement Standards:

- **Research Integration**: Every step enhanced with academic findings
- **Citation Format**: Consistent citation format with database references
- **Alternative Approaches**: Include academically-supported alternatives
- **Risk Mitigation**: Address potential issues identified in research
- **Innovation Integration**: Include recent advances from pre-prints and new research

---

## Integration Scripts

### Automated Research Integration:

```bash
#!/bin/bash
# academic-research-integration.sh
# Usage: ./academic-research-integration.sh <task-slug> <goal> <plan>

SLUG=$1
GOAL=$2
PLAN=$3

# Create research structure
mkdir -p ./tasks/$SLUG/logs/academic-research
mkdir -p ./tasks/$SLUG/research/evidence

# Execute research workflow (adapter-defined)
<research-integration-command> \
  --goal "$GOAL" \
  --plan "$PLAN" \
  --session "$(date +%Y%m%d-%H%M%S)-$SLUG" \
  --save ./tasks/$SLUG/logs/academic-research/findings.json

# Run Aegis validation
pnpm oversight:aegis-check \
  --goal "$GOAL" \
  --plan "$(cat ./tasks/$SLUG/logs/academic-research/enhanced-plan.txt)" \
  --session "$(date +%Y%m%d-%H%M%S)-$SLUG" \
  --save ./tasks/$SLUG/logs/aegis/initial.json \
  --with-academic-research

echo "Academic research integration complete for task: $SLUG"
echo "Evidence stored in: ./tasks/$SLUG/logs/"
```

This template ensures every implementation plan is enhanced with current academic research while maintaining full governance compliance!

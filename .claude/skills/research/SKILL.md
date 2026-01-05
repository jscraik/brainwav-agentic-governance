# Skill: Research

## Metadata
- **name**: research
- **description**: Conduct spikes and research with exploration, prototyping, and recommendation
- **version**: 1.0.0
- **last_updated**: 2026-01-05
- **author**: brAInwav Development Team

## When This Skill Triggers

User queries like:
- "Research [topic]"
- "Spike [feature] feasibility"
- "Explore [technology]"
- "Investigate [approach]"
- "Is [X] possible?"

Task type is `research` or `spike` with complexity 1-7 on a 10-point scale.

## Workflow Steps

### 1. Define Research Questions

**Goal**: Clear, testable research questions.

**Actions**:
- Identify core questions to answer
- Define success criteria for each question
- Document constraints (time, resources, technology)
- Create research doc under `docs/Research/` or `tasks/<slug>/context/research.md`
- Include: background, questions, constraints, risks

**Deliverable**:
- [ ] Research questions defined
- [ ] Success criteria specified
- [ ] Constraints documented
- [ ] Research doc created

### 2. Background Research

**Goal**: Understand existing landscape.

**Actions**:
- Literature review (docs, papers, existing implementations)
- Survey similar projects/solutions
- Identify key experts or sources
- Document findings in research doc
- Cite sources properly

**Deliverable**:
- [ ] Literature review completed
- [ ] Existing solutions surveyed
- [ ] Key sources identified
- [ ] Findings documented with citations

### 3. Design Experiments or Prototypes

**Goal**: Hands-on exploration to validate assumptions.

**Actions**:
- Identify assumptions to test
- Design 2-5 small experiments or prototypes
- Each experiment should answer specific questions
- Document experiment design (hypothesis, method, validation)
- Create spike code in `tasks/<slug>/spike/` directory

**Deliverable**:
- [ ] Assumptions identified
- [ ] 2-5 experiments designed
- [ ] Experiment designs documented
- [ ] Spike code created

### 4. Run Experiments

**Goal**: Validate assumptions with evidence.

**Actions**:
- Execute experiments/prototypes
- Document results (success/failure/partial)
- Capture metrics and observations
- Note unexpected findings
- Take screenshots, logs, or measurements

**Deliverable**:
- [ ] Experiments executed
- [ ] Results documented
- [ ] Metrics/observations captured
- [ ] Unexpected findings noted

### 5. Analyze Results

**Goal**: Synthesize findings into insights.

**Actions**:
- Compare results against research questions
- Identify patterns and insights
- Assess feasibility and risks
- Document trade-offs between approaches
- Create comparison matrix if multiple options

**Deliverable**:
- [ ] Results analyzed
- [ ] Insights identified
- [ ] Feasibility assessed
- [ ] Trade-offs documented

### 6. Form Recommendation

**Goal**: Clear recommendation with evidence.

**Actions**:
- Synthesize findings into recommendation
- Provide 2-3 options with pros/cons
- Recommend primary approach with justification
- Document risks and mitigations
- Include proof-of-concept code if helpful

**Deliverable**:
- [ ] Recommendation formed
- [ ] Options with pros/cons documented
- [ ] Primary approach justified
- [ ] Risks and mitigations documented

### 7. Create Research Report

**Goal**: Comprehensive, shareable research output.

**Actions**:
- Write research report with:
  - Executive summary (1-2 paragraphs)
  - Background and questions
  - Methods and experiments
  - Results and analysis
  - Recommendations
  - Appendix (code, data, references)
- Add diagrams or visualizations if helpful
- Review for clarity and completeness

**Deliverable**:
- [ ] Research report completed
- [ ] Executive summary included
- [ ] All sections complete
- [ ] Diagrams/visualizations added (if helpful)

### 8. Present Findings

**Goal**: Ensure stakeholders understand research.

**Actions**:
- Present findings to stakeholders
- Walk through experiments and results
- Explain recommendation and justification
- Answer questions and concerns
- Document feedback in research doc

**Deliverable**:
- [ ] Findings presented
- [ ] Stakeholder feedback captured
- [ ] Concerns addressed

### 9. Evidence Bundle

**Goal**: Complete evidence for decision-making.

**Actions**:
- Compile all research artifacts:
  - Research report
  - Spike code
  - Experiment results
  - Screenshots/measurements
  - References
- Create summary in `tasks/<slug>/evidence/research-summary.md`

**Deliverable**:
- [ ] All artifacts compiled
- [ ] Evidence bundle complete
- [ ] Summary created

## Scripts

- `scripts/research-setup.sh`: Set up research spike directory

## References

- `brainwav/governance/templates/research-template.md`: Research doc template
- `brainwav/governance/templates/academic-research-integration-template.md`: Academic research format

## Dependencies

- None (research is independent)

## Success Criteria

- [ ] Research questions clearly defined
- [ ] Background research completed
- [ ] Experiments/prototypes executed
- [ ] Results analyzed and synthesized
- [ ] Recommendation formed with evidence
- [ ] Research report completed
- [ ] Findings presented to stakeholders
- [ ] Evidence bundle compiled

## AI Participation Mode

**Default**: Collaborative (50/50 AI/Human)
- AI conducts background research and proposes experiments
- Human reviews experiment designs
- Human makes final recommendation decision

**For exploratory research**: Use Delegated mode (AI 80%+)
- Open-ended exploration where AI can iterate quickly
- Human reviews final findings

**For high-stakes research**: Use Consultative mode (AI analysis only)
- AI provides research options and synthesis
- Human designs experiments
- Human makes all decisions

## Research Report Template

```markdown
# Research: [Title]

**Date**: YYYY-MM-DD
**Researcher**: [Name]
**Status**: [Draft/In Review/Complete]

## Executive Summary
[2-3 paragraph summary of findings and recommendation]

## Background
[Context and motivation for research]

## Research Questions
1. [Question 1]
2. [Question 2]
3. [Question 3]

## Methods
[Approach and experiments]

## Results
[Findings from experiments]

## Analysis
[Interpretation of results]

## Recommendations
### Option 1: [Name]
- **Pros**: [list]
- **Cons**: [list]
- **Risk**: [assessment]

### Option 2: [Name]
- **Pros**: [list]
- **Cons**: [list]
- **Risk**: [assessment]

### Primary Recommendation
[Recommended approach with justification]

## Risks and Mitigations
[Risks and how to address them]

## Appendix
- Code
- Data
- References
```

## Example Usage

```
User: "Research whether we should use WebSockets or Server-Sent Events for real-time updates"

AI (matches skill):
1. I'll define research questions (performance, scalability, complexity)
2. Conduct background research on both technologies
3. Design experiments (prototype both, measure performance)
4. Run experiments and capture metrics
5. Analyze results and compare trade-offs
6. Form recommendation with evidence
7. Create research report
8. Present findings
9. Compile evidence bundle
```

---

**See also**:
- [MCAF Development Cycle §7.5](https://mcaf.managed-code.com/#75-spike-and-research-flow)
- [agentic-coding-workflow.md §5.4](../../brainwav/governance/10-flow/agentic-coding-workflow.md#54-spike-and-research-flow)

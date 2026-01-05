# Skill: Feature Implementation

## Metadata
- **name**: feature-implementation
- **description**: Implement new features following brAInwav ArcTDD workflow with documentation-first, tests, and evidence
- **version**: 1.0.0
- **last_updated**: 2026-01-05
- **author**: brAInwav Development Team

## When This Skill Triggers

User queries like:
- "Implement a new feature"
- "Add [feature name] to the system"
- "Create functionality for [requirement]"
- "Build [user-facing capability]"

Task type is `feature` with complexity 1-7 on a 10-point scale.

## Workflow Steps

### 1. Describe (Before Coding)

**Goal**: Clear feature documentation before implementation.

**Actions**:
- Create or update feature doc under `docs/Features/` or `brainwav/governance/templates/feature-spec-template.md`
- Include: business rules, constraints, main flows, edge cases, Definition of Done
- Add at least one diagram (Mermaid flow, sequence, or architecture)
- Document test flows with expected results

**Deliverable**:
- [ ] Feature doc with scenarios, rules, Definition of Done
- [ ] Mermaid diagram showing main flow
- [ ] Test flows documented

### 2. Plan (≤7 Steps)

**Goal**: Structured plan within Step Budget.

**Actions**:
- Review context: existing code, ADRs, related features
- Propose ≤7-step implementation plan
- Identify files to change
- Identify tests to add/update (new/modified, related, full)
- Note any ADRs required for architecture changes
- Record plan in `tasks/<slug>/plan/PLAN.md`

**Deliverable**:
- [ ] PLAN.md with ≤7 steps
- [ ] Files to change listed
- [ ] Tests to add/update listed
- [ ] Risk register updated if needed

### 3. Implement Tests and Code Together

**Goal**: Red→Green→Refactor with evidence.

**Actions**:
- Write failing test for happy path (Red)
- Implement minimum code to pass (Green)
- Add negative and edge case tests
- Refactor for clarity while keeping tests green
- Follow coding rules from AGENT_CHARTER.md

**Deliverable**:
- [ ] Failing test → passing test evidence
- [ ] Code changes implemented
- [ ] All tests pass
- [ ] No hardcoded secrets/mocks

### 4. Run Tests in Layers

**Goal**: Layered test execution for fast feedback.

**Actions**:
```bash
# 1. New/modified tests for this change
pnpm test --changed

# 2. Related test suites (affected module)
pnpm test --related <module-name>

# 3. Full test sets (only for high-risk changes)
pnpm test
```

**Deliverable**:
- [ ] Test execution log recorded
- [ ] Failed tests analyzed (if any)
- [ ] Coverage delta report generated

### 5. Run Static Analysis

**Goal**: Code quality baseline met.

**Actions**:
```bash
# Run analyzer command from AGENTS.md
pnpm analyze
```

**Deliverable**:
- [ ] Static analysis passes
- [ ] Violations fixed or documented
- [ ] Targeted tests re-run if fixes touched behaviour

### 6. Update Docs and AGENTS.md

**Goal**: Documentation describes actual system.

**Actions**:
- Update feature doc to reflect actual implementation
- Update test doc to match real test coverage
- Propose AGENTS.md updates if new patterns emerged

**Deliverable**:
- [ ] Feature doc updated
- [ ] Test doc updated (if exists)
- [ ] AGENTS.md proposals recorded (if needed)

### 7. Evidence Triplet

**Goal**: Complete evidence for review.

**Actions**:
- Ensure tests.md has red→green proof
- Ensure contract snapshot (types/schema) exists
- Prepare review.json with findings

**Deliverable**:
- [ ] evidence/tests.md complete
- [ ] evidence/contract-snapshot.md exists
- [ ] evidence/review.json ready

## Scripts

- `scripts/validate-feature.sh`: Checks if feature doc exists before coding

## References

- `brainwav/governance/templates/feature-spec-template.md`: Feature specification template
- `brainwav/governance/templates/feature.md`: Alternative feature doc format

## Dependencies

- Requires `docs-first` principle to be established
- Works with any tier (Starter/Standard/Enterprise)

## Success Criteria

- [ ] Feature doc exists before coding starts
- [ ] Plan has ≤7 steps
- [ ] Tests and code move together (no "almost done" without tests)
- [ ] Layered test execution followed
- [ ] Static analysis passes
- [ ] Evidence Triplet complete
- [ ] Docs updated to reflect reality

## AI Participation Mode

**Default**: Collaborative (50/50 AI/Human)
- AI drafts feature doc, plan, code, tests
- Human steers architecture, scope, key decisions
- Human owns final merge decision

**For well-understood features**: Use Delegated mode (AI 80%+)

## Example Usage

```
User: "Implement user profile page with avatar upload"

AI (matches skill):
1. I'll create a feature doc for user profile page
2. Propose 5-step implementation plan
3. Write tests first, then implement
4. Run tests in layers
5. Run static analysis
6. Update docs
7. Prepare evidence triplet
```

---

**See also**:
- [MCAF Development Cycle §7](https://mcaf.managed-code.com/#7-development-cycle)
- [agentic-coding-workflow.md §5.1](../../brainwav/governance/10-flow/agentic-coding-workflow.md#51-feature-implementation-flow)
- [Layered Test Execution](../../docs/guide/layered-testing.md)

# Skill: Bug Fix

## Metadata
- **name**: bug-fix
- **description**: Fix bugs using TDD workflow with reproduction, hypothesis, testing, and verification
- **version**: 1.0.0
- **last_updated**: 2026-01-05
- **author**: brAInwav Development Team

## When This Skill Triggers

User queries like:
- "Fix a bug"
- "Fix incident [number]"
- "Reproduce this error"
- "Something is broken"

Task type is `fix` or `bug` with complexity 1-7 on a 10-point scale.

## Workflow Steps

### 1. Reproduce and Isolate

**Goal**: Reliable reproduction before any fix.

**Actions**:
- Create or update reproduction case in `tasks/<slug>/context/reproduction.md`
- Document exact steps to reproduce (environment, data, timing)
- Identify minimum reproduction (reduce complexity)
- Add reproduction test that currently fails
- Isolate the failure to specific component/flow

**Deliverable**:
- [ ] Reproduction case documented
- [ ] Failing test that reproduces bug
- [ ] Failure isolated to specific code

### 2. Form Hypothesis

**Goal**: Clear root cause theory before changing code.

**Actions**:
- Review context: logs, traces, related code, ADRs
- List 2-5 potential causes
- Rank by likelihood (use Occam's Razor)
- Form primary hypothesis with specific prediction
- Document in `tasks/<slug>/context/hypothesis.md`

**Deliverable**:
- [ ] 2-5 potential causes listed
- [ ] Primary hypothesis with prediction
- [ ] Hypothesis documented

### 3. Write Test That Exposes Root Cause

**Goal**: Test that fails with bug, passes with fix.

**Actions**:
- Write unit/integration test that captures root cause
- Test should fail with clear error message
- Add test to appropriate test suite
- Verify test fails before fix (Red)

**Deliverable**:
- [ ] Test that exposes root cause
- [ ] Test confirmed failing (Red)

### 4. Implement Minimal Fix

**Goal**: Smallest change that makes test pass.

**Actions**:
- Implement minimum code to pass the test (Green)
- Do NOT refactor yet
- Do NOT add "while I'm here" changes
- Follow coding rules from AGENT_CHARTER.md

**Deliverable**:
- [ ] Minimal fix implemented
- [ ] Test now passes (Green)
- [ ] No unrelated changes

### 5. Add Negative Cases and Edge Cases

**Goal**: Prevent regression and catch related bugs.

**Actions**:
- Add tests for edge cases around the fix
- Add negative tests (error paths, invalid inputs)
- Consider similar bugs in related code
- All tests must pass

**Deliverable**:
- [ ] Edge case tests added
- [ ] Negative tests added
- [ ] All tests pass

### 6. Refactor for Clarity (If Needed)

**Goal**: Improve design only after tests pass.

**Actions**:
- Refactor for clarity while keeping tests green
- Extract magic values to named constants
- Improve naming for readability
- Simplify complex logic
- Re-run tests after each refactor

**Deliverable**:
- [ ] Code refactored for clarity
- [ ] All tests still pass

### 7. Run Tests in Layers

**Goal**: No regressions in related code.

**Actions**:
```bash
# 1. New/modified tests for this bug fix
pnpm test --changed

# 2. Related test suites (affected module)
pnpm test --related <module-name>

# 3. Full test sets (only for high-risk fixes)
pnpm test
```

**Deliverable**:
- [ ] Test execution log recorded
- [ ] Failed tests analyzed (if any)
- [ ] Coverage delta report generated

### 8. Static Analysis

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

### 9. Update Docs and Close Loop

**Goal**: Documentation reflects reality and users are informed.

**Actions**:
- Update incident runbook if bug caused incident
- Update troubleshooting guides if user-facing bug
- Add entry to CHANGELOG if applicable
- Close related issue/PR with summary
- Document root cause in `tasks/<slug>/context/root-cause.md`

**Deliverable**:
- [ ] Incident runbook updated (if applicable)
- [ ] Troubleshooting guide updated (if applicable)
- [ ] CHANGELOG updated (if applicable)
- [ ] Issue/PR closed with summary
- [ ] Root cause documented

### 10. Evidence Triplet

**Goal**: Complete evidence for post-mortem.

**Actions**:
- Ensure tests.md has reproduction → fix proof
- Ensure contract snapshot (types/schema) exists
- Prepare review.json with findings

**Deliverable**:
- [ ] evidence/tests.md shows reproduction proof
- [ ] evidence/contract-snapshot.md exists
- [ ] evidence/review.json ready

## Scripts

- `scripts/reproduce-bug.sh`: Template for reproduction script

## References

- `brainwav/governance/templates/research-template.md`: Research doc template
- `brainwav/governance/runbooks/incident-response.md`: Incident runbook (if exists)

## Dependencies

- Requires test infrastructure to be in place
- Works with any tier (Starter/Standard/Enterprise)

## Success Criteria

- [ ] Bug is reliably reproduced
- [ ] Root cause hypothesis is confirmed
- [ ] Test fails before fix, passes after
- [ ] Minimal fix applied (no scope creep)
- [ ] All edge cases covered
- [ ] No regressions introduced
- [ ] Static analysis passes
- [ ] Documentation updated
- [ ] Evidence Triplet complete

## AI Participation Mode

**Default**: Collaborative (50/50 AI/Human)
- AI proposes hypothesis and writes tests
- Human reviews root cause analysis
- Human approves fix before deployment

**For simple bugs**: Use Delegated mode (AI 80%+)
- Clear reproduction and obvious root cause
- Low-risk code path

**For incidents**: Use Consultative mode (AI analysis only)
- AI provides hypothesis and options
- Human makes all fix decisions
- Full post-mortem required

## Example Usage

```
User: "Fix the login bug that's failing for users with special characters in passwords"

AI (matches skill):
1. I'll create a reproduction case with special character passwords
2. Form hypothesis (validation issue? encoding issue?)
3. Write test that exposes root cause
4. Implement minimal fix
5. Add edge case tests
6. Refactor if needed
7. Run tests in layers
8. Run static analysis
9. Update docs and close loop
10. Prepare evidence triplet
```

---

**See also**:
- [MCAF Development Cycle §7.3](https://mcaf.managed-code.com/#73-bug-fix-flow)
- [agentic-coding-workflow.md §5.2](../../brainwav/governance/10-flow/agentic-coding-workflow.md#52-bug-fix-flow)
- [Layered Test Execution](../../docs/guide/layered-testing.md)

# Skill: Refactor

## Metadata
- **name**: refactor
- **description**: Safely refactor code with test coverage, small steps, and verification
- **version**: 1.0.0
- **last_updated**: 2026-01-05
- **author**: brAInwav Development Team

## When This Skill Triggers

User queries like:
- "Refactor this code"
- "Clean up [module]"
- "Improve design of [component]"
- "This is hard to understand, fix it"

Task type is `refactor` with complexity 1-7 on a 10-point scale.

## Workflow Steps

### 1. Understand Current Behavior

**Goal**: Clear baseline before changing anything.

**Actions**:
- Read existing code and tests
- Identify what the code currently does (not what you think it should do)
- Document current behavior in `tasks/<slug>/context/before.md`
- Run existing tests to ensure they pass
- Check test coverage for affected code

**Deliverable**:
- [ ] Current behavior documented
- [ ] Existing tests pass
- [ ] Coverage baseline recorded

### 2. Define Refactoring Goal

**Goal**: Clear objective with success criteria.

**Actions**:
- Identify specific problem (complexity, coupling, duplication, clarity)
- Define desired outcome (simpler, clearer, more maintainable)
- Document refactoring goal in `tasks/<slug>/BRIEF.md`
- Ensure goal is specific and measurable

**Deliverable**:
- [ ] Refactoring goal defined
- [ ] Success criteria specified
- [ ] No behavior change intended

### 3. Characterization Tests (If Coverage < 80%)

**Goal**: Safety net for preserving existing behavior.

**Actions**:
- If coverage < 80%, add characterization tests
- Capture current behavior including edge cases
- Tests should document existing behavior (even bugs)
- All tests must pass

**Deliverable**:
- [ ] Characterization tests added (if needed)
- [ ] Coverage ≥ 80% for affected code
- [ ] All tests pass

### 4. Identify Refactoring Steps

**Goal**: Small, reversible steps.

**Actions**:
- Break refactoring into ≤7 small steps
- Each step must be independently testable and reversible
- Order steps to minimize risk
- Document plan in `tasks/<slug>/plan/PLAN.md`

**Deliverable**:
- [ ] ≤7 refactoring steps identified
- [ ] Each step is reversible
- [ ] Plan documented

### 5. Apply Refactoring Step-by-Step

**Goal**: Maintain passing tests throughout.

**Actions**:
- Apply one refactoring step
- Run tests immediately after each step
- If tests fail, revert the step and reconsider
- Commit after each passing step (optional but recommended)
- Continue until all steps complete

**Deliverable**:
- [ ] Each step applied with tests passing
- [ ] No broken state committed
- [ ] All refactoring steps complete

### 6. Verify Behavior Preservation

**Goal**: Confirm no functional changes.

**Actions**:
- Run full test suite for affected module
- Run integration tests if code has external dependencies
- Compare logs/traces before/after (if applicable)
- Check performance characteristics (if relevant)

**Deliverable**:
- [ ] All tests pass
- [ ] No functional changes detected
- [ ] Performance acceptable (if measured)

### 7. Run Tests in Layers

**Goal**: No regressions in related code.

**Actions**:
```bash
# 1. New/modified tests for this refactor
pnpm test --changed

# 2. Related test suites (affected module)
pnpm test --related <module-name>

# 3. Full test sets (only for high-risk refactorings)
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
- [ ] Complexity reduced (if applicable)
- [ ] Code smells addressed

### 9. Update Docs and AGENTS.md

**Goal**: Documentation describes new structure.

**Actions**:
- Update architecture diagrams if module boundaries changed
- Update AGENTS.md if new patterns emerged
- Update README/docstrings if public API changed
- Document refactoring rationale in `tasks/<slug>/context/after.md`

**Deliverable**:
- [ ] Architecture docs updated (if applicable)
- [ ] AGENTS.md updated (if applicable)
- [ ] API docs updated (if applicable)
- [ ] Rationale documented

### 10. Evidence Triplet

**Goal**: Complete evidence for review.

**Actions**:
- Ensure tests.md shows before/after comparison
- Ensure contract snapshot (types/schema) exists
- Prepare review.json with findings

**Deliverable**:
- [ ] evidence/tests.md shows behavior preservation
- [ ] evidence/contract-snapshot.md exists
- [ ] evidence/review.json ready

## Scripts

- `scripts/measure-complexity.sh`: Measure code complexity before/after

## References

- `brainwav/governance/templates/research-template.md`: Research doc template
- [Refactoring Guru](https://refactoring.guru/): Refactoring patterns and catalog

## Dependencies

- Requires test infrastructure to be in place
- Works with any tier (Starter/Standard/Enterprise)

## Success Criteria

- [ ] Current behavior well understood
- [ ] Refactoring goal clearly defined
- [ ] Characterization tests in place (if coverage < 80%)
- [ ] Applied in small, reversible steps
- [ ] All tests pass throughout
- [ ] No functional changes
- [ ] Code complexity reduced or clarity improved
- [ ] Static analysis passes
- [ ] Documentation updated
- [ ] Evidence Triplet complete

## AI Participation Mode

**Default**: Collaborative (50/50 AI/Human)
- AI proposes refactoring steps
- Human reviews each step before application
- Human confirms behavior preservation

**For simple refactorings**: Use Delegated mode (AI 80%+)
- Clear goal, low-risk code, good test coverage
- Examples: extract method, rename variable, simplify expression

**For complex refactorings**: Use Consultative mode (AI analysis only)
- AI provides refactoring options with trade-offs
- Human makes all decisions
- Each step requires explicit approval

## Common Refactoring Patterns

| Pattern | When to Use | Risk Level |
|---------|-------------|------------|
| Extract Method | Long method, duplicated code | Low |
| Rename | Unclear naming | Low |
| Extract Variable | Complex expression | Low |
| Replace Magic Number | Hardcoded values | Low |
| Extract Class | Large class with multiple responsibilities | Medium |
| Move Method | Method used more by another class | Medium |
| Replace Conditional with Polymorphism | Complex type-based logic | Medium |
| Extract Interface | Concrete dependency | Medium |
| Introduce Parameter Object | Long parameter lists | Medium |
| Replace Inheritance with Delegation | Fragile base class | High |

## Example Usage

```
User: "Refactor the UserService class, it's doing too much"

AI (matches skill):
1. I'll analyze current behavior of UserService
2. Define refactoring goal (separation of concerns)
3. Add characterization tests if coverage < 80%
4. Identify steps: extract validation, extract repository, extract domain logic
5. Apply each step with test verification
6. Verify behavior preservation
7. Run tests in layers
8. Run static analysis
9. Update architecture docs
10. Prepare evidence triplet
```

---

**See also**:
- [MCAF Development Cycle §7.4](https://mcaf.managed-code.com/#74-refactor-flow)
- [agentic-coding-workflow.md §5.3](../../brainwav/governance/10-flow/agentic-coding-workflow.md#53-refactor-flow)
- [Refactoring (Martin Fowler)](https://refactoring.com/)

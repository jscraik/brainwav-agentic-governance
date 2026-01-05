# ArcTDD Workflow

ArcTDD (Architectural Test-Driven Development) is brAInwav's core workflow for AI-assisted development.

## Overview

ArcTDD combines:
- **TDD principles**: Red → Green → Refactor
- **Architecture gates**: G0–G10 validation points
- **Evidence requirements**: Mandatory proof at each gate

## The G0–G10 Gates

### Foundation (G0–G2)
- **G0**: Security baseline checks
- **G1**: Build and basic tests pass
- **G2**: Core functionality tested

### Integration (G3–G4)
- **G3**: Interfaces and contracts defined
- **G4**: Observability and logging

### Quality (G5–G7)
- **G5**: E2E tests pass
- **G6**: Accessibility validated
- **G7**: Documentation complete

### Deployment (G8–G10)
- **G8**: Release package built
- **G9**: Deployment ready
- **G10**: Production monitoring

## Step Budget

All plans must be **≤7 steps**.

### Why 7 Steps?

- Prevents over-planning paralysis
- Keeps AI focused and scoped
- Matches cognitive load limits
- Forces prioritization

### Example Plan (5 steps)

1. Read task brief and existing code
2. Design API contract with types
3. Write failing test for happy path
4. Implement minimum viable solution
5. Add error handling and edge cases

## Evidence Requirements

Each gate requires evidence:

### G2 (Core Functionality)
- [ ] Failing test → passing test demonstration
- [ ] Test coverage report
- [ ] Basic functionality verified

### G5 (E2E Tests)
- [ ] E2E test suite passes
- [ ] User journey validated
- [ ] Performance baselines met

### G7 (Documentation)
- [ ] README updated
- [ ] API docs generated
- [ ] Changelog entry

## Canonical Flows

See [Governance Quickstart](../../brainwav/governance/10-flow/governance-quickstart.md) for complete workflows:

- [Feature Implementation](../../brainwav/governance/10-flow/governance-quickstart.md#41-feature-implementation-flow)
- [Research / Spike](../../brainwav/governance/10-flow/governance-quickstart.md#42-research--spike-flow)
- [Fix Implementation](../../brainwav/governance/10-flow/governance-quickstart.md#43-fix-implementation-flow-bug--incident)
- [Refactor / Cleanup](../../brainwav/governance/10-flow/governance-quickstart.md#44-refactor--cleanup-flow)
- [Code Review](../../brainwav/governance/10-flow/governance-quickstart.md#45-code-review-flow)

## Tips for AI Assistants

When working with AI, specify:

> "Follow brAInwav ArcTDD workflow:
> 1. Create a ≤7-step plan
> 2. Write failing tests first (Red)
> 3. Implement to pass tests (Green)
> 4. Refactor for clarity (Refactor)
> 5. Generate Evidence Triplet"

## Next Steps

- [Evidence Triplet](./evidence-triplet.md)
- [Step Budget details](./step-budget.md)
- [Quickstart Guide](../QUICKSTART-5min.md)

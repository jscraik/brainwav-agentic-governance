# Tasks: 000-governance-classification

**Spec**: specs/000-governance-classification/spec.md  
**Plan**: specs/000-governance-classification/plan.md  
**Last Updated**: 2026-01-02

---

## Task List

1. **Task ID**: 000-governance-classification
   - **Goal**: Create SDD spec chain for governance classification enforcement.
   - **Evidence**: tasks/000-governance-classification/
   - **Notes**: None

2. **Task ID**: 000-governance-classification-validate
   - **Goal**: Validate governance with SDD pack enabled.
   - **Evidence**: tasks/000-governance-classification-validate/
   - **Notes**: Requires `pnpm governance:validate --strict`

---

## Traceability
- Every task folder must reference this spec and plan.
- Task evidence must be linked in run-manifest.json.

## Verify & Learn (PAI)
- **Verification commands**: `pnpm governance:validate --strict`
- **Success criteria**: SDD pack checks pass without failures.
- **Learnings captured**: tasks/000-governance-classification/lessons-learned.md (if needed)

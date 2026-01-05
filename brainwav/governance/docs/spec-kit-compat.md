# Spec-Kit Compatibility Contract

## Table of Contents

- [Layouts (supported)](#layouts-supported)
- [Required files](#required-files)
- [Enforcement policy (profile + change class)](#enforcement-policy-profile-change-class)
- [Naming](#naming)
- [Required sections in spec.md](#required-sections-in-specmd)
- [Required cross-links](#required-cross-links)
- [Lifecycle rules](#lifecycle-rules)
- [Checks (stable IDs)](#checks-stable-ids)
- [CLI usage](#cli-usage)
- [Appendix: Verify](#appendix-verify)
- [Appendix: Troubleshooting](#appendix-troubleshooting)


This document defines what “Spec-Kit compatible” means in brAInwav governance.
It is enforced by `brainwav-governance spec validate` and the `sdd` pack checks.
Compatibility is pack-scoped; no additional toolchain is required beyond the pack.

**Note:** Compatibility is file layout + required sections + stable check IDs. brAInwav does not require a separate Python toolchain to satisfy this contract.

## Layouts (supported)

Exactly one of the following layouts must be used:

1) **Root layout**

```
specs/
  <slug>/
    spec.md
    plan.md
    tasks.md
```

2) **Spec-kit layout**

```
.specify/
  constitution.md
  templates/
    spec-template.md
    plan-template.md
    tasks-template.md
  specs/
    <slug>/
      spec.md
      plan.md
      tasks.md
```

If both layouts exist, validation warns and you must choose one.

## Required files

- `spec.md` (must include: Current state, Desired state, Success criteria, Verification)
- `plan.md` (must include: Architecture/approach, Risks, Verification plan)
- `tasks.md` (must include: a task list and trace pointers to implementation artifacts)

## Enforcement policy (profile + change class)

- creative: warn if spec chain is missing; require only when change class mandates.
- delivery: require spec chain for Feature/Refactor classes; warn for Minor docs/ops changes.
- release: require spec chain for any change class flagged as `requires_spec_chain`.

## Naming

- `<slug>` SHOULD match `^\d{3}-[a-z0-9][a-z0-9-]*$` (warn in creative; fail in release if enabled by change class).

Per spec directory (`specs/<slug>/` or `.specify/specs/<slug>/`):

- `spec.md`
- `plan.md`
- `tasks.md`

For `.specify` layout only:

- `.specify/constitution.md`
- `.specify/templates/spec-template.md`
- `.specify/templates/plan-template.md`
- `.specify/templates/tasks-template.md`

Optional:

- Adapter-specific templates or scripts (pack-scoped).
- Directory-level overrides are allowed when defined by the active pack.

## Required sections in spec.md

The following section headers must appear verbatim in each `spec.md`:

- `Current state`
- `Desired state`
- `Success criteria`
- `How we will verify`

## Required cross-links

Each artifact must link to its siblings using absolute repo-relative paths:

- `spec.md` links to `specs/<slug>/plan.md` and `specs/<slug>/tasks.md`
- `plan.md` links to `specs/<slug>/spec.md` and `specs/<slug>/tasks.md`
- `tasks.md` links to `specs/<slug>/spec.md` and `specs/<slug>/plan.md`
- `tasks.md` includes at least one `tasks/` evidence reference

## Lifecycle rules

- `tasks.md` must not exist without `plan.md`
- If `plan.md` exists, `tasks.md` is expected (warn if missing)

If `plan.md` exists, the following artifacts are expected (warn if missing):

- `contracts/`
- `data-model.md`
- `research.md`
- `quickstart.md`

## Checks (stable IDs)

These checks are emitted by `brainwav-governance spec validate`:

- `spec.layout` — layout detected and singular
- `spec.memory.constitution` — constitution present for `.specify`
- `spec.templates.present` — required templates present for `.specify`
- `spec.templates.claude` — optional Claude template present
- `spec.scripts.present` — optional `.specify/scripts` present
- `spec.claude.present` — optional `CLAUDE.md` present
- `spec.specs.present` — at least one spec directory with `spec.md`
- `spec.specs.naming` — slug naming (`^\d{3}-`)
- `spec.lifecycle` — plan/tasks ordering is valid
- `spec.plan.artifacts` — plan artifact set is present (warn)
- `spec-chain.present` — spec/plan/tasks chain exists
- `spec-chain.consistency` — links and required sections are consistent
- `spec.clarify.missing` — clarify gaps detected
- `spec.analyze.consistency` — analyze drift detected
- `spec.checklist.missing` — checklist gaps detected

## CLI usage

```bash
pnpm exec brainwav-governance spec validate --spec-root specs
pnpm exec brainwav-governance spec validate --spec-root .specify/specs --compat speckit
```

## Appendix: Verify

- Run `pnpm exec brainwav-governance spec validate --spec-root specs` and confirm spec-chain checks pass.
- If using `.specify`, run `pnpm exec brainwav-governance spec validate --spec-root .specify/specs --compat speckit`.

## Appendix: Troubleshooting

- `spec-chain.present` failing: ensure `spec.md`, `plan.md`, and `tasks.md` exist under the same `<slug>` directory.
- `spec-chain.consistency` failing: check required headers in `spec.md` and absolute repo-relative cross-links.

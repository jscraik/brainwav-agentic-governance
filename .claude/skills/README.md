# Skills System (MCAF-Aligned)

**Status**: MANDATORY - Progressive disclosure for agent workflows
**Version**: 1.0.0
**Last Updated**: 2026-01-05

---

## Overview

Skills are versioned workflow packages that make repetitive agent work predictable. They provide **progressive disclosure**—only skill metadata is loaded at startup; skill bodies load on-demand when matched.

---

## Skills Structure

```
.claude/skills/
├── _template/
│   └── SKILL.md                    # Skill template
├── feature-implementation/
│   ├── SKILL.md                    # Trigger + workflow
│   ├── scripts/                    # Helper scripts (optional)
│   ├── references/                 # Templates loaded on-demand
│   └── assets/                     # Boilerplate (optional)
├── bug-fix/
│   └── SKILL.md
├── refactor/
│   └── SKILL.md
└── research/
    └── SKILL.md
```

---

## Skill Metadata (Required)

Every `SKILL.md` must include:

- **name**: Human-readable skill name
- **description**: Trigger phrase (what user queries match this skill)
- **version**: Semantic version (1.0.0)
- **last_updated**: ISO date
- **triggers**: User queries or task types that activate this skill
- **workflow_steps**: 3-7 clear steps with deliverables
- **success_criteria**: Clear completion conditions

---

## Progressive Disclosure Principle

**At startup** (agent loads working context):
- Only `SKILL.md` metadata section (lines 1-30)
- Skill name, description, version, triggers

**On match** (when user query matches skill):
- Load full `SKILL.md` body with workflow steps
- Load `references/` templates if needed
- Load `scripts/` if automation required

**Why this matters**:
- Faster agent startup (doesn't load 100+ skills upfront)
- Better composability (skills depend on skills)
- Clearer ownership (each skill is a mini-product)

---

## Skill Versioning

Skills follow semantic versioning:

- **MAJOR** (1.x → 2.0): Breaking workflow changes, new required steps
- **MINOR** (1.0 → 1.1): New optional steps, clarifications
- **PATCH** (1.0.1): Bug fixes, typo corrections

**Update process**:
1. User feedback shows skill is mis-triggering
2. Update `description` (triggers) and workflow steps
3. Increment version
4. Update `last_updated`
5. CI validates skill metadata

---

## Required Skills

Every brAInwav-governed repo must include these skills:

| Skill | Purpose | Trigger |
|-------|---------|---------|
| `feature-implementation` | Canonical feature workflow | "Implement a feature", "Add new functionality" |
| `bug-fix` | TDD bug fixing workflow | "Fix a bug", "Fix incident", "Reproduce error" |
| `refactor` | Safe refactoring with tests | "Refactor", "Clean up", "Improve design" |
| `research` | Spike and research workflow | "Research", "Spike", "Explore feasibility" |

---

## Integration with AGENTS.md

Skills extend but don't replace `AGENTS.md`:

- **AGENTS.md**: Global rules, coding standards, commands
- **Skills**: Repeatable workflows with templates and scripts

Skills must respect AGENTS.md rules:
- Step Budget ≤ 7
- Ask-First ≤ 3
- Proof Required
- Evidence Triplet

---

## Validation

CI checks:
- [ ] Each skill has valid `SKILL.md` with required metadata
- [ ] Skill triggers are specific (not overly broad)
- [ ] Workflow steps are actionable and testable
- [ ] Success criteria are clear and measurable
- [ ] Skills respect AGENTS.md constraints

---

## Creating New Skills

**When to create a skill**:
- Recurring task type appears 3+ times
- Complex workflow benefits from templates
- Task has specific triggers that can be codified

**Process**:
1. Copy `_template/SKILL.md` to new skill directory
2. Fill in metadata (name, description, triggers)
3. Define 3-7 workflow steps
4. Add scripts/references if needed
5. Test with real tasks
6. Update this index

---

## Skills Index

| Skill | Version | Triggers | Dependencies |
|-------|---------|----------|--------------|
| `feature-implementation` | 1.0.0 | "Implement", "Add feature", "New functionality" | - |
| `bug-fix` | 1.0.0 | "Fix bug", "Fix incident", "Reproduce error" | - |
| `refactor` | 1.0.0 | "Refactor", "Clean up", "Improve design" | - |
| `research` | 1.0.0 | "Research", "Spike", "Explore", "Feasibility" | - |

---

**See also**:
- [MCAF Guide §2.6](https://mcaf.managed-code.com) - Skills (repeatable agent workflows)
- [AGENT_CHARTER.md](../00-core/AGENT_CHARTER.md) - Core agent behavior rules
- [agentic-coding-workflow.md](../10-flow/agentic-coding-workflow.md) - Canonical flows

# brAInwav vs MCAF: Comparative Analysis & Improvement Recommendations

**Date**: January 5, 2026
**Analysis Type**: Deep Dive Framework Comparison
**Goal**: Identify specific improvements to brAInwav based on MCAF principles

---

## Executive Summary

MCAF (Managed Code Coding AI Framework) and brAInwav share **80% overlap** in philosophy—both are governance-as-code frameworks for AI-assisted development. However, MCAF has several **pragmatic refinements** that brAInwav could adopt to improve clarity, reduce friction, and increase adoption.

**Key finding**: MCAF is more prescriptive about **day-to-day workflows** while brAInwav is more comprehensive on **compliance and security**. The sweet spot is brAInwav's depth with MCAF's pragmatism.

---

## Part 1: What MCAF Does Better (Adopt These)

### 1. **Skills System for Repeatable Agent Workflows**

**MCAF Approach**:
- Skills are versioned workflow packages: `.codex/skills/<name>/SKILL.md`
- Each skill has: metadata, scripts/, references/, assets/
- **Progressive disclosure**: Only skill metadata loaded at startup; skill body loaded on-demand
- Skills are treated as "versioned workflow code" that evolves based on feedback

**brAInwav Current State**:
- Has `brainwav/governance/commands/` with executable commands
- Has `brainwav/governance/tools/` for agent tools
- Lacks the progressive disclosure pattern
- No formal versioning for workflows

**🎯 Recommendation**: Adopt MCAF's Skills System

```bash
# New structure
.claude/skills/
├── feature-implementation/
│   ├── SKILL.md          # Trigger description + workflow steps
│   ├── scripts/          # Automation scripts
│   ├── references/       # Templates loaded on-demand
│   └── assets/           # Boilerplate
├── bug-fix/
│   └── SKILL.md
└── refactor/
    └── SKILL.md
```

**Benefits**:
- Faster agent startup (only load metadata)
- Better composability (skills can depend on skills)
- Clearer ownership (each skill is a mini-product)

---

### 2. **Four-Perspective Role Model**

**MCAF Approach**:
```
Product  → What the system does and why (features, DoD)
Dev      → How the system is built (ADRs, AGENTS.md, build/test commands)
QA       → How behaviour is verified (test docs, environments)
AI Agent → Generation and adaptation within rules
```

**brAInwav Current State**:
- Has "Roles & Responsibilities" but less clearly defined
- Perspectives exist but are fragmented across docs
- No clear accountability mapping

**🎯 Recommendation**: Explicit Four-Perspective Model

Add to `AGENT_CHARTER.md`:

```markdown
## Four Perspectives (MCAF-Aligned)

| Perspective | Accountability | Key Responsibilities |
|-------------|-----------------|---------------------|
| **Product** | "What & Why" | Feature docs, business rules, Definition of Done |
| **Dev** | "How" | ADRs, AGENTS.md, build/test/format/analyze commands |
| **QA** | "Verification" | Test docs, environments, coverage validation |
| **AI Agent** | "Generation" | Code/tests/docs generation, pattern extraction |
```

**Benefits**:
- Clearer ownership (no "who does this?" questions)
- Better alignment with actual software development roles
- Easier to explain to teams adopting AI governance

---

### 3. **Layered Test Execution Strategy**

**MCAF Approach**:
```
1. New/modified tests for this change
2. Related suites for affected feature/module
3. Full required test sets (unit, integration, API, UI/E2E)
```

**brAInwav Current State**:
- Has ArcTDD gates (G0–G10)
- Has evidence triplet requirements
- Lacks **prescriptive test ordering**
- No "run only what's needed" guidance

**🎯 Recommendation**: Add Layered Test Strategy

Add to `agentic-coding-workflow.md`:

```markdown
### Layered Test Execution (MCAF-Aligned)

**Order matters** - run tests in this sequence:

1. **Change-specific tests** (new/modified tests for this task)
   - Fast feedback on whether this change breaks anything

2. **Related test suites** (affected feature/module/service)
   - Catch regressions in related areas

3. **Full test sets** (only when change is high-risk or cross-cutting)
   - Run complete test suite as final gate

**Why this order?**
- Fail fast on actual changes (1)
- Catch ripple effects before full suite (2)
- Full suite as final safety net (3)
```

**Benefits**:
- Faster feedback loops (no waiting for full suite when unnecessary)
- Clearer mental model for developers
- Better CI resource utilization

---

### 4. **AI Participation Modes (Delegated/Collaborative/Consultative)**

**MCAF Approach**:
- **Delegated**: AI does 80%+, humans review (routine work)
- **Collaborative**: AI + humans work closely (complex features)
- **Consultative**: AI analyzes/explains, humans implement (onboarding/exploration)

**brAInwav Current State**:
- Has "Creative vs Delivery vs Release modes" (workflow profiles)
- Has "Agent (Delegate) vs Human (Review) vs Human (Own)" (task ownership)
- Lacks explicit **AI participation modes per task**

**🎯 Recommendation**: Add AI Participation Modes

Add to `agentic-coding-workflow.md`:

```markdown
### AI Participation Modes

Choose mode per task based on complexity and risk:

| Mode | AI Contribution | When to Use | Example |
|------|----------------|-------------|---------|
| **Delegated** | 80%+ of work | Well-understood, routine | Bug fixes with repro, small features |
| **Collaborative** | 50% AI / 50% human | Complex, high-risk | Architectural changes, new systems |
| **Consultative** | Analysis only | Onboarding, exploration | Codebase reviews, design options |

**How to choose**:
- Use **Delegated** for tasks 1-3 on complexity scale
- Use **Collaborative** for tasks 4-7
- Use **Consultative** for learning/exploration
```

**Benefits**:
- Clearer expectations for AI vs human contribution
- Better task estimation (delegated = faster, collaborative = slower)
- Reduces "AI took over and did wrong thing" problems

---

### 5. **Development Cycle with "Docs First"**

**MCAF Development Cycle**:
1. **Describe**: Feature docs, ADRs, test docs (before coding)
2. **Plan**: Agent proposes plan, human adjusts
3. **Implement**: Tests and code together
4. **Run tests in layers**: Change → Related → Full
5. **Run static analysis**: Part of DoD
6. **Update docs**: Docs describe actual system
7. **Review & merge**: Tests pass, analyzers pass

**brAInwav Current State**:
- Has ArcTDD gates but **doesn't prescribe doc-first**
- Has spec-driven development (SDD pack) but not as default
- Emphasis is on **coding workflow**, not **documentation workflow**

**🎯 Recommendation**: Strengthen "Docs First" Principle

Add to `AGENT_CHARTER.md`:

```markdown
### Docs First Principle (MCAF-Aligned)

**Rule**: No significant coding without prior documentation.

**Before coding starts**:
1. Feature doc exists with scenarios, rules, Definition of Done
2. ADR exists for architectural changes
3. Test doc exists with test cases and expected results

**Minimum viable documentation**:
- Small bug fix: GitHub issue with reproduction steps
- Medium feature: 1-page feature doc
- Large feature: Full spec (use SDD pack)

**AI assistance**: AI drafts docs, humans validate business meaning.
```

**Benefits**:
- Forces thinking before coding
- Better collaboration (AI has context)
- Reduces rework (misunderstandings caught early)

---

### 6. **Architecture Overview Mandate**

**MCAF Hard Rule**:
> "Every repo has `docs/Architecture/Overview.md` as the global 'read first' map."

**brAInwav Current State**:
- Has architecture documentation in templates
- Has `docs/references/` but **no required architecture overview**
- No explicit "read first" document

**🎯 Recommendation**: Mandate Architecture Overview

Add to `governance-index.json` as required file:

```json
{
  "required_files": {
    "architecture_overview": "docs/Architecture/Overview.md"
  }
}
```

Template for `Overview.md`:

```markdown
# Architecture Overview

## System Purpose
[What this system does in 2-3 sentences]

## Module Boundaries
[Main modules and their responsibilities]

## Key Flows
[Critical user journeys with diagram]

## Technology Choices
[Stack and rationale]

## Read Next
- [Feature docs](../Features/)
- [ADRs](../ADR/)
```

**Benefits**:
- Faster onboarding (one file to understand whole system)
- Single source of truth for high-level structure
- Forces regular architecture hygiene

---

### 7. **Self-Learning System for AGENTS.md**

**MCAF Approach**:
- **Feedback categories**: directive, preference, evaluation, process, correction, emotional, pattern
- Agents recognize when feedback should become a rule
- Agents decide scope (local vs global) for new rules
- Stable patterns are written to AGENTS.md; chat is not memory

**brAInwav Current State**:
- Has AGENTS.md instructions
- Has "governance hash" system
- **Lacks explicit self-learning methodology**
- No feedback categorization

**🎯 Recommendation**: Add Self-Learning System

Add to `AGENT_CHARTER.md`:

```markdown
### Self-Learning System (MCAF-Aligned)

**Principle**: Conversations are not memory. Stable patterns are written to AGENTS.md.

**Feedback Categories**:
- **Directive**: "Must do X" / "Must never do Y"
- **Preference**: "I like concise explanations" / "Verbose docs preferred"
- **Evaluation**: "This is clean" / "This is messy"
- **Process**: "We deploy via blue-green, not rolling"
- **Correction**: "Never hardcode secrets, use env vars"
- **Emotional**: Strong emotion signals serious issues
- **Pattern**: Recurring feedback across 3+ tasks

**When to update AGENTS.md**:
1. Feedback recurs 3+ times across different tasks → Make it a rule
2. Human explicitly says "this should be in AGENTS.md" → Add immediately
3. Pattern appears in code reviews → Consider rule addition

**AI Agent Responsibilities**:
- Scan feedback for patterns during code review
- Propose AGENTS.md updates when patterns emerge
- Categorize feedback by type when recording
```

**Benefits**:
- Governance improves over time (not static)
- Reduces repetitive corrections
- Makes learning from mistakes systematic

---

## Part 2: What brAInwav Does Better (Keep These)

### 1. **Security & Compliance Mapping**
- ✅ brAInwav: OWASP, NIST, ISO, SLSA, SPDX, Sigstore
- ❌ MCAF: Basic static analysis, no formal compliance mapping

### 2. **Tiered Progressive Enhancement**
- ✅ brAInwav: Starter → Standard → Enterprise
- ❌ MCAF: All-or-nothing adoption

### 3. **Hash-Pinned Governance**
- ✅ brAInwav: SHA-256 hashes for every normative doc
- ❌ MCAF: No integrity verification

### 4. **MCP Integration**
- ✅ brAInwav: First-class MCP support
- ❌ MCAF: No MCP integration

### 5. **Evidence Triplet**
- ✅ brAInwav: Formalized evidence requirements (tests + contract + review)
- ❌ MCAF: Less prescriptive about evidence

### 6. **Step Budget**
- ✅ brAInwav: ≤7 steps enforced
- ❌ MCAF: No step limit

---

## Part 3: Specific Actionable Improvements

### Priority 1: Add Skills System (Week 1)

**Action**: Create skills directory structure

```bash
# Create skills directory
mkdir -p .claude/skills/{feature,fix,refactor,research}

# Create skill template
cat > .claude/skills/_template/SKILL.md << 'EOF'
# Skill: {{NAME}}

## Metadata
name: {{NAME}}
description: {{TRIGGER PHRASE}}
version: 1.0.0
last_updated: 2026-01-05

## When This Skill Triggers
{{User queries that match this skill}}

## Workflow Steps
1. {{Step 1}}
2. {{Step 2}}
3. {{Step 3}}

## Scripts
- `scripts/{{script-name}}`: {{purpose}}

## References
- `references/{{template}}`: {{usage}}
EOF

# Create example skill
cp _template feature/
```

**Files to modify**:
- `AGENTS.md`: Add skills system section
- `brainwav/governance/90-infra/governance-index.json`: Add skills validation

---

### Priority 2: Add Four-Perspective Model (Week 1)

**Action**: Update AGENT_CHARTER.md with explicit perspectives

Add section:

```markdown
## Four Perspectives

Each change has clear accountability:

| Perspective | Owner | Responsibilities |
|-------------|--------|------------------|
| **Product** | @product-owner | Feature docs, business rules, DoD |
| **Dev** | @tech-lead | ADRs, AGENTS.md, commands |
| **QA** | @qa-lead | Test docs, environments |
| **AI Agent** | Claude/Cursor/Copilot | Code/tests/docs generation |

**Rule**: Each perspective has a human owner. AI Agent is accountable only for generation within rules.
```

---

### Priority 3: Add Layered Test Strategy (Week 2)

**Action**: Update agentic-coding-workflow.md

Add to G5 (Quality Gate) section:

```markdown
### G5: Quality Gate - Layered Test Execution

**Test Order** (MCAF-aligned):
1. Change-specific tests (new/modified)
2. Related test suites (affected module)
3. Full test sets (only for high-risk changes)

**Commands**:
```bash
# 1. Run new/modified tests
pnpm test --changed

# 2. Run related suites
pnpm test --related <module>

# 3. Run full suite (only if needed)
pnpm test
```

**Evidence Required**:
- Test execution log (which tests, runtime, pass/fail)
- Failed test analysis (if any)
- Coverage delta report (did coverage improve?)
```

---

### Priority 4: Add AI Participation Modes (Week 2)

**Action**: Update agentic-coding-workflow.md

Add new section:

```markdown
### AI Participation Modes

Choose mode per task:

**Delegated** (AI 80%+):
- Well-understood changes
- Routine bug fixes
- Small features
- Command: `pnpm exec brainwav-governance task init --mode delegated`

**Collaborative** (AI 50% / Human 50%):
- Complex features
- Architectural changes
- High-risk modifications
- Command: `pnpm exec brainwav-governance task init --mode collaborative`

**Consultative** (AI analysis only):
- Onboarding
- Design exploration
- Security reviews
- Command: `pnpm exec brainwav-governance task init --mode consultative`
```

---

### Priority 5: Strengthen "Docs First" (Week 3)

**Action**: Add documentation gate to G1 (Foundation)

Update AGENT_CHARTER.md:

```markdown
### G1: Foundation Gate - Docs First

**Required before G1 passes**:
- [ ] Feature doc exists (or GitHub issue for small fixes)
- [ ] ADR exists (if architecture changes)
- [ ] Test doc exists (if new test cases)

**Minimum viable docs**:
| Task Type | Required Docs |
|-----------|---------------|
| Trivial fix | GitHub issue with reproduction |
| Small feature | 1-page feature doc |
| Medium feature | Full spec (SDD pack) |
| Large feature | Full spec + ADR |

**AI Assistance**: AI drafts all docs; humans validate business meaning.
```

---

### Priority 6: Create Architecture Overview Template (Week 3)

**Action**: Add to brainwav/governance/templates/

Create `architecture-overview.md`:

```markdown
# Architecture Overview

## System Purpose
{{What this system does in 2-3 sentences}}

## Module Boundaries
{{Main modules and their responsibilities}}

## Key Flows
{{Critical user journeys - include Mermaid diagram}}

## Technology Choices
{{Stack and rationale}}

## Data Flow
{{How data moves through system - include diagram}}

## Deployment
{{How system is deployed - include diagram}}

## Read Next
- [Features](../docs/Features/)
- [ADRs](../docs/ADR/)
- [Testing](../docs/Testing/)
```

**Add to governance-index.json**:
```json
{
  "required_files": {
    "architecture_overview": "docs/Architecture/Overview.md"
  }
}
```

---

### Priority 7: Add Self-Learning System (Week 4)

**Action**: Extend AGENT_CHARTER.md

Add section:

```markdown
### Self-Learning System

**Principle**: Stable patterns are written to AGENTS.md; chat is not memory.

**Feedback Categories**:
- **Directive**: Must/must not rules
- **Preference**: Style/verbosity choices
- **Evaluation**: Quality judgments
- **Process**: Workflow expectations
- **Correction**: Never do this again
- **Emotional**: Strong emotion = serious issue
- **Pattern**: Recurring 3+ times

**AI Agent Responsibilities**:
1. Scan code review feedback for patterns
2. Categorize feedback by type
3. Propose AGENTS.md updates when patterns emerge
4. Distinguish one-time preferences from stable rules

**Human Responsibilities**:
1. Review AI-proposed AGENTS.md changes
2. Approve/reject based on stability and alignment
3. Explicitly mark corrections as "add to AGENTS.md"

**Example**:
```
# Feedback: "Extract magic strings to constants"
# Appears: 3 times across different reviews
# Action: AI proposes AGENTS.md addition: "All literals extracted to named constants"
# Human: Approves if pattern is stable and beneficial
```
```

---

## Part 4: Integration Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Goal**: Add MCAF's best pragmatism without changing brAInwav's depth

**Tasks**:
1. ✅ Create skills directory structure
2. ✅ Add four-perspective model to AGENT_CHARTER.md
3. ✅ Add layered test strategy
4. ✅ Add AI participation modes

**Files modified**:
- `AGENT_CHARTER.md`
- `agentic-coding-workflow.md`
- `governance-index.json`

---

### Phase 2: Documentation First (Weeks 3-4)

**Goal**: Strengthen documentation requirements

**Tasks**:
1. ✅ Add "docs first" to G1 gate
2. ✅ Create architecture overview template
3. ✅ Add self-learning system
4. ✅ Update validation to check for docs

**Files created**:
- `brainwav/governance/templates/architecture-overview.md`
- `brainwav/governance/templates/feature-doc.md`

---

### Phase 3: Skills Implementation (Month 2)

**Goal**: Build out skills system with first 5 skills

**Skills to create**:
1. `feature-implementation` - Canonical feature workflow
2. `bug-fix` - TDD bug fixing workflow
3. `refactor` - Safe refactoring with tests
4. `research` - Spike/research workflow
5. `security-review` - Security-focused review

**Each skill includes**:
- `SKILL.md` - Trigger description + workflow
- `scripts/` - Helper scripts if needed
- `references/` - Templates and examples

---

### Phase 4: Validation & Polish (Month 2)

**Goal**: Ensure all improvements work together

**Tasks**:
1. Update CI to validate docs-first requirement
2. Add skills validation to governance checks
3. Test layered test execution in CI
4. Document all changes in QUICKSTART

---

## Part 5: Potential Conflicts & Resolutions

### Conflict 1: MCAF's "No Mocks" vs brAInwav's Testing Approach

**MCAF Position**: "Primary test suites do not use mocks or fakes for internal systems."

**brAInwav Position**: Has guidance on testing but less prescriptive about mocks.

**Resolution**: Keep brAInwav flexible but add MCAF's principle:
```markdown
### Testing Philosophy (MCAF-Aligned)

**Preference**: Test against real systems when possible.
**Guideline**: If you need to mock an internal system, treat it as a design smell.
**Exception**: External systems (payment gateways, SMS providers) may use fakes.
```

---

### Conflict 2: MCAF's Simplicity vs brAInwav's Compliance Depth

**MCAF Position**: "Keep it simple. Tests + analyzers = decision makers."

**brAInwav Position**: "Full compliance suite with OWASP, NIST, ISO mapping."

**Resolution**: Tiered approach preserves both:
- **Starter**: MCAF-like simplicity (tests + basic linting)
- **Standard**: More security (semgrep, gitleaks)
- **Enterprise**: Full brAInwav compliance depth

---

### Conflict 3: Skills System vs Existing Commands

**MCAF Position**: "Skills are versioned workflow packages with progressive disclosure."

**brAInwav Position**: "Commands are executable scripts under brainwav/governance/commands/."

**Resolution**: Hybrid approach:
- Keep **commands** for one-off operations (`memorize`, `recall`, `daily-summary`)
- Add **skills** for complex multi-step workflows (`feature-implementation`, `bug-fix`)
- Skills can call commands internally

---

## Part 6: Summary of Recommendations

### Top 5 Highest-Impact Improvements

| # | Improvement | Effort | Impact | Why |
|---|-------------|--------|--------|-----|
| 1 | **Add Skills System** | Medium | Very High | Progressive disclosure = faster AI |
| 2 | **Layered Test Strategy** | Low | High | Faster feedback, better CI resource use |
| 3 | **Four-Perspective Model** | Low | High | Clearer accountability, easier adoption |
| 4 | **AI Participation Modes** | Low | Medium | Better expectations, fewer surprises |
| 5 | **Docs First Gate** | Medium | High | Forces thinking, reduces rework |

### Quick Wins (Implement Today)

1. **Add four-perspective model** to AGENT_CHARTER.md (30 minutes)
2. **Add layered test strategy** to agentic-coding-workflow.md (1 hour)
3. **Add AI participation modes** as CLI flags (2 hours)

### Medium-Term (This Sprint)

1. Create skills directory structure (4 hours)
2. Build first 3 skills (feature, fix, refactor) (1 day)
3. Add docs-first to G1 gate (2 hours)
4. Create architecture overview template (2 hours)

### Long-Term (Next Quarter)

1. Build out full skills library (10+ skills)
2. Implement self-learning system
3. Add docs validation to CI
4. Create migration guide from MCAF

---

## Part 7: What Makes brAInwav Unique (Don't Lose These)

Even after adopting MCAF improvements, brAInwav remains differentiated by:

1. **Security & Compliance Depth**: OWASP, NIST, ISO, SLSA, SPDX, Sigstore
2. **Hash-Pinned Governance**: SHA-256 integrity for every policy doc
3. **Tiered Progressive Enhancement**: Starter → Standard → Enterprise
4. **MCP Integration**: First-class Model Context Protocol support
5. **Evidence Triplet**: Formalized evidence requirements
6. **Step Budget**: ≤7 steps prevents over-planning
7. **Cortex-Aegis Oversight**: Pre-flight risk assessment
8. **Academic Research Integration**: Citations and license tracking

**Positioning**: brAInwav = MCAF pragmatism + enterprise-grade compliance + AI governance

---

## Conclusion

MCAF provides excellent **workflow pragmatism** that brAInwav should adopt:
- Skills system for repeatable workflows
- Four-perspective accountability model
- Layered test execution
- AI participation modes
- Docs-first principle
- Self-learning system

brAInwav provides superior **compliance depth** that MCAF lacks:
- Formal security mapping (OWASP, NIST, ISO)
- Hash-pinned governance integrity
- Tiered progressive enhancement
- MCP integration
- Evidence triplets

**The best of both worlds**: brAInwav's depth with MCAF's pragmatism.

---

**Next Steps**:
1. Review and prioritize recommendations
2. Create implementation plan for Quick Wins
3. Begin Phase 1 (Foundation) tasks
4. Measure impact (adoption, developer satisfaction, AI effectiveness)

**Would you like me to**:
- Draft the skills system specification?
- Create the four-perspective AGENT_CHARTER.md section?
- Implement layered test strategy?
- Design the first 3 skills (feature, fix, refactor)?

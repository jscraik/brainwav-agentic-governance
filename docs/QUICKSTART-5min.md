# Get Started with brAInwav in 5 Minutes

**Zero toolchain required.** This guide gets you governing AI-assisted work in under 5 minutes.

---

## Prerequisites (2 things only)

1. **Node.js 22+ or 24+** installed
2. **pnpm 9+ or 10+** installed

That's it. No security scanners. No extra CLIs. Just governance.

---

## Step 1: Install (30 seconds)

```bash
# In your project directory
pnpm add -D brainwav-governance
```

Or try without installing:

```bash
pnpm dlx brainwav-governance init
```

---

## Step 2: Initialize (1 minute)

Run the interactive wizard:

```bash
pnpm exec brainwav-governance init
```

**Answer 3 questions:**

1. **What type of work?** → `feature`, `fix`, `research`, `refactor`
2. **Governance level?** → `starter` (workflow only), `standard` (workflow + basic checks), `enterprise` (full compliance)
3. **Task name?** → `my-first-governed-task`

The wizard creates:
- `.agentic-governance/config.json` (your governance settings)
- `tasks/my-first-governed-task/` (task folder with evidence placeholders)

---

## Step 3: Work with AI (2 minutes)

**For Claude Code / ChatGPT / GitHub Copilot:**

```
Use the brAInwav governance workflow for this task:
1. Read the task brief in tasks/my-first-governed-task/
2. Create a plan following the Step Budget (≤7 steps)
3. Implement with failing tests first (ArcTDD)
4. Generate the Evidence Triplet before completing
```

**The AI will now:**
- Create a structured plan (not just code)
- Write tests before implementation
- Document what it did and why
- Leave evidence you can review

---

## Step 4: Validate (30 seconds)

Before committing or creating a PR:

```bash
pnpm exec brainwav-governance validate
```

**Output:**
```
✓ Required tokens present
✓ Step Budget within limits (5/7 steps)
✓ Evidence Triplet complete
✓ No governance hash drift

All checks passed. Ready for review.
```

---

## What Just Happened?

You just governed AI work. Specifically:

| Control | What it does | Why it matters |
|---------|--------------|----------------|
| **Step Budget** | Limits plans to ≤7 steps | Prevents over-planning paralysis |
| **Evidence Triplet** | Requires test proof + contract + review | Forces accountability |
| **Task Folders** | Structured workspace per task | Complete audit trail |
| **Hash Validation** | Pins governance to specific versions | Prevents silent policy changes |

**This is "governance lite"**—workflow structure without the heavy security scanner suite.

---

## Next Steps

### Ready for more?

**Add security scanners** (when you need them):

```bash
pnpm exec brainwav-governance init --profile standard
```

This installs:
- semgrep (policy linting)
- gitleaks (secret scanning)
- markdownlint (doc quality)

**Go full enterprise** (for regulated industries):

```bash
pnpm exec brainwav-governance init --profile enterprise
```

This adds:
- trivy (vulnerability scanning)
- cosign (code signing)
- cyclonedx (SBOM generation)
- Full OWASP/NIST/ISO compliance mapping

### Continue learning

- **[Full Quickstart](brainwav/governance/10-flow/governance-quickstart.md)** – Complete workflow guide
- **[Agent Charter](brainwav/governance/00-core/AGENT_CHARTER.md)** – What AI agents should/shouldn't do
- **[Checklists](brainwav/governance/20-checklists/checklists.md)** – Quality gates and review criteria

---

## Common Questions

**Q: Do I need all the security tools?**
A: No. Starter tier works with zero dependencies. Add them when you need compliance.

**Q: Can I use this with any AI tool?**
A: Yes. Works with Claude, ChatGPT, Copilot, or any LLM that can read files.

**Q: What if I don't use Node.js?**
A: Use `npx brainwav-governance` as a standalone tool. Multi-language support coming soon.

**Q: Is this open source?**
A: Yes. MIT license, public GitHub repo, community contributions welcome.

**Q: How much does this cost?**
A: Free. Enterprise support and compliance packages available for regulated industries.

---

## Troubleshooting

**"Node version mismatch"**
```bash
# Use Node 22+ or 24+
nvm install 22
nvm use 22
```

**"pnpm not found"**
```bash
npm install -g pnpm
```

**"Validation fails with hash drift"**
```bash
# This is normal after governance updates
pnpm exec brainwav-governance sync-hashes
```

---

**Time elapsed**: ~5 minutes
**Result**: Governed AI workflow with evidence trail

**Ready to ship?** Run `brainwav-governance validate --strict` before creating your PR.

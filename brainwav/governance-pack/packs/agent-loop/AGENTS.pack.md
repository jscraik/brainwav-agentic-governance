## Pack: agent-loop

Bounded agent loop harness for repetitive execution with budgets, allowlist enforcement, and verification gates.

### Required assets (installed with the pack)
- `.agentic-governance/loop/config.json`
- `.agentic-governance/loop/PROMPT.md`
- `.agentic-governance/tools/agent-loop.mjs`

### Usage
- Start a loop run (requires a clean working tree and a loop branch):
  - `node .agentic-governance/tools/agent-loop.mjs --slug <slug>`

### Guardrails
- Loop runs only on `bw/loop/<slug>` branches.
- Verification commands must pass every iteration.
- Changes outside the allowlist stop the loop.

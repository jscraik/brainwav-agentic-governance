# CODESTYLE.md

## Purpose

This document defines **mandatory coding standards** for the agentic governance framework. Keep it short and enforceable; detailed, stack‑specific rules live in packs.

Baselines: Node 24 Active LTS (see `.mise.toml` + `brainwav/governance/90-infra/compat.json`). Framework/tool specifics are defined by packs.

---

## 1. Hard prohibitions (production paths)

- No `TODO` / `FIXME` / `HACK` in production code.
- No fake telemetry, mock responses, or placeholder adapters.
- No `eval` / `new Function` / dynamic code execution.
- No hidden randomness or time‑dependent logic (inject seeds/clocks).

---

## 2. Core coding rules

- **Functions ≤ 40 lines**; use guard clauses to avoid nesting.
- **Named exports only** (default exports only where framework requires it).
- **No `any`**. Use `unknown` + guards or schema validation.
- **ESM only** in JS/TS packages.
- **Errors**: never swallow; include context and rethrow or return failure.

---

## 3. Tooling expectations

- CI enforces lint + typecheck + tests; local tooling should match CI.
- Use repo “smart” wrappers (Nx, scripts) when present.
- Keep lockfiles committed; no unpinned deps in production paths.

---

## 4. Quality gates

- Tests required for behavior changes.
- Evidence Triplet required for implementation work (see workflow).

---

## 5. Security & compliance

- Inputs validated and sanitized at boundaries.
- Secrets never hard‑coded; use approved secret stores.
- Supply‑chain checks required in delivery/release profiles.

---

## 6. Packs (stack‑specific rules)

Use the relevant pack for your stack (web, workers, Swift/AppKit, MCP, etc.). Packs add stricter rules without bloating core standards.

---

## Project‑Specific Style Rules

<!-- Add repo‑specific tightenings here. Do not weaken the core rules. -->

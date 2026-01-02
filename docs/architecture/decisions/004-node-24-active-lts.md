# ADR 004: Node 24 Active LTS

- Date: 2025-12-04
- Status: Accepted

## Context

The governance toolchain targets the Node.js Active LTS line for stability and
security support. CI uses Node 24.11.x and pnpm 10.26.x.

## Decision

Standardize on Node.js 24 Active LTS for this repository and set the pinned
version to 24.11.0. Tooling that relies on Node must remain compatible with
Node 24.

## Consequences

- Local development should use the pinned version via `.mise.toml` or the
  `engines`/`packageManager` fields.
- CI workflows must continue to pin Node 24.11.x.
- Breaking changes in future LTS lines require a new ADR.

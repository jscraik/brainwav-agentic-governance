# Governance Maintainers Guide

## Table of Contents

- [Purpose](#purpose)
- [Infrastructure Files Overview](#infrastructure-files-overview)
  - [governance-index.json](#governance-indexjson)
  - [index.json](#indexjson)
  - [structure-guard.json](#structure-guardjson)
  - [export-freeze.snapshot.json](#export-freezesnapshotjson)
  - [dependency-cruiser-memory.cjs](#dependency-cruiser-memorycjs)
- [Hash Update Procedure](#hash-update-procedure)
  - [Quick Start](#quick-start)
  - [What Gets Updated](#what-gets-updated)
  - [Manual Hash Generation](#manual-hash-generation)
  - [When to Run Hash Sync](#when-to-run-hash-sync)
  - [CI Integration](#ci-integration)
  - [Troubleshooting](#troubleshooting)
- [Document Lifecycle](#document-lifecycle)
  - [Adding New Governance Documents](#adding-new-governance-documents)
  - [Consolidating Documents](#consolidating-documents)
  - [Deprecating Documents](#deprecating-documents)
- [Emergency Procedures](#emergency-procedures)
  - [Governance System Failure](#governance-system-failure)
  - [Hash Corruption](#hash-corruption)
- [Related Resources](#related-resources)
- [Release Signing (SSH)](#release-signing-ssh)
  - [One-time setup](#one-time-setup)
  - [Create a signed tag](#create-a-signed-tag)
  - [Verification](#verification)


**Status:** Authoritative maintainer documentation  
**Audience:** Core maintainers updating governance infrastructure  
**Last Updated:** 2026-01-03

---

## Purpose

This document consolidates all governance infrastructure maintenance procedures, file purposes, and update workflows for the governance system.

## Infrastructure Files Overview

### governance-index.json

**Purpose**: Canonical registry of all governance documents with SHA-256 content hashes

**Structure**:

```json
{
  "precedence": [
    "00-core/constitution.md",
    "00-core/AGENT_CHARTER.md"
  ],
  "infra": [
    "90-infra/compat.json",
    "90-infra/standards.versions.json"
  ],
  "reference": [
  ],
  "docs": {
    "constitution.md": {
      "path": "00-core/constitution.md",
      "sha256": "<hash>",
      "class": "normative",
      "owner": "brAInwav Development Team",
      "change_class": "docs"
    }
  }
}
```

### index.json

**Purpose**: Legacy global rules index (if different from governance-index.json)

**When to Update**: Maintained for backward compatibility; prefer governance-index.json for new references

### structure-guard.json

**Purpose**: File system structure validation rules

**Contains**:

- Allowed root entries
- Required package structure
- Forbidden patterns

**When to Update**: When adding new package types or changing repo structure

### export-freeze.snapshot.json

**Purpose**: Dependency graph snapshot for import/export validation

**When to Update**: After significant architectural changes or new package additions

### dependency-cruiser-memory.cjs

**Purpose**: Dependency cruiser configuration for memory-related packages

**When to Update**: When adding new memory/storage packages or changing dependency rules

## Hash Update Procedure

### Quick Start

```bash
# Sync all governance hashes automatically
pnpm governance:sync-hashes

# Preview changes without modifying files
pnpm governance:sync-hashes:dry-run
```

### What Gets Updated

The `governance:sync-hashes` script automatically updates:

1. **`brainwav/governance/90-infra/governance-index.json`** - Recomputes SHA-256 for all indexed documents
2. **Root stubs** (if applicable) - updates embedded fragment hashes or version pointers when used
3. **Legacy compatibility stubs** (optional) - only if the repo maintains them (do not require non-standard files)

### Manual Hash Generation

If automation fails:

```bash
# Generate SHA-256 for a specific file
shasum -a 256 governance/rules/00-core/constitution.md

# Update governance-index.json manually
vim governance/rules/governance-index.json
```

### When to Run Hash Sync

Run `pnpm governance:sync-hashes` after:

- ✅ Editing any file in the governance directory
- ✅ Adding a new governance document to the index
- ✅ Moving governance files between directories
- ✅ Consolidating governance documents

### CI Integration

The `agents-governance.yml` workflow validates:

- Hash consistency between files and registry
- Document existence at declared paths
- Schema compliance for JSON infrastructure files

### Troubleshooting

**Hash Mismatch Errors**:

1. Check if file was recently edited
2. Run `pnpm governance:sync-hashes`
3. Verify no uncommitted changes
4. Check file encoding (must be UTF-8)

**Runtime Failures in governance loader / CLI**:

1. Ensure all paths in governance-index.json are relative to the governance root
2. Verify files exist at declared locations
3. Check JSON syntax validity

**Missing charter fragment references**:

1. Ensure AGENTS.md includes the fragment SHA-256 reference
2. Run hash sync to update references
3. Verify charter waiver workflow if intentionally skipping

## Document Lifecycle

### Adding New Governance Documents

1. Create document in appropriate directory (00-core, 10-flow, 20-checklists, 90-infra)
2. Add entry to `governance-index.json` precedence/infra/reference arrays as appropriate
3. Run `pnpm governance:sync-hashes`
4. Update references in related documents
5. Test CI validation

### Consolidating Documents

1. Merge content into target document
2. Convert source document to stub with pointer
3. Update all references to point to new location
4. Run hash sync
5. Update documentation and README files

### Deprecating Documents

1. Mark document as deprecated in frontmatter
2. Add deprecation notice with replacement location
3. Update governance-index.json to reflect status
4. Plan removal timeline (minimum 1 release cycle)

## Emergency Procedures

### Governance System Failure

If governance validation blocks critical fixes:

1. Check if waiver workflow is available
2. Create emergency waiver
3. Document incident and resolution plan
4. Schedule governance fix in next sprint

### Hash Corruption

If hashes become systematically corrupted:

1. Stop all governance-dependent CI jobs
2. Regenerate all hashes from source files
3. Validate against git history
4. Update governance-index.json atomically
5. Resume CI after validation

## Related Resources

- **Main Documentation**: `10-flow/governance-quickstart.md`
- **Structure Reference**: `README.md`
- **CI Workflows**: `.github/workflows/*governance*.yml`
- **Hash Sync Script**: `scripts/sync-governance-hashes.mjs` (canonical entrypoint via `brainwav-governance validate`)

## Release Signing (SSH)

All release tags MUST be signed using SSH signing.

### One-time setup

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign false
git config --global tag.gpgsign true
```

### Create a signed tag

```bash
git tag -s v0.x.y -m "Release v0.x.y"
git push origin v0.x.y
```

### Verification

```bash
git tag -v v0.x.y
```

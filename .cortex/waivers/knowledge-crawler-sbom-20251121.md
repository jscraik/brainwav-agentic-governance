# Preflight Guard Waiver: Supply-Chain Evidence (SBOM + Attestation)

**Waiver ID:** `knowledge-crawler-sbom-20251121`
**Rule ID:** `AGENTS-PRV-009` (Preflight Guards - Supply-Chain)
**Task:** knowledge-crawler
**Session:** 01JuNbkWKotDLWb6UtuyWQf5
**Created:** 2025-11-21
**Brand:** brAInwav

---

## Reason

Supply-chain evidence generation (SBOM + attestation) requires external tooling that may need configuration or may be better suited for CI/CD automation. During the planning phase, generating these artifacts manually is less critical than during the implementation/deployment phases.

**Specific constraints:**
- `pnpm sbom:generate` script exists but may require CycloneDX tool configuration
- Attestation signing requires Cosign v3 and key management setup
- SLSA v1.1 provenance generation is typically automated in CI/CD pipelines

---

## Compensating Controls

1. **Specification Documentation:** Supply-chain security requirements are fully documented:
   - ✅ SBOM format: CycloneDX 1.7
   - ✅ Provenance: SLSA v1.1 (in-toto)
   - ✅ Signing: Cosign v3 (Sigstore)
   - ✅ Output locations: `tasks/knowledge-crawler/sbom/`, `tasks/knowledge-crawler/attestations/`

2. **Dependency Analysis:** Manual dependency review completed:
   - ✅ Reuse evaluation identifies all dependencies (@cortex-os/mcp-docs-adapter, rag, embeddings, observability, mcp-server)
   - ✅ 77% reuse ratio (extending existing packages)
   - ✅ Zero new external dependencies introduced in planning phase
   - ✅ All dependencies are existing monorepo packages

3. **CI/CD Generation:** SBOM and attestation generation will be automated in CI/CD:
   - PR pipeline will generate CycloneDX SBOM
   - Build pipeline will create SLSA provenance
   - Release pipeline will sign artifacts with Cosign
   - Artifacts will be attached to PR and releases

4. **Manual Fallback Available:** If needed before CI/CD:
   ```bash
   # Manual SBOM generation
   npx @cyclonedx/cyclonedx-npm \
     --output-file tasks/knowledge-crawler/sbom/mcp-docs-adapter.json \
     --spec-version 1.7

   # Manual signing (requires cosign setup)
   cosign sign-blob \
     --bundle tasks/knowledge-crawler/attestations/mcp-docs-adapter.bundle \
     tasks/knowledge-crawler/sbom/mcp-docs-adapter.json
   ```

---

## Evidence Required

When this waiver is retired (PR creation or Arc 1 completion), the following evidence MUST be attached:

- [ ] `tasks/knowledge-crawler/sbom/mcp-docs-adapter.json`:
  - CycloneDX 1.7 format
  - All dependencies enumerated
  - Component licenses identified
  - Package metadata (name, version, supplier)

- [ ] `tasks/knowledge-crawler/attestations/mcp-docs-adapter.bundle`:
  - SLSA v1.1 provenance
  - Cosign v3 signature
  - Build metadata (commit SHA, timestamp, builder ID)

- [ ] CI/CD pipeline artifacts (alternative):
  - Link to workflow run that generated SBOM
  - Link to signed attestation in releases

- [ ] Updated `run-manifest.json`:
  - `preflight_guards.manual.supply_chain.status: "pass"`
  - SBOM and attestation pointers

---

## Expiry

**This waiver expires when:**
- PR is created and CI/CD generates artifacts, OR
- 2025-12-10 (30-day maximum), whichever comes first

**Retirement condition:** SBOM and attestation successfully generated (manually or via CI/CD).

---

## Approver

**Approved by:** @jamiescottcraik (maintainer)
**Approval method:** Hybrid approach (Option C) selected by user during planning phase
**Apply Waiver workflow:** _(will be linked after PR creation and workflow execution)_

---

## Remediation Plan

- [x] Document SBOM and attestation requirements in specification
- [x] Identify output locations in task folder structure
- [x] Review dependencies (reuse evaluation complete)
- [ ] Configure CycloneDX npm tool (if generating manually)
- [ ] Configure Cosign key management (if signing manually)
- [ ] Execute CI/CD pipeline to generate artifacts (recommended)
- [ ] OR execute manual generation commands (fallback)
- [ ] Attach evidence to run manifest
- [ ] Update waiver status to "retired"

---

## Risk Assessment

**Risk Level:** LOW

**Justification:**
- Planning phase introduces zero new external dependencies
- All dependencies are existing monorepo packages (vetted)
- SBOM generation is standard practice in CI/CD (not manual)
- No deployment/distribution occurs during planning
- Evidence will be generated before merge/release
- Specification fully documents requirements

**Mitigations:**
- Reuse evaluation completed (77% reuse, existing vetted packages)
- CI/CD automation reduces manual error risk
- Manual fallback commands documented if needed urgently

---

## Related Documents

- Specification: `KNOWLEDGE_CRAWLER_SPEC_UPDATED.md` §0.4 (Compliance)
- Reuse Evaluation: `tasks/knowledge-crawler/analysis/reuse-evaluation.md`
- Policy: `AGENTS.md` §9 (Security, Supply Chain, Compliance)
- Run Manifest: `tasks/knowledge-crawler/json/run-manifest.json`
- Task Structure: `/.cortex/rules/TASK_FOLDER_STRUCTURE.md`

---

**[brAInwav]** Supply-Chain Waiver — Planning Phase, CI/CD Preferred
**Status:** Active until PR creation or manual generation
**License:** Apache-2.0

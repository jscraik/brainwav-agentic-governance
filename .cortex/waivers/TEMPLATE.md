# Waiver Template

**Status:** Template - Copy and fill out for actual waivers
**Last Updated:** 2025-11-16

---

## Waiver Metadata

```yaml
waiver_id: WAIVER-YYYY-MM-DD-<short-description>
rule_ids:
  - AGENTS-XXX-NNN  # List all rule IDs being waived
requested_by: @github-username
approver: @maintainer-handle
created: YYYY-MM-DDTHH:MM:SSZ
expiry: YYYY-MM-DDTHH:MM:SSZ  # Max 30 days from creation
status: pending  # pending | approved | expired | revoked
```

## Justification

**Reason for Waiver:**
<!-- Provide detailed explanation of why this waiver is needed -->

**Business Impact:**
<!-- Describe the impact if this waiver is not granted -->

**Technical Constraints:**
<!-- Explain technical reasons preventing compliance -->

## Compensation Controls

**Alternative Safeguards:**
<!-- List compensating controls that mitigate risks -->

1. Control 1: Description
2. Control 2: Description
3. Control 3: Description

## Evidence Required

**Documentation:**
<!-- List evidence that must be attached -->

- [ ] Evidence file 1: `path/to/evidence1.json`
- [ ] Evidence file 2: `path/to/evidence2.log`
- [ ] Evidence file 3: `path/to/evidence3.md`

## Remediation Plan

**Tasks to restore compliance:**

```yaml
tasks:
  - task_slug: restore-compliance-task-1
    description: "Description of remediation task"
    assignee: "@github-username"
    deadline: YYYY-MM-DDTHH:MM:SSZ
    dependencies: []

  - task_slug: restore-compliance-task-2
    description: "Follow-up task"
    assignee: "@github-username"
    deadline: YYYY-MM-DDTHH:MM:SSZ
    dependencies: ["restore-compliance-task-1"]
```

## Approval

**Maintainer Sign-Off:**
<!-- Maintainer fills this section -->

```yaml
approval:
  approved_by: "@maintainer-handle"
  approved_at: YYYY-MM-DDTHH:MM:SSZ
  apply_waiver_workflow_run: "https://github.com/<YOUR-ORG>/<YOUR-REPO>/actions/runs/XXXXXXXX"
  notes: "Approval notes from maintainer"
```

**Activation Rule:**
This waiver is valid only after the `charter-enforce / danger` job posts ✅ with a link to the **Apply Waiver** workflow run that recorded Maintainer approval.

---

## Example: Connector Freshness Waiver

```yaml
waiver_id: WAIVER-2025-10-28-wikidata-outage
rule_ids: [AGENTS-PRV-009]
approver: @jamiescottcraik
requested_by: @oncall-engineer
expiry: 2025-10-30T19:00:00Z
reason: Wikidata outage blocked live freshness probes; serving cached data timestamped 2025-10-28T18:55:00Z.
compensation_controls:
  - Validated cache checksum (sha256:3b5d5c3712955042212316173ccf37be)
  - Read-only feature flag `connectors.wikidata.read_only`
evidence_required:
  - research/connectors/wikidata-cache-2025-10-28.json
  - docs/incidents/INC-4721-status-page.pdf
  - json/run-manifest.json#/log_evidence/2
remediation_plan:
  tasks:
    - task_slug: restore-wikidata-freshness
      deadline: 2025-10-29T19:00:00Z
```

---

## References

- **Waiver Policy:** `AGENTS.md` §27
- **Charter Fragment:** `.cortex/rules/CHARTER_FRAGMENT.md` lines 218-257
- **Constitution:** `.cortex/rules/constitution.md`
- **Apply Waiver Workflow:** `.github/workflows/apply-waiver.yml`

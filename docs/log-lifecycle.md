# Log Lifecycle Guide

This repository retains CI and governance logs under task folders to support
traceability, audits, and evidence checks. Rotate or prune logs using standard
retention policies once evidence has been archived or superseded by a release.

## Retention Targets

- Connector health logs: keep until the associated task is closed.
- Oversight logs: keep until release evidence has been signed and published.
- Security logs: keep through the next audit cycle.

## Cleanup

- Prefer archival over deletion when evidence is still relevant.
- Do not delete required Evidence Triplet artifacts until the task is closed.

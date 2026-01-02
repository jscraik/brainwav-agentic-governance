/**
 * @fileoverview Generate deterministic pointer-mode stubs.
 * @license Apache-2.0
 */

const STUB_MARKER = 'BRAINWAV_GOVERNANCE_STUB';

/**
 * Build an AGENTS pointer stub.
 * @param {Record<string, unknown>} pointer - Pointer metadata.
 * @returns {string} Stub contents.
 */
export function buildAgentsStub(pointer) {
	const profile = pointer?.profile || 'unknown';
	const packageName = pointer?.package || '@brainwav/brainwav-agentic-governance';
	const version = pointer?.version || 'unknown';
	const agentsPath = pointer?.agentsPath || 'node_modules/@brainwav/brainwav-agentic-governance/AGENTS.md';
	const indexPath =
		pointer?.governanceIndexPath ||
		'node_modules/@brainwav/brainwav-agentic-governance/brainwav/governance/90-infra/governance-index.json';

	return (
		`# AGENTS — Pointer\n\n` +
		`${STUB_MARKER}\n` +
		`Package: ${packageName}\n` +
		`Version: ${version}\n` +
		`Profile: ${profile}\n` +
		`Canonical path: ${agentsPath}\n` +
		`Canonical governance index: ${indexPath}\n\n` +
		`Local overrides (additive only):\n` +
		`- Place deltas in .agentic-governance/overlays/\n` +
		`- Declare overlays in .agentic-governance/config.json\n`
	);
}

/**
 * Build a CODESTYLE/SECURITY pointer stub.
 * @param {string} title - Document title.
 * @param {string} canonicalPath - Canonical path to the doc.
 * @param {Record<string, unknown>} pointer - Pointer metadata.
 * @returns {string} Stub contents.
 */
export function buildPointerStub(title, canonicalPath, pointer) {
	const packageName = pointer?.package || '@brainwav/brainwav-agentic-governance';
	const version = pointer?.version || 'unknown';

	return (
		`# ${title} — Pointer\n\n` +
		`${STUB_MARKER}\n` +
		`Package: ${packageName}\n` +
		`Version: ${version}\n` +
		`Canonical path: ${canonicalPath}\n\n` +
		`Local overrides (additive only):\n` +
		`- Place deltas in .agentic-governance/overlays/\n` +
		`- Declare overlays in .agentic-governance/config.json\n`
	);
}

/**
 * Build a docs/GOVERNANCE pointer stub.
 * @param {Record<string, unknown>} pointer - Pointer metadata.
 * @returns {string} Stub contents.
 */
export function buildGovernanceIndexStub(pointer) {
	const packageName = pointer?.package || '@brainwav/brainwav-agentic-governance';
	const version = pointer?.version || 'unknown';
	const govRoot =
		pointer?.governanceRoot ||
		'node_modules/@brainwav/brainwav-agentic-governance/brainwav/governance';

	return (
		`# Governance — Pointer\n\n` +
		`${STUB_MARKER}\n` +
		`Package: ${packageName}\n` +
		`Version: ${version}\n` +
		`Canonical governance root: ${govRoot}\n\n` +
		`Local overrides (additive only):\n` +
		`- Place deltas in .agentic-governance/overlays/\n` +
		`- Declare overlays in .agentic-governance/config.json\n`
	);
}

export const POINTER_STUB_MARKER = STUB_MARKER;

#!/usr/bin/env node
/**
 * @fileoverview Composite readiness check: verifies governance files and required tooling.
 * @module scripts/readiness-check
 * @license Apache-2.0
 *
 * Validates that all critical governance files exist and required CLI tools are installed.
 * This is the primary pre-flight check before governance operations.
 *
 * @example
 * // Run via npm script
 * pnpm readiness:check
 *
 * @example
 * // Run directly
 * node scripts/readiness-check.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import ensureTools from './ensure-tools.mjs';
import { formatPointerHint, resolveGovernancePaths } from './governance-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

/**
 * Verify a required file exists at the specified path.
 * @param {string} relPath - Relative path from repository root.
 * @param {string} label - Human-readable label for error messages.
 * @returns {string} Absolute path to the file.
 * @throws {Error} When the file does not exist.
 */
function requireFileAbsolute(filePath, label) {
	const p = filePath;
	if (!fs.existsSync(p)) {
		throw new Error(`${label} missing at ${p}`);
	}
	return p;
}

/**
 * Main entry point. Validates all governance files and tools.
 * Sets process.exitCode = 1 if any check fails.
 * @returns {void}
 */
function main() {
	try {
		const { govRoot, indexPath, agentsPath, pointerPath, packageRoot } =
			resolveGovernancePaths(repoRoot);
		const hint = formatPointerHint(pointerPath, packageRoot);

		requireFileAbsolute(agentsPath, 'AGENTS.md (canonical)');
		requireFileAbsolute(indexPath, 'governance-index.json');
		requireFileAbsolute(path.join(govRoot, '00-core', 'AGENT_CHARTER.md'), 'AGENT_CHARTER.md');
		requireFileAbsolute(
			path.join(govRoot, '10-flow', 'agentic-coding-workflow.md'),
			'agentic-coding-workflow.md'
		);
		requireFileAbsolute(path.join(govRoot, '20-checklists', 'checklists.md'), 'checklists.md');
		ensureTools();
		console.log('[brAInwav] readiness:check passed. Governance files present and tools verified.');
		if (hint) console.log(`[brAInwav] ${hint}`);
	} catch (error) {
		console.error(`[brAInwav] readiness:check failed: ${error.message}`);
		process.exitCode = 1;
	}
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('readiness-check.mjs')) {
	main();
}

export default main;

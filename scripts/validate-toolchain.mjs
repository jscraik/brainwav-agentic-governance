#!/usr/bin/env node
/**
 * @fileoverview Validate toolchain freshness and required version pins.
 * @license Apache-2.0
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const compatPath = path.join(repoRoot, 'brainwav', 'governance', '90-infra', 'compat.json');
const maxAgeDays = Number(process.env.TOOLCHAIN_MAX_AGE_DAYS ?? '90');

/**
 * CLI entry point.
 * @returns {void} No return value.
 */
function main() {
	const failures = [];
	if (!fs.existsSync(compatPath)) {
		failures.push(`compat.json missing at ${compatPath}`);
	} else {
		let compat;
		try {
			compat = JSON.parse(fs.readFileSync(compatPath, 'utf8'));
		} catch (error) {
			failures.push(`compat.json parse error (${error.message})`);
		}
		if (compat) {
			const updated = compat.updated ? new Date(compat.updated) : null;
			if (!updated || Number.isNaN(updated.getTime())) {
				failures.push('compat.json missing valid updated date');
			} else if (Number.isFinite(maxAgeDays)) {
				const ageDays = Math.floor(
					Math.abs(Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24)
				);
				if (ageDays > maxAgeDays) {
					failures.push(`compat.json toolchain pins are stale by ${ageDays} days (max ${maxAgeDays})`);
				}
			}
			const toolVersions = compat?.gold_standard?.tool_versions ?? null;
			if (!toolVersions || typeof toolVersions !== 'object') {
				failures.push('compat.json missing gold_standard.tool_versions');
			} else {
				['node', 'pnpm'].forEach((key) => {
					if (!toolVersions[key]) {
						failures.push(`compat.json missing gold_standard.tool_versions.${key}`);
					}
				});
			}
		}
	}

	if (failures.length > 0) {
		console.error('[brAInwav] toolchain validation failed:');
		failures.forEach((failure) => console.error(`- ${failure}`));
		process.exitCode = 1;
		return;
	}
	console.log('[brAInwav] toolchain validation passed.');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('validate-toolchain.mjs')) {
	main();
}

export default main;

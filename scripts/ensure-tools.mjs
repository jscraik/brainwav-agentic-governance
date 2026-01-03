#!/usr/bin/env node
/**
 * @fileoverview Verify required tooling is present for the governance framework.
 * @module scripts/ensure-tools
 * @license Apache-2.0
 *
 * Exit non-zero when any required CLI or engine version is missing or too low.
 * This script checks:
 * - Node.js >= 24.11.0
 * - pnpm >= 10.26.0
 * - Required CLIs: rg, fd, jq, semgrep, gitleaks, trivy, cosign, osv-scanner, markdownlint-cli2
 *
 * @example
 * // Run via npm script
 * pnpm ensure:tools
 *
 * @example
 * // Run directly
 * node scripts/ensure-tools.mjs
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { resolveGovernancePaths } from './governance-paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(repoRoot, 'package.json');

/**
 * Required tools with their purpose and installation instructions.
 * @type {Array<{name: string, reason: string, install: string}>}
 */
const tools = [
	{
		id: 'tool.rg',
		name: 'rg',
		reason: 'fast search (ripgrep)',
		install: {
			darwin: 'brew install ripgrep',
			linux: 'sudo apt-get install -y ripgrep',
			win32: 'winget install BurntSushi.ripgrep.MSVC'
		}
	},
	{
		id: 'tool.fd',
		name: 'fd',
		reason: 'fast file find',
		install: {
			darwin: 'brew install fd',
			linux: 'sudo apt-get install -y fd-find',
			win32: 'winget install sharkdp.fd'
		}
	},
	{
		id: 'tool.jq',
		name: 'jq',
		reason: 'JSON processor',
		install: {
			darwin: 'brew install jq',
			linux: 'sudo apt-get install -y jq',
			win32: 'winget install jqlang.jq'
		}
	},
	{
		id: 'tool.semgrep',
		name: 'semgrep',
		reason: 'SAST',
		install: {
			darwin: 'brew install semgrep',
			linux: 'python3 -m pip install semgrep',
			win32: 'python -m pip install semgrep'
		}
	},
	{
		id: 'tool.gitleaks',
		name: 'gitleaks',
		reason: 'secret scanning',
		install: {
			darwin: 'brew install gitleaks',
			linux: 'brew install gitleaks',
			win32: 'winget install Gitleaks.Gitleaks'
		}
	},
	{
		id: 'tool.trivy',
		name: 'trivy',
		reason: 'container/deps scan',
		install: {
			darwin: 'brew install trivy',
			linux: 'sudo apt-get install -y trivy',
			win32: 'winget install AquaSecurity.Trivy'
		}
	},
	{
		id: 'tool.cosign',
		name: 'cosign',
		reason: 'artifact signing',
		install: {
			darwin: 'brew install cosign',
			linux: 'brew install cosign',
			win32: 'winget install Sigstore.Cosign'
		}
	},
	{
		id: 'tool.osv-scanner',
		name: 'osv-scanner',
		reason: 'supply chain audit',
		install: {
			darwin: 'brew install osv-scanner',
			linux: 'brew install osv-scanner',
			win32: 'winget install Google.OSV-Scanner'
		}
	},
	{
		id: 'tool.markdownlint-cli2',
		name: 'markdownlint-cli2',
		reason: 'docs lint',
		install: {
			darwin: 'npm i -g markdownlint-cli2',
			linux: 'npm i -g markdownlint-cli2',
			win32: 'npm i -g markdownlint-cli2'
		}
	}
];

const TOOL_MAP = new Map(tools.map((tool) => [tool.name, tool]));

function loadToolchainProfile(targetRoot, profile) {
	const { govRoot } = resolveGovernancePaths(targetRoot);
	const compatPath = path.join(govRoot, '90-infra', 'compat.json');
	if (!fs.existsSync(compatPath)) return null;
	try {
		const compat = JSON.parse(fs.readFileSync(compatPath, 'utf8'));
		const profiles = compat?.gold_standard?.toolchain_profiles;
		if (!profiles || typeof profiles !== 'object') return null;
		return Array.isArray(profiles[profile]) ? profiles[profile] : null;
	} catch {
		return null;
	}
}

function loadToolVersions(targetRoot) {
	const { govRoot } = resolveGovernancePaths(targetRoot);
	const compatPath = path.join(govRoot, '90-infra', 'compat.json');
	if (!fs.existsSync(compatPath)) return {};
	try {
		const compat = JSON.parse(fs.readFileSync(compatPath, 'utf8'));
		return compat?.gold_standard?.tool_versions ?? {};
	} catch {
		return {};
	}
}

function pickInstallHint(tool) {
	if (!tool.install || typeof tool.install === 'string') return tool.install ?? '';
	if (process.platform === 'darwin') return tool.install.darwin ?? '';
	if (process.platform === 'win32') return tool.install.win32 ?? '';
	return tool.install.linux ?? '';
}

function extractVersion(output) {
	if (!output) return null;
	const match = output.match(/(\d+\.\d+\.\d+)/);
	return match ? match[1] : null;
}

function checkToolVersion(command, args, minVersion) {
	const res = spawnSync(command, args, { encoding: 'utf8' });
	if (res.status !== 0) return { ok: false, version: 'missing' };
	let detected = extractVersion(`${res.stdout}\n${res.stderr}`) ?? 'unknown';
	if (detected === 'unknown' && command === 'gitleaks') {
		const fallback = spawnSync(command, ['--version'], { encoding: 'utf8' });
		if (fallback.status === 0) {
			detected = extractVersion(`${fallback.stdout}\n${fallback.stderr}`) ?? 'unknown';
		}
		if (detected === 'unknown') {
			const jsonFallback = spawnSync(command, ['version', '--format', 'json'], { encoding: 'utf8' });
			if (jsonFallback.status === 0) {
				try {
					const payload = JSON.parse(jsonFallback.stdout || '{}');
					const jsonVersion =
						typeof payload.version === 'string'
							? payload.version
							: typeof payload.Version === 'string'
								? payload.Version
								: '';
					detected = extractVersion(jsonVersion) ?? extractVersion(jsonFallback.stdout) ?? 'unknown';
				} catch {
					detected = extractVersion(jsonFallback.stdout) ?? 'unknown';
				}
			}
		}
		if (detected === 'unknown' && process.env.GITLEAKS_VERSION) {
			detected = extractVersion(process.env.GITLEAKS_VERSION) ?? 'unknown';
		}
	}
	const ok = detected !== 'unknown' && compareVersions(detected, minVersion) >= 0;
	return { ok, version: detected };
}

/**
 * Check if a command exists in the system PATH.
 * @param {string} cmd - The command to check.
 * @returns {boolean} True if the command is available.
 */
function check(cmd) {
	if (process.platform === 'win32') {
		const res = spawnSync('where', [cmd], { stdio: 'ignore' });
		return res.status === 0;
	}
	const res = spawnSync('bash', ['-lc', `command -v ${cmd}`], { stdio: 'ignore' });
	return res.status === 0;
}

/**
 * Check if a command meets the minimum/maximum version requirement.
 * @param {string} command - The command to check version for.
 * @param {string} min - The minimum required version (e.g., '24.11.0').
 * @param {string|null} max - Optional exclusive upper bound (e.g., '25.0.0').
 * @returns {{ok: boolean, version: string}} Object with ok status and detected version.
 */
function checkVersionRange(command, min, max) {
	const res = spawnSync(command, ['-v'], { encoding: 'utf8' });
	if (res.status !== 0) return { ok: false, version: 'missing' };
	const version = res.stdout.trim();
	const meetsMin = compareVersions(version, min) >= 0;
	const underMax = max ? compareVersions(version, max) < 0 : true;
	return { ok: meetsMin && underMax, version };
}

function parseEngineRange(range) {
	if (!range || typeof range !== 'string') return null;
	const match = range.match(/>=\s*([0-9.]+)\s*<\s*([0-9.]+)/);
	if (!match) return null;
	return { min: match[1], max: match[2] };
}

function loadEngineRange(key) {
	if (!fs.existsSync(packageJsonPath)) return null;
	try {
		const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
		return parseEngineRange(pkg?.engines?.[key]);
	} catch {
		return null;
	}
}

/**
 * Compare two semantic version strings.
 * @param {string} actual - The actual version (e.g., 'v24.11.0').
 * @param {string} required - The required version (e.g., '24.11.0').
 * @returns {number} 1 if actual > required, -1 if actual < required, 0 if equal.
 */
function compareVersions(actual, required) {
	const a = actual.replace(/^v/, '').split('.').map(Number);
	const b = required.replace(/^v/, '').split('.').map(Number);
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		const ai = a[i] ?? 0;
		const bi = b[i] ?? 0;
		if (ai > bi) return 1;
		if (ai < bi) return -1;
	}
	return 0;
}

/**
 * Main entry point. Validates all tools and engine versions.
 * Sets process.exitCode = 1 if any check fails.
 * @param {{profile?: string, targetRoot?: string}} options - Tooling check options.
 * @param {string} [options.profile='release'] - Profile to enforce.
 * @param {string} [options.targetRoot=repoRoot] - Repository root for governance config.
 * @returns {void}
 */
export function runToolingChecks({ profile = 'release', targetRoot = repoRoot } = {}) {
	const checks = [];
	let ok = true;

	const nodeRange = loadEngineRange('node');
	const pnpmRange = loadEngineRange('pnpm');
	const nodeMin = nodeRange?.min ?? '24.11.0';
	const nodeMax = nodeRange?.max ?? null;
	const pnpmMin = pnpmRange?.min ?? '10.26.0';
	const pnpmMax = pnpmRange?.max ?? null;

	const nodeCheck = checkVersionRange(process.argv[0], nodeMin, nodeMax);
	checks.push({
		id: 'tool.node',
		severity: nodeCheck.ok ? 'info' : 'high',
		category: 'toolchain',
		status: nodeCheck.ok ? 'pass' : 'fail',
		message: nodeCheck.ok
			? `Node ${nodeCheck.version} OK`
			: `Node version out of range: ${nodeCheck.version} (need >=${nodeMin}${nodeMax ? ` <${nodeMax}` : ''})`
	});
	if (!nodeCheck.ok) ok = false;

	const pnpmCheck = checkVersionRange('pnpm', pnpmMin, pnpmMax);
	checks.push({
		id: 'tool.pnpm',
		severity: pnpmCheck.ok ? 'info' : 'high',
		category: 'toolchain',
		status: pnpmCheck.ok ? 'pass' : 'fail',
		message: pnpmCheck.ok
			? `pnpm ${pnpmCheck.version} OK`
			: `pnpm missing or out of range: ${pnpmCheck.version} (need >=${pnpmMin}${pnpmMax ? ` <${pnpmMax}` : ''})`
	});
	if (!pnpmCheck.ok) ok = false;

	const profileTools = loadToolchainProfile(targetRoot, profile) ?? tools.map((tool) => tool.name);
	const toolVersions = loadToolVersions(targetRoot);
	const enforceVersions = profile === 'release';
	const versionCommands = new Map([
		['semgrep', ['--version']],
		['gitleaks', ['version']],
		['trivy', ['--version']],
		['cosign', ['version']],
		['osv-scanner', ['--version']],
		['markdownlint-cli2', ['--version']]
	]);
	profileTools.forEach((toolName) => {
		const tool = TOOL_MAP.get(toolName);
		if (!tool) return;
		const present = check(tool.name);
		const installHint = pickInstallHint(tool);
		const allowMissing = profile !== 'release';
		const status = present ? 'pass' : allowMissing ? 'warn' : 'fail';
		checks.push({
			id: tool.id,
			severity: present ? 'info' : 'medium',
			category: 'toolchain',
			status,
			message: present
				? `${tool.name} present`
				: `${tool.name} missing (${tool.reason}; install: ${installHint})`
		});
		if (!present && !allowMissing) ok = false;
		if (present && enforceVersions && versionCommands.has(tool.name)) {
			const minVersion = toolVersions[tool.name.replace('-', '_')] ?? toolVersions[tool.name];
			if (minVersion) {
				const versionCheck = checkToolVersion(tool.name, versionCommands.get(tool.name), minVersion);
				checks.push({
					id: `${tool.id}.version`,
					severity: versionCheck.ok ? 'info' : 'high',
					category: 'toolchain',
					status: versionCheck.ok ? 'pass' : 'fail',
					message: versionCheck.ok
						? `${tool.name} ${versionCheck.version} OK (>= ${minVersion})`
						: `${tool.name} ${versionCheck.version} < ${minVersion}`
				});
				if (!versionCheck.ok) ok = false;
			}
		}
	});

	return { ok, checks };
}

/**
 * Run the CLI entry point for ensure:tools.
 * @returns {void} No return value.
 */
function main() {
	const args = process.argv.slice(2);
	const profileArgIndex = args.indexOf('--profile');
	const profileArg = profileArgIndex !== -1 ? args[profileArgIndex + 1] : null;
	const profileEnv = process.env.GOVERNANCE_PROFILE || process.env.BRAINWAV_PROFILE;
	const profile = profileArg || profileEnv || 'release';
	const result = runToolingChecks({ profile });
	if (!result.ok) {
		console.error('[brAInwav] Missing required tools or versions:');
		result.checks
			.filter((check) => check.status === 'fail')
			.forEach((check) => console.error(`- ${check.message}`));
		process.exitCode = 1;
		return;
	}
	console.log('[brAInwav] ensure:tools passed — all required CLIs detected.');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('ensure-tools.mjs')) {
	main();
}

export default main;

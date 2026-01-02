#!/usr/bin/env node
/**
 * @fileoverview Bounded agent loop runner.
 * @license Apache-2.0
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync, execSync } from 'node:child_process';

const DEFAULT_CONFIG = '.agentic-governance/loop/config.json';

function readJson(filePath) {
	if (!fs.existsSync(filePath)) return null;
	try {
		return JSON.parse(fs.readFileSync(filePath, 'utf8'));
	} catch {
		return null;
	}
}

function normalizeArray(value) {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}

function globToRegExp(glob) {
	let pattern = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
	pattern = pattern.replace(/\*\*/g, '<<<GLOBSTAR>>>');
	pattern = pattern.replace(/\*/g, '[^/]*');
	pattern = pattern.replace(/\?/g, '.');
	pattern = pattern.replace(/<<<GLOBSTAR>>>/g, '.*');
	return new RegExp(`^${pattern}$`);
}

function matchesAllowlist(filePath, allowlist) {
	if (allowlist.length === 0) return false;
	const normalized = filePath.replace(/\\/g, '/');
	return allowlist.some((pattern) => globToRegExp(pattern).test(normalized));
}

function getGitRoot(cwd) {
	try {
		return execSync('git rev-parse --show-toplevel', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
	} catch {
		return null;
	}
}

function getBranch(cwd) {
	try {
		return execSync('git rev-parse --abbrev-ref HEAD', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
	} catch {
		return null;
	}
}

function ensureCleanTree(cwd) {
	const status = execSync('git status --porcelain', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
		.toString()
		.trim();
	return status.length === 0;
}

function listChangedFiles(cwd) {
	try {
		const output = execSync('git diff --name-only', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
		if (!output) return [];
		return output.split('\n').filter(Boolean);
	} catch {
		return [];
	}
}

function renderPrompt(template, context) {
	return template
		.replace(/{{slug}}/g, context.slug)
		.replace(/{{iteration}}/g, String(context.iteration))
		.replace(/{{maxIterations}}/g, String(context.maxIterations))
		.replace(/{{allowlist}}/g, context.allowlist.join(', ') || 'none')
		.replace(/{{verifyCommands}}/g, context.verifyCommands.join('\n'));
}

function loadPrompt(templatePath) {
	if (!fs.existsSync(templatePath)) return null;
	return fs.readFileSync(templatePath, 'utf8');
}

function runCommand(command, cwd, input) {
	const result = spawnSync(command, {
		cwd,
		shell: true,
		input,
		stdio: ['pipe', 'inherit', 'inherit']
	});
	return result.status ?? 1;
}

function ensureDir(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

function main() {
	const args = process.argv.slice(2);
	const slugIndex = args.indexOf('--slug');
	const configIndex = args.indexOf('--config');
	const slug = slugIndex >= 0 ? args[slugIndex + 1] : null;
	const configPath = configIndex >= 0 ? args[configIndex + 1] : DEFAULT_CONFIG;

	if (!slug) {
		console.error('[brAInwav] --slug <slug> is required.');
		process.exit(2);
	}

	const config = readJson(configPath);
	if (!config) {
		console.error(`[brAInwav] config not found or invalid: ${configPath}`);
		process.exit(2);
	}

	const root = getGitRoot(process.cwd()) || process.cwd();
	const runner = config.runner?.command || 'codex';
	const runnerArgs = normalizeArray(config.runner?.args);
	const promptFile = config.promptFile || '.agentic-governance/loop/PROMPT.md';
	const reportDir = config.reportDir || '.agentic-governance/reports/loop';
	const stopFile = config.stopFile || '.agentic-governance/STOP';
	const allowlist = normalizeArray(config.allowlist);
	const verifyCommands = normalizeArray(config.verify?.commands);
	const budgets = config.budgets || {};
	const maxIterations = Number(budgets.maxIterations ?? 1);
	const maxMinutes = Number(budgets.maxMinutes ?? 10);
	const maxFailures = Number(budgets.maxFailures ?? 1);
	const branchPrefix = config.branch?.prefix || 'bw/loop/';
	const branchEnforced = config.branch?.enforced === true;

	if (verifyCommands.length === 0) {
		console.error('[brAInwav] verify.commands must contain at least one command.');
		process.exit(2);
	}

	if (branchEnforced) {
		const current = getBranch(root);
		const expected = `${branchPrefix}${slug}`;
		if (!current || current === 'HEAD') {
			console.error('[brAInwav] unable to determine git branch.');
			process.exit(2);
		}
		if (!ensureCleanTree(root)) {
			console.error('[brAInwav] working tree must be clean before starting the loop.');
			process.exit(2);
		}
		if (!current.startsWith(branchPrefix)) {
			try {
				execSync(`git checkout -b ${expected}`, { cwd: root, stdio: 'inherit' });
			} catch (error) {
				console.error(`[brAInwav] failed to create loop branch: ${error.message}`);
				process.exit(2);
			}
		} else if (current !== expected) {
			console.error(`[brAInwav] loop branch must be ${expected} (currently ${current}).`);
			process.exit(2);
		}
	}

	const promptTemplate = loadPrompt(path.join(root, promptFile));
	if (!promptTemplate) {
		console.error(`[brAInwav] prompt file missing: ${promptFile}`);
		process.exit(2);
	}

	ensureDir(path.join(root, reportDir));
	const start = Date.now();
	const report = {
		schema: 'brainwav.governance.agent-loop.v1',
		meta: {
			slug,
			root,
			config: configPath,
			started_at: new Date(start).toISOString()
		},
		budgets: {
			maxIterations,
			maxMinutes,
			maxFailures
		},
		iterations: [],
		status: 'running'
	};

	let failures = 0;
	for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
		if (fs.existsSync(path.join(root, stopFile))) {
			report.status = 'stopped';
			report.reason = 'stop file detected';
			break;
		}
		const elapsedMinutes = (Date.now() - start) / 60000;
		if (elapsedMinutes > maxMinutes) {
			report.status = 'stopped';
			report.reason = 'time budget exceeded';
			break;
		}

		const prompt = renderPrompt(promptTemplate, {
			slug,
			iteration,
			maxIterations,
			allowlist,
			verifyCommands
		});
		const runnerCmd = [runner, ...runnerArgs].join(' ').trim();
		const runnerStatus = runCommand(runnerCmd, root, prompt);
		const changed = listChangedFiles(root);
		const outside = changed.filter((filePath) => !matchesAllowlist(filePath, allowlist));
		if (outside.length > 0) {
			report.iterations.push({
				iteration,
				runner_status: runnerStatus,
				verify: [],
				status: 'failed',
				reason: `changes outside allowlist: ${outside.join(', ')}`
			});
			report.status = 'failed';
			report.reason = 'allowlist violation';
			break;
		}

		const verifyResults = [];
		let verifyFailed = false;
		verifyCommands.forEach((command) => {
			const status = runCommand(command, root);
			verifyResults.push({ command, status });
			if (status !== 0) verifyFailed = true;
		});
		if (runnerStatus !== 0 || verifyFailed) {
			failures += 1;
		}

		report.iterations.push({
			iteration,
			runner_status: runnerStatus,
			verify: verifyResults,
			status: runnerStatus === 0 && !verifyFailed ? 'pass' : 'fail'
		});

		if (failures >= maxFailures) {
			report.status = 'failed';
			report.reason = 'failure budget exceeded';
			break;
		}
	}

	if (report.status === 'running') {
		report.status = 'completed';
	}
	report.meta.completed_at = new Date().toISOString();
	const reportPath = path.join(
		root,
		reportDir,
		`agent-loop-${slug}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
	);
	fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

	if (report.status === 'failed') {
		process.exit(1);
	}
	process.exit(0);
}

main();

#!/usr/bin/env node
/**
 * @fileoverview Pack checking and evaluation logic.
 * @license Apache-2.0
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { readJsonFile, readTextFile } from './fs-utils.mjs'; // Added imports

/**
 * Normalize pack check entries.
 * @param {Array<object>} checks - Raw check objects.
 * @returns {Array<object>} Normalized checks.
 */
export function normalizePackChecks(checks) {
    if (!Array.isArray(checks)) return [];
    return checks.map((check) => ({
        id: check.id,
        type: check.type ?? 'file-exists',
        path: typeof check.path === 'string' ? check.path : null, // Enforce string
        pattern: check.pattern ?? null,
        message: check.message ?? null,
        severity: check.severity ?? 'medium',
        category: check.category ?? 'pack',
        input: check.input ?? null // Capture input field
    }));
}

/**
 * Build a globally unique pack check ID.
 * @param {string} packId - Pack identifier.
 * @param {string} checkId - Check identifier.
 * @returns {string} Global check ID.
 */
export function buildPackCheckId(packId, checkId) {
    return `pack:${packId}:${checkId}`;
}

/**
 * Resolve fail or warn status based on profile.
 * @param {string} profile - Profile name.
 * @returns {'fail'|'warn'} Status value.
 */
function statusFromProfile(profile) {
    return profile === 'release' ? 'fail' : 'warn';
}

/**
 * Read package.json helper.
 * @param {string} rootPath - Repo root.
 * @returns {object|null} Package JSON.
 */
function readPackageJson(rootPath) {
    return readJsonFile(path.join(rootPath, 'package.json'));
}

/**
 * Collect Aegis evidence from tasks.
 * @param {string} rootPath - Repo root.
 * @returns {{skipped: boolean, missingReports: string[], invalidReports: string[], warnMissingNotes: string[]}} Evidence.
 */
function collectAegisEvidence(rootPath) {
    const tasksRoot = path.join(rootPath, 'tasks');
    if (!fs.existsSync(tasksRoot)) {
        return { skipped: true, missingReports: [], invalidReports: [], warnMissingNotes: [] };
    }
    const missingReports = [];
    const invalidReports = [];
    const warnMissingNotes = [];

    const slugs = fs.readdirSync(tasksRoot, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name);

    slugs.forEach((slug) => {
        const reportPath = path.join(tasksRoot, slug, 'json', 'aegis-report.json');
        if (!fs.existsSync(reportPath)) {
            missingReports.push(slug);
            return;
        }
        const report = readJsonFile(reportPath);
        if (!report || !report.disposition) {
            invalidReports.push(slug);
            return;
        }
        if (report.disposition === 'warn') {
            const notesPath = path.join(tasksRoot, slug, 'verification', 'review-notes.md');
            if (!fs.existsSync(notesPath)) {
                warnMissingNotes.push(slug);
            }
        }
    });

    return { skipped: false, missingReports, invalidReports, warnMissingNotes };
}

/**
 * Resolve pack options for specific pack (with legacy fallbacks).
 * @param {Record<string, unknown>} packOptions - All pack options.
 * @param {string} packId - Pack ID.
 * @returns {Record<string, unknown>} Resolved options.
 */
function resolvePackOptionsForPack(packOptions, packId) {
    const direct = packOptions?.[packId];
    if (direct && typeof direct === 'object') return direct;
    if (packId === 'swift-xcode' && packOptions?.['swift-appkit']) return packOptions['swift-appkit'];
    return {};
}

/**
 * Evaluate a single pack check.
 * @param {object} context - Evaluation context.
 * @param {string} context.rootPath - Target root path.
 * @param {object} context.manifest - Pack manifest.
 * @param {object} context.entry - Check entry.
 * @param {object} context.packOptions - Pack configuration options.
 * @param {string} context.profile - Governance profile.
 * @returns {{status: 'pass'|'fail'|'warn'|'skip', message: string}} Result.
 */
export function evaluatePackCheck({ rootPath, manifest, entry, packOptions, profile }) {
    const packId = manifest.id;
    const options = resolvePackOptionsForPack(packOptions, packId);
    const checkId = entry.id;

    // --- Custom Pack Checks Ported from governance-cli.mjs ---

    if (packId === 'swift-core' && checkId === 'swift-format-config') {
        const configPath = path.join(rootPath, '.swift-format');
        if (fs.existsSync(configPath)) {
            return { status: 'pass', message: '.swift-format present' };
        }
        return { status: statusFromProfile(profile), message: 'missing .swift-format config' };
    }

    if (packId === 'swift-core' && checkId === 'package-swift') {
        if (fs.existsSync(path.join(rootPath, 'Package.swift'))) {
            return { status: 'pass', message: 'Package.swift present' };
        }
        return { status: 'fail', message: 'missing Package.swift for swift-core pack' };
    }

    if (packId === 'swift-spm' && checkId === 'spm-verify-script') {
        const pkg = readPackageJson(rootPath);
        if (pkg?.scripts?.['verify:spm']) {
            return { status: 'pass', message: 'verify:spm script present' };
        }
        return { status: statusFromProfile(profile), message: 'missing verify:spm script' };
    }

    if (packId === 'ts-base' && checkId === 'node-version') {
        const pkg = readPackageJson(rootPath);
        if (pkg?.engines?.node) {
            return { status: 'pass', message: 'package.json engines.node present' };
        }
        return { status: statusFromProfile(profile), message: 'missing engines.node in package.json' };
    }

    if (packId === 'ts-base' && checkId === 'package-json') {
        if (fs.existsSync(path.join(rootPath, 'package.json'))) {
            return { status: 'pass', message: 'package.json present' };
        }
        return { status: 'fail', message: 'missing package.json' };
    }

    if (packId === 'ts-base' && checkId === 'tsconfig') {
        if (fs.existsSync(path.join(rootPath, 'tsconfig.json'))) {
            return { status: 'pass', message: 'tsconfig.json present' };
        }
        return { status: statusFromProfile(profile), message: 'missing tsconfig.json' };
    }

    if (packId === 'sdd' && ['spec-present', 'plan-present', 'tasks-present', 'traceability'].includes(checkId)) {
        // SDD specific logic
        const specRoot = options.specRoot || 'specs';
        const specRootPath = path.join(rootPath, specRoot);

        if (checkId === 'traceability') {
            // Check traceability
            if (!fs.existsSync(specRootPath)) return { status: 'pass', message: 'no specs to trace' }; // Skip if empty?

            const dirs = fs.readdirSync(specRootPath, { withFileTypes: true }).filter(e => e.isDirectory());
            const traceFailures = [];
            dirs.forEach(entry => {
                const tasksPath = path.join(specRootPath, entry.name, 'tasks.md');
                if (!fs.existsSync(tasksPath)) {
                    // Handled by tasks-present check, but also traceability failure
                    traceFailures.push(`${entry.name}/tasks.md missing`);
                    return;
                }
                const content = readTextFile(tasksPath) || '';
                if (!content.includes('tasks/')) {
                    traceFailures.push(`${entry.name}/tasks.md missing tasks/ evidence references`);
                }
            });

            if (traceFailures.length > 0) {
                return { status: statusFromProfile(profile), message: `sdd traceability issues: ${traceFailures.join(', ')}` };
            }
            return { status: 'pass', message: 'sdd traceability ok' };
        }

        // Existence checks
        const requiredFile = checkId === 'spec-present' ? 'spec.md'
            : checkId === 'plan-present' ? 'plan.md'
                : checkId === 'tasks-present' ? 'tasks.md' : null;

        if (requiredFile) {
            if (!fs.existsSync(specRootPath)) return { status: 'pass', message: `no specs to check for ${requiredFile}` };
            const dirs = fs.readdirSync(specRootPath, { withFileTypes: true }).filter(e => e.isDirectory());
            const missing = dirs.filter(entry => !fs.existsSync(path.join(specRootPath, entry.name, requiredFile)));

            if (missing.length > 0) {
                return {
                    status: statusFromProfile(profile),
                    message: `${requiredFile} missing in ${missing.map(e => e.name).join(', ')}`
                };
            }
            return { status: 'pass', message: `${requiredFile} present` };
        }
    }

    if (packId === 'docs' && checkId === 'docs-validate') {
        const pkg = readPackageJson(rootPath);
        const fallbackCommand = typeof options?.validateCommand === 'string' ? options.validateCommand.trim() : null;
        const hasScript = Boolean(pkg?.scripts?.['docs:validate']);
        const command = fallbackCommand || (hasScript ? 'pnpm -s docs:validate' : null);
        if (!command) {
            return {
                status: statusFromProfile(profile),
                message: 'missing docs validation command (define packOptions.docs.validateCommand or add docs:validate script)'
            };
        }
        try {
            // We should use dependency injection for execution ideally, but let's assume raw execSync for check
            execSync(command, { stdio: ['ignore', 'ignore', 'ignore'], cwd: rootPath });
            return { status: 'pass', message: 'docs validation passed' };
        } catch (error) {
            return {
                status: statusFromProfile(profile),
                message: `docs validation failed (${error.message})`
            };
        }
    }

    if (packId === 'mcp-aegis') {
        const evidence = collectAegisEvidence(rootPath);
        if (evidence.skipped) {
            return { status: 'pass', message: 'no tasks directory; aegis checks skipped' };
        }
        if (checkId === 'aegis.required') {
            if (evidence.missingReports.length > 0) {
                return {
                    status: statusFromProfile(profile),
                    message: `missing aegis-report.json in tasks: ${evidence.missingReports.join(', ')}`
                };
            }
            return { status: 'pass', message: 'aegis reports present' };
        }
        if (checkId === 'aegis.report.present') {
            if (evidence.invalidReports.length > 0) {
                return {
                    status: statusFromProfile(profile),
                    message: `invalid aegis-report.json in tasks: ${evidence.invalidReports.join(', ')}`
                };
            }
            return { status: 'pass', message: 'aegis reports valid' };
        }
        if (checkId === 'aegis.disposition.valid') {
            if (evidence.warnMissingNotes.length > 0) {
                return {
                    status: statusFromProfile(profile),
                    message: `missing review-notes.md for warn verdicts: ${evidence.warnMissingNotes.join(', ')}`
                };
            }
            return { status: 'pass', message: 'aegis dispositions valid' };
        }
    }

    if (packId === 'agent-loop') {
        const loopRoot = path.join(rootPath, '.agentic-governance', 'loop');
        const configPath = path.join(loopRoot, 'config.json');
        const config = readJsonFile(configPath);
        const promptPath = config?.promptFile
            ? (path.isAbsolute(config.promptFile) ? config.promptFile : path.join(rootPath, config.promptFile))
            : path.join(loopRoot, 'PROMPT.md');

        if (checkId === 'pack:agent-loop:config-present') {
            if (config) return { status: 'pass', message: 'loop config present' };
            return { status: statusFromProfile(profile), message: 'missing loop config.json' };
        }
        if (checkId === 'pack:agent-loop:prompt-present') {
            if (promptPath && fs.existsSync(promptPath)) {
                return { status: 'pass', message: 'loop prompt present' };
            }
            return { status: statusFromProfile(profile), message: 'missing loop prompt' };
        }
        if (checkId === 'pack:agent-loop:runner-command') {
            if (typeof config?.runner?.command === 'string' && config.runner.command.trim()) {
                return { status: 'pass', message: 'loop runner command configured' };
            }
            return { status: statusFromProfile(profile), message: 'missing loop runner command in config.json' };
        }
    }

    // --- Generic Logic ---
    const checkType = entry.type;

    if (checkType === 'file-exists') {
        if (!entry.path) return { status: 'fail', message: `invalid check definition: missing path` };

        let targetPath = entry.path;
        const inputMatches = targetPath.match(/\{inputs\.([a-zA-Z0-9_]+)\}/g);
        if (inputMatches) {
            inputMatches.forEach((match) => {
                const varName = match.slice(8, -1);
                const packConfig = packOptions[manifest.id] || {};
                const val = packConfig[varName];
                if (val === undefined) {
                    targetPath = targetPath.replace(match, '');
                } else {
                    targetPath = targetPath.replace(match, val);
                }
            });
        }

        const absPath = path.resolve(rootPath, targetPath);
        const exists = fs.existsSync(absPath);
        if (exists) {
            return { status: 'pass', message: entry.message || `${entry.path} present for ${manifest.id} pack` };
        }

        const status = profile === 'release' && entry.severity === 'high' ? 'fail'
            : entry.severity === 'info' ? 'warn'
                : profile === 'creative' ? 'warn'
                    : 'warn'; // Default

        return {
            status,
            message: entry.message || `${entry.path} missing for ${manifest.id} pack`
        };
    }

    if (checkType === 'file-contains') {
        if (!entry.path || !entry.pattern) return { status: 'fail', message: 'invalid check definition' };
        const absPath = path.resolve(rootPath, entry.path);
        if (!fs.existsSync(absPath)) {
            return { status: 'fail', message: `${entry.path} missing` };
        }
        const content = readTextFile(absPath);
        const hasPattern = content.includes(entry.pattern);
        if (hasPattern) {
            return { status: 'pass', message: `${entry.path} contains required pattern` };
        }
        return { status: 'fail', message: `${entry.path} missing pattern: "${entry.pattern}"` };
    }

    if (checkType === 'input-set') {
        const inputName = entry.input;
        if (!inputName) return { status: 'fail', message: 'invalid check definition: missing input name' };
        const packConfig = packOptions[manifest.id] || {};
        const val = packConfig[inputName];
        if (val !== undefined && val !== null && val !== '') {
            return { status: 'pass', message: `input ${inputName} is set` };
        }
        return { status: 'warn', message: `optional input missing: ${inputName}` };
    }

    return { status: 'skip', message: `unknown check type: ${checkType}` };
}

/**
 * Check checks against registry (stub).
 * @returns {Array<object>} Unknown checks.
 */
export function checkRegistry() {
    return [];
}

#!/usr/bin/env node
/**
 * @fileoverview Report building and output utilities.
 * @license Apache-2.0
 */
import fs from 'node:fs';
import { formatJson } from './json-format.mjs';

/**
 * Return current time as ISO-8601 string.
 * @returns {string} ISO timestamp.
 */
export function nowIso() {
    return new Date().toISOString();
}

/**
 * Build report metadata payload.
 * @param {Record<string, unknown>} inputs - Input metadata.
 * @returns {Record<string, unknown>} Meta object.
 */
export function buildMeta(inputs) {
    const pkg = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
    return {
        tool: 'brainwav-governance',
        version: pkg.version,
        timestamp: nowIso(),
        inputs
    };
}

/**
 * Build report output path based on target.
 * @param {string|null} target - Target path or directory.
 * @param {string} command - Command name.
 * @param {boolean} dryRun - Whether this is a dry run.
 * @returns {string|null} Report path.
 */
export function buildReportPath(target, command, dryRun) {
    if (!target) return null;
    const stat = fs.existsSync(target) ? fs.statSync(target) : null;
    if (stat?.isDirectory()) {
        const suffix = dryRun ? '.dry-run.json' : '.report.json';
        return `${target}/${command}${suffix}`;
    }
    if (target.endsWith('.json')) return target;
    const suffix = dryRun ? '.dry-run.json' : '.report.json';
    return `${target}.${command}${suffix}`;
}

/**
 * Write JSON report to disk.
 * @param {string|null} pathTarget - Target file path.
 * @param {Record<string, unknown>} report - Report data.
 * @returns {void} No return value.
 */
export function writeReport(pathTarget, report) {
    if (!pathTarget) return;
    const formatted = formatJson(report);
    fs.mkdirSync(fs.realpathSync('.'), { recursive: true });
    fs.writeFileSync(pathTarget, formatted);
}

/**
 * Output report to console based on global flags.
 * @param {Record<string, unknown>} report - Report data.
 * @param {Record<string, unknown>} global - Global flags.
 * @returns {void}
 */
export function outputReport(report, global) {
    if (global.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
    }
    if (global.quiet) return;
    if (global.plain) {
        console.log(`${report.status}: ${report.summary}`);
        return;
    }
    console.log(`[brAInwav] ${report.summary}`);
}

/**
 * Set process exit code.
 * @param {number} code - Exit code.
 * @returns {void} No return value.
 */
export function exitWithCode(code) {
    process.exitCode = code;
}

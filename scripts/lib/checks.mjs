#!/usr/bin/env node
/**
 * @fileoverview Check builders and validators for governance CLI.
 * @license Apache-2.0
 */

/**
 * Build a normalized check result.
 * @param {string} id - Check identifier.
 * @param {'pass'|'fail'|'warn'} status - Check status.
 * @param {'info'|'low'|'medium'|'high'} severity - Check severity.
 * @param {string} category - Check category.
 * @param {string} message - Check message.
 * @returns {{id: string, status: string, severity: string, category: string, message: string}} Check object.
 */
export function buildCheck(id, status, severity, category, message) {
    return { id, status, severity, category, message };
}

/**
 * Normalize check results to ensure consistent structure.
 * @param {Array<object>} checks - Raw check results.
 * @returns {Array<object>} Normalized checks.
 */
export function normalizeChecks(checks) {
    return checks.map((check) => ({
        id: check.id || 'unknown',
        severity: check.severity || 'info',
        category: check.category || 'general',
        status: check.status || 'pass',
        message: check.message || ''
    }));
}

/**
 * Build a summary line for checks.
 * @param {Array<{status: string}>} checks - Check results.
 * @param {string} status - Overall status.
 * @returns {string} Summary string.
 */
export function formatSummary(checks, status) {
    const total = checks.length;
    const failed = checks.filter((c) => c.status === 'fail').length;
    const warned = checks.filter((c) => c.status === 'warn').length;
    if (failed > 0 && warned > 0) return `${status}: ${total} checks, ${failed} failed, ${warned} warnings`;
    if (failed > 0) return `${status}: ${total} checks, ${failed} failed`;
    if (warned > 0) return `${status}: ${total} checks, ${warned} warnings`;
    return `${status}: ${total} checks passed`;
}

/**
 * Apply config warnings to check list.
 * @param {Array<object>} checks - Check list.
 * @param {string[]} warnings - Warning messages.
 * @param {string} checkId - Check ID for warnings.
 * @param {string} category - Check category.
 * @returns {void}
 */
export function applyWarningsToChecks(checks, warnings, checkId, category) {
    warnings.forEach((warning) => {
        checks.push(buildCheck(checkId, 'warn', 'low', category, warning));
    });
}

/**
 * Resolve fail or warn status based on profile.
 * @param {string} profile - Profile name.
 * @returns {'fail'|'warn'} Status value.
 */
export function statusFromProfile(profile) {
    return profile === 'release' ? 'fail' : 'warn';
}

/**
 * Resolve fail or warn status with release-only enforcement.
 * @param {string} profile - Profile name.
 * @returns {'fail'|'warn'} Status value.
 */
export function statusFromRelease(profile) {
    return profile === 'release' ? 'fail' : 'warn';
}

/**
 * Enforce exit code based on status and strict mode.
 * @param {string} status - Overall status.
 * @param {number} warnedCount - Number of warnings.
 * @param {boolean} strict - Strict mode flag.
 * @param {number} failCode - Exit code for failures.
 * @param {number} warnCode - Exit code for warnings.
 * @returns {void}
 */
export function enforceExitCode(status, warnedCount, strict, failCode, warnCode) {
    if (status === 'error') {
        process.exitCode = failCode;
        return;
    }
    if (warnedCount > 0 && strict) {
        process.exitCode = warnCode;
    }
}

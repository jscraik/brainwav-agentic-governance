#!/usr/bin/env node
/**
 * @fileoverview Governance index and validation utilities.
 * @license Apache-2.0
 */
import fs from 'node:fs';
import path from 'node:path';
import { isPrettyJson } from './json-format.mjs';

/**
 * Read governance index with error handling.
 * @param {string} indexPath - Path to index file.
 * @returns {{index: object|null, errors: string[]}} Index and errors.
 */
export function readGovernanceIndex(indexPath) {
    const errors = [];
    if (!fs.existsSync(indexPath)) {
        errors.push('governance-index.json missing');
        return { index: null, errors };
    }
    try {
        const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        return { index, errors };
    } catch (error) {
        errors.push(`JSON parse error: ${error.message}`);
        return { index: null, errors };
    }
}

/**
 * Check if governance-index.json is pretty-printed.
 * @param {string} indexPath - Path to index file.
 * @param {string} govRoot - Governance root.
 * @param {string} rootPath - Repo root.
 * @returns {{ok: boolean, issues: string[]}} Result.
 */
export function checkPrettyJson(indexPath, govRoot, rootPath) {
    const issues = [];
    if (!fs.existsSync(indexPath)) return { ok: true, issues: [] };
    const content = fs.readFileSync(indexPath, 'utf8');
    if (!isPrettyJson(content)) {
        issues.push('governance-index.json not formatted with 2-space indentation + newline');
    }
    // Also check package.json if present
    const pkgPath = path.join(rootPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkgContent = fs.readFileSync(pkgPath, 'utf8');
        if (!isPrettyJson(pkgContent)) {
            issues.push('package.json not formatted with 2-space indentation + newline');
        }
    }
    return { ok: issues.length === 0, issues };
}

/**
 * Extract pack-scoped paths from governance index.
 * @param {object} index - Governance index.
 * @returns {{packs: Record<string, string[]>, generated: string[]}} Paths.
 */
export function extractPackScopedPaths(index) {
    if (!index || !index.docs) return { packs: {}, generated: [] };
    const packs = {};
    const generated = [];
    Object.values(index.docs).forEach((entry) => {
        if (entry.pack_scoped) {
            const list = packs[entry.pack_scoped] || [];
            list.push(entry.path);
            packs[entry.pack_scoped] = list;
        }
        // Generated artifacts check
        if (entry.generated) {
            generated.push(entry.path);
        }
    });
    return { packs, generated };
}

/**
 * Check if pack-scoped files leak into precedence lists.
 * @param {object} index - Governance index.
 * @returns {{ok: boolean, violations: string[]}} Result.
 */
export function checkPackScopedPrecedence(index) {
    if (!index) return { ok: true, violations: [] };
    const violations = [];
    const packScopedPaths = new Set();
    Object.values(index.docs || {}).forEach((entry) => {
        if (entry.pack_scoped) {
            packScopedPaths.add(entry.path);
        }
    });
    ['precedence', 'infra', 'reference'].forEach((listKey) => {
        const list = index[listKey];
        if (!Array.isArray(list)) return;
        list.forEach((docPath) => {
            if (packScopedPaths.has(docPath)) {
                violations.push(`${listKey} contains pack-scoped file: ${docPath}`);
            }
        });
    });
    return { ok: violations.length === 0, violations };
}

/**
 * Check structure-guard schema location in index.
 * @param {object} index - Governance index.
 * @returns {{present: boolean, inPrecedence: boolean, path: string|null}} Result.
 */
export function checkStructureGuardSchema(index) {
    if (!index) return { present: false, inPrecedence: false, path: null };
    const schemaPath = 'brainwav/governance/90-infra/agentic-config.schema.json';
    const present = Object.values(index.docs || {}).some((entry) => entry.path.endsWith('agentic-config.schema.json'));
    const inPrecedence = (index.precedence || []).some((p) => p.endsWith('agentic-config.schema.json'));
    return { present, inPrecedence, path: schemaPath };
}

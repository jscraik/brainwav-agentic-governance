#!/usr/bin/env node
/**
 * @fileoverview Shared constants for governance scripts.
 * @license Apache-2.0
 */

/**
 * Directories to skip during recursive scans.
 * @type {Set<string>}
 */
export const SCAN_SKIP_DIRS = new Set([
    '.agentic-governance',
    '.git',
    '.idea',
    '.next',
    '.pnpm',
    '.swiftpm',
    '.turbo',
    '.vscode',
    'Pods',
    'DerivedData',
    'build',
    'coverage',
    'dist',
    'node_modules',
    'out',
    '.build',
    '.cache'
]);

/**
 * Root documentation files that can satisfy governance paths.
 * @type {Set<string>}
 */
export const ROOT_DOCS = new Set(['README.md', 'CODESTYLE.md', 'SECURITY.md', 'AGENTS.md']);

/**
 * Package name constants.
 * @type {{primary: string, legacy: string}}
 */
export const PACKAGE_NAMES = {
    primary: '@brainwav/amyga-governance',
    legacy: '@brainwav/brainwav-agentic-governance'
};

/**
 * File extensions to scan for governance documents.
 * @type {Set<string>}
 */
export const SCAN_EXTENSIONS = new Set(['.md', '.markdown', '.mdx', '.json', '.yaml', '.yml', '.txt']);

/**
 * Pointer stub paths to exclude from cleanup scans.
 * @type {Set<string>}
 */
export const STUB_PATHS = new Set(['AGENTS.md', 'CODESTYLE.md', 'SECURITY.md', 'docs/GOVERNANCE.md']);

/**
 * Canonical governance directory segments.
 * @type {string[]}
 */
export const CANONICAL_SEGMENTS = ['00-core', '10-flow', '20-checklists', '30-compliance', '90-infra'];

/**
 * Canonical governance root directories.
 * @type {string[]}
 */
export const CANONICAL_ROOTS = ['brainwav/governance', 'brainwav/governance-pack'];

/**
 * Valid governance profiles.
 * @type {Set<string>}
 */
export const VALID_PROFILES = new Set(['creative', 'delivery', 'release']);

/**
 * Legacy profile name mappings.
 * @type {Map<string, string>}
 */
export const LEGACY_PROFILE_MAP = new Map([
    ['full', 'release'],
    ['core', 'delivery']
]);

/**
 * Valid governance modes.
 * @type {Set<string>}
 */
export const VALID_MODES = new Set(['pointer', 'full']);

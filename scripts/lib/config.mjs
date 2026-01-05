#!/usr/bin/env node
/**
 * @fileoverview Configuration file parsing and validation utilities.
 * @license Apache-2.0
 */
import fs from 'node:fs';
import path from 'node:path';

const KNOWN_CONFIG_KEYS = new Set([
    'version',
    'mode',
    'profile',
    'packs',
    'packOptions',
    'overlays',
    'features',
    'taskRoot',
    'specRoot',
    'mcp'
]);

/**
 * Resolve config path relative to root.
 * @param {string} rootPath - Root directory.
 * @param {string|null} configArg - Config path arg.
 * @returns {string|null} Resolved config path.
 */
export function resolveConfigPath(rootPath, configArg) {
    if (configArg) return path.resolve(rootPath, configArg);
    const defaultPath = path.join(rootPath, '.agentic-governance', 'config.json');
    return fs.existsSync(defaultPath) ? defaultPath : null;
}

/**
 * Read profile from config if present.
 * @param {string|null} configPath - Config path.
 * @returns {string|null} Profile value or null.
 */
export function readConfigProfile(configPath) {
    if (!configPath || !fs.existsSync(configPath)) return null;
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config.profile || null;
    } catch {
        return null;
    }
}

/**
 * Detect unknown keys in config.
 * @param {string|null} configPath - Config path.
 * @returns {string[]} Warning messages.
 */
export function parseConfigWarnings(configPath) {
    if (!configPath || !fs.existsSync(configPath)) return [];
    const warnings = [];
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        Object.keys(config).forEach((key) => {
            if (!KNOWN_CONFIG_KEYS.has(key)) {
                warnings.push(`unknown config key: ${key}`);
            }
        });
    } catch {
        // Parse errors handled elsewhere
    }
    return warnings;
}

/**
 * Read installed packs from config.
 * @param {string} rootPath - Repository root.
 * @param {string|null} configPath - Config path.
 * @returns {{packs: string[], packOptions: Record<string, unknown>}} Installed packs.
 */
export function readInstalledPacks(rootPath, configPath) {
    const resolved = configPath || resolveConfigPath(rootPath, null);
    if (!resolved || !fs.existsSync(resolved)) {
        return { packs: [], packOptions: {} };
    }
    try {
        const config = JSON.parse(fs.readFileSync(resolved, 'utf8'));
        return {
            packs: Array.isArray(config.packs) ? config.packs : [],
            packOptions: config.packOptions || {}
        };
    } catch {
        return { packs: [], packOptions: {} };
    }
}

/**
 * Get pack options from config.
 * @param {string|null} configPath - Config path.
 * @param {Record<string, unknown>} defaults - Default options.
 * @returns {Record<string, unknown>} Pack options.
 */
export function getPackOptions(configPath, defaults) {
    if (!configPath || !fs.existsSync(configPath)) return defaults;
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return { ...defaults, ...(config.packOptions || {}) };
    } catch {
        return defaults;
    }
}

/**
 * Read config overlays list.
 * @param {string|null} configPath - Config path.
 * @returns {string[]} Overlay paths.
 */
export function readConfigOverlays(configPath) {
    if (!configPath || !fs.existsSync(configPath)) return [];
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (!Array.isArray(config.overlays)) return [];
        return config.overlays.flatMap((overlay) => {
            if (!overlay || !Array.isArray(overlay.paths)) return [];
            return overlay.paths;
        });
    } catch {
        return [];
    }
}

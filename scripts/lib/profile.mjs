#!/usr/bin/env node
/**
 * @fileoverview Profile normalization and validation.
 * @license Apache-2.0
 */
import { LEGACY_PROFILE_MAP, VALID_PROFILES } from './constants.mjs';

/**
 * Normalize a profile name, handling legacy aliases.
 * @param {string} profile - Profile name.
 * @returns {{profile: string, warned: boolean}} Normalized profile and warning flag.
 */
export function normalizeProfile(profile) {
    if (VALID_PROFILES.has(profile)) {
        return { profile, warned: false };
    }
    if (LEGACY_PROFILE_MAP.has(profile)) {
        return { profile: LEGACY_PROFILE_MAP.get(profile), warned: true };
    }
    return { profile: 'delivery', warned: false };
}

/**
 * Validate profile name.
 * @param {string} profile - Profile name.
 * @returns {boolean} True if valid.
 */
export function isValidProfile(profile) {
    return VALID_PROFILES.has(profile) || LEGACY_PROFILE_MAP.has(profile);
}

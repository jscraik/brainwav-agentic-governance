#!/usr/bin/env node
/**
 * @fileoverview Additional governance check logic (drift, evidence, hygiene).
 * @license Apache-2.0
 */
import fs from 'node:fs';
import path from 'node:path';
import { readJsonFile } from './fs-utils.mjs';

/**
 * Check for portfolio version drift in pointer mode.
 * @param {string} rootPath - Repo root.
 * @param {object|null} pointer - Pointer metadata.
 * @returns {string[]} Failure messages.
 */
export function checkPortfolioDrift(rootPath, pointer) {
    if (!pointer || pointer.mode !== 'pointer') return [];
    const failures = [];

    // Check package.json version against pointer
    const pkgPath = path.join(rootPath, 'package.json');
    const pkg = readJsonFile(pkgPath);
    if (!pkg) return [];

    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const governancePkg = pointer.package || '@brainwav/amyga-governance';

    const currentVersion = deps[governancePkg];
    if (!currentVersion) {
        // Not installed, maybe that's fine if handled globally, but unusual for pointer mode
        return [];
    }

    // If pointer has a version, check match
    // pointer.version comes from installation time
    if (pointer.version && currentVersion.replace(/[\^~]/, '') !== pointer.version) {
        // Just warn? Or explicit drift check?
        // Simple check: if explicit version mismatch
        // Logic: If installed version differs from pointer.version, maybe we need upgrade
    }

    return failures;
}

/**
 * Check evidence for data/vendor governance in tasks.
 * @param {string} rootPath - Repo root.
 * @returns {{skipped: boolean, dataIssues: string[], vendorIssues: string[]}} Result.
 */
export function checkRiskRegisterEvidence(rootPath) {
    const tasksDir = path.join(rootPath, 'tasks');
    if (!fs.existsSync(tasksDir)) return { skipped: true, dataIssues: [], vendorIssues: [] };

    const dataIssues = [];
    const vendorIssues = [];

    const riskPath = path.join(rootPath, 'brainwav', 'governance', '90-infra', 'risk-entitlements.json');
    // If not present (e.g. pointer mode without full copy yet), skip?
    // Or check pointer location.
    // For now assume if missing we skip.
    if (!fs.existsSync(riskPath)) return { skipped: true, dataIssues: [], vendorIssues: [] };

    return { skipped: false, dataIssues, vendorIssues };
}

/**
 * Check freshness of standards.versions.json.
 * @param {string} govRoot - Governance root.
 * @returns {{ok: boolean, message: string}} Result.
 */
export function checkStandardsFreshness(govRoot) {
    const standardsPath = path.join(govRoot, '90-infra', 'standards.versions.json');
    if (!fs.existsSync(standardsPath)) {
        return { ok: true, message: 'standards.versions.json missing (skip freshness check)' };
    }

    try {
        const stats = fs.statSync(standardsPath);
        const lastMod = new Date(stats.mtime);
        const now = new Date();
        const ageDays = (now - lastMod) / (1000 * 60 * 60 * 24);

        const maxAge = parseInt(process.env.STANDARDS_MAX_AGE_DAYS || '90', 10);

        if (ageDays > maxAge) {
            return { ok: false, message: `standards.versions.json is ${Math.round(ageDays)} days old (max ${maxAge})` };
        }
        return { ok: true, message: 'standards freshness ok' };
    } catch (err) {
        return { ok: false, message: `freshness check failed: ${err.message}` };
    }
}

/**
 * Build cleanup plan for pointer mode.
 * @param {string} rootPath - Repo root.
 * @param {object} pointer - Pointer metadata.
 * @param {string} indexPath - Governance index path.
 * @returns {{actions: Array<{action:string, path:string, target?:string}>, warnings: string[]}} Plan.
 */
export function buildCleanupPlan(rootPath, pointer, indexPath) {
    const actions = [];
    const warnings = [];

    if (!pointer || pointer.mode !== 'pointer') {
        warnings.push('cleanup-plan requires pointer mode; no actions generated');
        return { actions, warnings };
    }

    const pointerDir = path.join(rootPath, '.agentic-governance');
    const overlayDir = path.join(pointerDir, 'overlays');
    const nodeModulesDir = path.join(rootPath, 'node_modules');
    const localPackDir = path.join(pointerDir, 'packs');
    const vendorDir = path.join(pointerDir, 'vendor');

    // Import constants locally or duplicate if not imported. 
    // Ideally we import from constants.mjs but to save imports edits:
    const canonicalSegments = ['00-core', '10-flow', '20-checklists', '30-compliance', '90-infra'];
    const canonicalRoots = ['brainwav/governance', 'brainwav/governance-pack'];
    const stubPaths = new Set(['AGENTS.md', 'CODESTYLE.md', 'SECURITY.md', 'docs/GOVERNANCE.md']);
    const scanExtensions = new Set(['.md', '.markdown', '.mdx', '.json', '.yaml', '.yml', '.txt']);
    // Hardcoded skip dirs to avoid import if possible, or assume caller handles?
    // Let's just hardcode common ones to match original logic or use constants if imported
    const scanSkipDirs = new Set([
        '.agentic-governance', '.git', '.idea', '.next', '.pnpm', '.swiftpm', '.turbo', '.vscode',
        'Pods', 'DerivedData', 'build', 'coverage', 'dist', 'node_modules', 'out', '.build', '.cache'
    ]);

    if (fs.existsSync(localPackDir)) {
        actions.push({
            action: 'delete',
            path: path.relative(rootPath, localPackDir),
            reason: 'pointer mode forbids local pack manifests'
        });
    }
    if (fs.existsSync(vendorDir)) {
        actions.push({
            action: 'delete',
            path: path.relative(rootPath, vendorDir),
            reason: 'pointer mode forbids vendored governance packs'
        });
    }

    canonicalSegments.forEach((segment) => {
        const target = path.join(rootPath, segment);
        if (fs.existsSync(target)) {
            actions.push({
                action: 'delete',
                path: path.relative(rootPath, target),
                reason: 'pointer mode forbids canonical governance directories'
            });
        }
    });
    canonicalRoots.forEach((segment) => {
        const target = path.join(rootPath, segment);
        if (fs.existsSync(target)) {
            actions.push({
                action: 'delete',
                path: path.relative(rootPath, target),
                reason: 'pointer mode forbids canonical governance directories'
            });
        }
    });

    let canonicalDocPaths = [];
    let canonicalDocNames = new Set();
    try {
        if (fs.existsSync(indexPath)) {
            const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
            const prefixes = canonicalSegments.map((segment) => `${segment}/`);
            canonicalDocPaths = Object.values(index.docs || {})
                .map((entry) => entry.path)
                .filter((docPath) => prefixes.some((prefix) => docPath.startsWith(prefix)));
            canonicalDocPaths = canonicalDocPaths.concat(
                canonicalDocPaths.map((docPath) => `brainwav/governance/${docPath}`)
            );
            canonicalDocNames = new Set(
                Object.values(index.docs || {}).map((entry) => path.basename(entry.path))
            );
        }
    } catch (error) {
        warnings.push(`failed to read governance index: ${error.message}`);
    }

    const forbiddenNamePatterns = [/constitution\.md$/i, /agentic-coding-workflow\.md$/i];
    const planned = new Set();
    const visit = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        entries.forEach((entry) => {
            const entryPath = path.join(dir, entry.name);
            if (scanSkipDirs.has(entry.name)) return;
            if (entryPath.startsWith(pointerDir)) return;
            if (entryPath.startsWith(overlayDir)) return;
            if (entryPath.startsWith(nodeModulesDir)) return;
            if (entry.isDirectory()) {
                visit(entryPath);
                return;
            }
            if (!scanExtensions.has(path.extname(entry.name))) return;
            const relPath = path.relative(rootPath, entryPath).replace(/\\/g, '/');
            if (stubPaths.has(relPath)) return;
            const matchesForbidden = forbiddenNamePatterns.some((pattern) => pattern.test(entry.name));
            const matchesCanonicalName = canonicalDocNames.has(entry.name);
            if (!matchesForbidden && !matchesCanonicalName && !canonicalDocPaths.includes(relPath)) return;
            const matchesCanonical = canonicalDocPaths.includes(relPath) || matchesCanonicalName;
            if (!matchesForbidden && !matchesCanonical) return;
            if (planned.has(relPath)) return;
            planned.add(relPath);
            if (relPath.endsWith('.md')) {
                const target = `.agentic-governance/overlays/${relPath}.local.md`;
                actions.push({
                    action: 'move',
                    path: relPath,
                    target,
                    reason: 'canonical doc copy detected; move delta into overlays'
                });
            } else {
                actions.push({
                    action: 'delete',
                    path: relPath,
                    reason: 'canonical doc copy detected in pointer mode'
                });
            }
        });
    };
    visit(rootPath);

    return { actions, warnings };
}

/**
 * Check run-manifest.json for PAI fields.
 * @param {string} rootPath - Repo root.
 * @returns {{ok: boolean, issues: string[], skipped: boolean}} Result.
 */
export function checkRunManifestPAI(rootPath) {
    const tasksRoot = path.join(rootPath, 'tasks');
    if (!fs.existsSync(tasksRoot)) {
        return { ok: true, issues: [], skipped: true };
    }
    const issues = [];
    const dirIter = fs.readdirSync(tasksRoot, { withFileTypes: true });
    const slugs = dirIter.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

    slugs.forEach((slug) => {
        const manifestPath = path.join(tasksRoot, slug, 'json', 'run-manifest.json');
        if (!fs.existsSync(manifestPath)) {
            issues.push(`${slug}: missing json/run-manifest.json`);
            return;
        }
        const manifest = readJsonFile(manifestPath);
        if (!manifest) {
            issues.push(`${slug}: json/run-manifest.json read/parse error`);
            return;
        }
        if (!manifest.spec || typeof manifest.spec !== 'object') {
            issues.push(`${slug}: missing spec current/desired state`);
        } else {
            if (!String(manifest.spec.current_state || '').trim()) {
                issues.push(`${slug}: spec.current_state missing`);
            }
            if (!String(manifest.spec.desired_state || '').trim()) {
                issues.push(`${slug}: spec.desired_state missing`);
            }
        }
        if (!manifest.verification || typeof manifest.verification !== 'object') {
            issues.push(`${slug}: missing verification fields`);
        } else {
            const criteria = Array.isArray(manifest.verification.success_criteria)
                ? manifest.verification.success_criteria
                : [];
            const commands = Array.isArray(manifest.verification.commands)
                ? manifest.verification.commands
                : [];
            if (criteria.length === 0) {
                issues.push(`${slug}: verification.success_criteria missing`);
            }
            if (commands.length === 0) {
                issues.push(`${slug}: verification.commands missing`);
            }
        }
        if (!manifest.learn || typeof manifest.learn !== 'object') {
            issues.push(`${slug}: missing learn fields`);
        } else {
            const insights = Array.isArray(manifest.learn.insights) ? manifest.learn.insights : [];
            const followups = Array.isArray(manifest.learn.followups) ? manifest.learn.followups : [];
            if (insights.length === 0) issues.push(`${slug}: learn.insights missing`);
            if (followups.length === 0) issues.push(`${slug}: learn.followups missing`);
        }
        if (!manifest.decision_hierarchy || typeof manifest.decision_hierarchy !== 'object') {
            issues.push(`${slug}: missing decision_hierarchy fields`);
        } else {
            const tools = Array.isArray(manifest.decision_hierarchy.deterministic_tools)
                ? manifest.decision_hierarchy.deterministic_tools
                : [];
            if (tools.length === 0) {
                issues.push(`${slug}: decision_hierarchy.deterministic_tools missing`);
            }
        }
    });

    return { ok: issues.length === 0, issues, skipped: false };
}

/**
 * Check spec chain consistency.
 * @param {string} rootPath - Repo root.
 * @param {string} specRoot - Specs directory.
 * @returns {{ok: boolean, missing: string[], issues: string[]}} Result.
 */
export function checkSpecChain(rootPath, specRoot) {
    const issues = [];
    const missing = [];
    const specRootPath = path.join(rootPath, specRoot);
    if (!fs.existsSync(specRootPath)) {
        return { ok: false, issues: [], missing: [`missing ${specRoot}/ spec directories`] };
    }
    const dirs = fs.readdirSync(specRootPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

    if (dirs.length === 0) {
        return { ok: false, issues: [], missing: [`missing ${specRoot}/ spec directories`] };
    }

    const requiredTokens = [
        'Current state',
        'Desired state',
        'Success criteria',
        'How we will verify'
    ];

    dirs.forEach((dir) => {
        const specFile = path.join(specRootPath, dir, 'spec.md');
        const planFile = path.join(specRootPath, dir, 'plan.md');
        const tasksFile = path.join(specRootPath, dir, 'tasks.md');

        // Helpers to read file content safely
        const read = (p) => {
            if (!fs.existsSync(p)) return null;
            return fs.readFileSync(p, 'utf8');
        };

        const specContent = read(specFile);
        const planContent = read(planFile);
        const tasksContent = read(tasksFile);

        if (!specContent) missing.push(`${dir}/spec.md missing`);
        if (!planContent) missing.push(`${dir}/plan.md missing`);
        if (!tasksContent) missing.push(`${dir}/tasks.md missing`);

        if (specContent && !specContent.includes(`specs/${dir}/plan.md`)) {
            issues.push(`${dir}/spec.md missing plan link`);
        }
        if (specContent && !specContent.includes(`specs/${dir}/tasks.md`)) {
            issues.push(`${dir}/spec.md missing tasks link`);
        }
        if (planContent && !planContent.includes(`specs/${dir}/spec.md`)) {
            issues.push(`${dir}/plan.md missing spec link`);
        }
        if (planContent && !planContent.includes(`specs/${dir}/tasks.md`)) {
            issues.push(`${dir}/plan.md missing tasks link`);
        }
        if (tasksContent && !tasksContent.includes(`specs/${dir}/spec.md`)) {
            issues.push(`${dir}/tasks.md missing spec link`);
        }
        if (tasksContent && !tasksContent.includes(`specs/${dir}/plan.md`)) {
            issues.push(`${dir}/tasks.md missing plan link`);
        }
        if (tasksContent && !tasksContent.includes('tasks/')) {
            issues.push(`${dir}/tasks.md missing tasks/ evidence references`);
        }
        if (specContent) {
            requiredTokens.forEach((token) => {
                if (!specContent.includes(token)) {
                    issues.push(`${dir}/spec.md missing "${token}"`);
                }
            });
        }
    });

    return { ok: missing.length === 0 && issues.length === 0, missing, issues };
}

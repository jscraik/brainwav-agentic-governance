#!/usr/bin/env node
/**
 * @fileoverview Scaffolding utilities for tasks and specs.
 * @license Apache-2.0
 */
import fs from 'node:fs';
import path from 'node:path';
import { ensureDir, writeFile } from './fs-utils.mjs';

/**
 * Check if a slug is safe for filesystem usage.
 * @param {string} slug - Slug to check.
 * @returns {boolean} True if safe.
 */
export function isSafeSlug(slug) {
    return /^[a-z0-9][a-z0-9-]*$/.test(slug);
}

/**
 * Load a spec template from the governance repo.
 * @param {string} govRoot - Governance root.
 * @param {string} type - Template type (spec|plan|tasks).
 * @returns {string} Template content.
 */
export function loadSpecTemplate(govRoot, type) {
    const templatesDir = path.join(govRoot, 'templates');
    if (type === 'spec') return fs.readFileSync(path.join(templatesDir, 'feature-spec-template.md'), 'utf8');
    if (type === 'plan') return fs.readFileSync(path.join(templatesDir, 'tdd-plan-template.md'), 'utf8');
    if (type === 'tasks') {
        const tasksPath = path.join(templatesDir, 'tasks-template.md');
        if (fs.existsSync(tasksPath)) return fs.readFileSync(tasksPath, 'utf8');
        // Fallback for earlier versions
        return '# Tasks\n\nTBD\n';
    }
    return '';
}

/**
 * Initialize spec-driven development artifacts.
 * @param {{rootPath: string, govRoot: string, specRoot: string, slug: string, force: boolean, compat: string}} args - Inputs.
 * @returns {Array<object>} Actions performed.
 */
export function initSpec({ rootPath, govRoot, specRoot, slug, force, compat }) {
    const actions = [];
    const effectiveSpecRoot = compat === 'speckit' ? path.join('.specify', 'specs') : specRoot;
    const baseRoot = path.join(rootPath, effectiveSpecRoot, slug);
    ensureDir(baseRoot, actions);

    const replaceSlug = (content) =>
        content
            .replace(/<feature-slug>/g, slug)
            .replace(/<slug>/g, slug)
            .replace(/\{\{SPEC_SLUG\}\}/g, slug)
            .replace(/\$\{SPEC_SLUG\}/g, slug)
            .replace(/\[task-id-slug\]/g, slug);

    if (compat === 'speckit') {
        const compatRoot = path.join(rootPath, '.specify');
        const templatesRoot = path.join(compatRoot, 'templates');
        const memoryRoot = path.join(compatRoot, 'memory');
        const scriptsRoot = path.join(compatRoot, 'scripts');
        ensureDir(compatRoot, actions);
        ensureDir(templatesRoot, actions);
        ensureDir(memoryRoot, actions);
        ensureDir(scriptsRoot, actions);
        writeFile(
            path.join(memoryRoot, 'constitution.md'),
            '# Constitution (Pointer)\n\nCanonical governance lives under brainwav/governance/00-core/constitution.md.\n'
        );
        actions.push({ action: 'write', path: path.join(memoryRoot, 'constitution.md') });

        const specTmpl = loadSpecTemplate(govRoot, 'spec').trimEnd();
        writeFile(
            path.join(templatesRoot, 'spec-template.md'),
            `${specTmpl}\n`
        );
        actions.push({ action: 'write', path: path.join(templatesRoot, 'spec-template.md') });

        const planTmpl = loadSpecTemplate(govRoot, 'plan').trimEnd();
        writeFile(
            path.join(templatesRoot, 'plan-template.md'),
            `${planTmpl}\n`
        );
        actions.push({ action: 'write', path: path.join(templatesRoot, 'plan-template.md') });

        const tasksTmpl = loadSpecTemplate(govRoot, 'tasks').trimEnd();
        writeFile(
            path.join(templatesRoot, 'tasks-template.md'),
            `${tasksTmpl}\n`
        );
        actions.push({ action: 'write', path: path.join(templatesRoot, 'tasks-template.md') });

        writeFile(
            path.join(templatesRoot, 'claude-template.md'),
            '# Claude Instructions Template\n\nUse AGENTS.md and brainwav-governance CLI instructions.\n'
        );
        actions.push({ action: 'write', path: path.join(templatesRoot, 'claude-template.md') });

        writeFile(
            path.join(scriptsRoot, 'README.md'),
            '# Spec Scripts\n\nOptional helper scripts for spec workflow automation.\n'
        );
        actions.push({ action: 'write', path: path.join(scriptsRoot, 'README.md') });
    }

    const specContent = replaceSlug(loadSpecTemplate(govRoot, 'spec'));
    const planContent = replaceSlug(loadSpecTemplate(govRoot, 'plan'));
    const tasksContent = replaceSlug(loadSpecTemplate(govRoot, 'tasks'));

    // Note: writeFile from fs-utils doesn't support 'force' param logic natively or logging actions
    // wrapper here implements that logic simply by overwriting or checking existence if needed
    // original code had logic for 'force' inside writeFile call in CLI.
    // Here we just write. If we care about force, we check existence.
    // original fs-utils writeFile: fs.mkdirSync + fs.writeFileSync (always overwrites)
    // original CLI logic passed 'force' but utils didn't seem to use it? 
    // Ah, original 'writeFile' in CLI was a local helper that pushed to 'actions'.

    // Let's replicate the action recording behavior
    function write(p, c) {
        if (!force && fs.existsSync(p)) return;
        writeFile(p, c);
        actions.push({ action: 'write', path: p });
    }

    write(path.join(baseRoot, 'spec.md'), `${specContent.trimEnd()}\n`);
    write(path.join(baseRoot, 'plan.md'), `${planContent.trimEnd()}\n`);
    write(path.join(baseRoot, 'tasks.md'), `${tasksContent.trimEnd()}\n`);

    if (compat === 'speckit') {
        const contractsRoot = path.join(baseRoot, 'contracts');
        ensureDir(contractsRoot);

        write(path.join(baseRoot, 'data-model.md'), '# Data Model\n\nTBD\n');
        write(path.join(baseRoot, 'research.md'), '# Research\n\nTBD\n');
        write(path.join(baseRoot, 'quickstart.md'), '# Quickstart\n\nTBD\n');
        write(path.join(contractsRoot, 'README.md'), '# Contracts\n\nTBD\n');
    }

    return actions;
}

/**
 * Initialize a task scaffold.
 * @param {{rootPath: string, taskRoot: string, slug: string, tier: string, force: boolean}} args - Inputs.
 * @returns {Array<object>} Actions performed.
 */
export function initTask({ rootPath, taskRoot, slug, tier, force }) {
    const actions = [];
    const baseRoot = path.join(rootPath, taskRoot, slug);
    const jsonRoot = path.join(baseRoot, 'json');
    const logsRoot = path.join(baseRoot, 'logs');
    const vibeRoot = path.join(logsRoot, 'vibe-check');
    const researchRoot = path.join(logsRoot, 'academic-research');
    const testsRoot = path.join(logsRoot, 'tests');
    const verificationRoot = path.join(baseRoot, 'verification');

    // Use fs-utils ensureDir
    ensureDir(baseRoot);
    ensureDir(jsonRoot);
    ensureDir(logsRoot);
    ensureDir(vibeRoot);
    ensureDir(researchRoot);
    ensureDir(testsRoot);
    ensureDir(verificationRoot);

    function write(p, c) {
        if (!force && fs.existsSync(p)) return;
        writeFile(p, c);
        actions.push({ action: 'write', path: p });
    }

    write(path.join(baseRoot, 'implementation-plan.md'), '# Implementation Plan\n\nTBD\n');
    write(path.join(baseRoot, 'tdd-plan.md'), '# TDD Plan\n\nTBD\n');
    write(path.join(baseRoot, 'implementation-checklist.md'), '# Implementation Checklist\n\n- [ ] TBD\n');
    write(path.join(baseRoot, 'SUMMARY.md'), '# Summary\n\nTBD\n');

    const now = new Date().toISOString();
    const manifest = {
        schema: 'brainwav.governance.run-manifest.v1',
        tier,
        arcs: [],
        spec: {
            current_state: '',
            desired_state: ''
        },
        verification: {
            success_criteria: [],
            commands: []
        },
        learn: {
            insights: [],
            followups: []
        },
        decision_hierarchy: {
            deterministic_tools: [],
            cli_invocations: [],
            prompts: [],
            agents_used: []
        },
        evidence_triplet: {
            milestone_test: 'logs/tests/milestone.log',
            contract_snapshot: 'json/contracts-snapshot.json',
            reviewer_pointer: 'json/reviewer.json'
        },
        created_at: now,
        updated_at: now
    };
    write(
        path.join(jsonRoot, 'run-manifest.json'),
        `${JSON.stringify(manifest, null, 2)}\n`
    );
    write(path.join(jsonRoot, 'memory-ids.json'), '[]\n');

    write(path.join(testsRoot, 'milestone.log'), '');
    write(path.join(jsonRoot, 'contracts-snapshot.json'), '');
    write(path.join(jsonRoot, 'reviewer.json'), '');
    write(path.join(verificationRoot, 'trace-context.log'), '');

    return actions;
}

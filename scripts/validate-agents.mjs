#!/usr/bin/env node
/**
 * @fileoverview Validate AGENTS.md integrity (size + referenced paths/jobs).
 * @license Apache-2.0
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const AGENTS_GLOB = 'AGENTS.md';
const MAX_BYTES = 32768;
const IGNORE_DIRS = new Set(['.git', 'node_modules', '.agentic-governance', 'dist']);
const IGNORE_PATH_PATTERNS = [
  /^https?:/i,
  /^mailto:/i,
  /^#/,
  /^\$\{/,
  /<slug>/,
  /<PR_NUMBER>/,
  /<SHORT_SHA>/,
  /<[^>]+>/,
  /\*/,
  /\.{3}/
];

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function walk(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    if (IGNORE_DIRS.has(entry.name)) return;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, results);
      return;
    }
    if (entry.isFile() && entry.name === AGENTS_GLOB) results.push(full);
  });
  return results;
}

function isIgnored(value) {
  return IGNORE_PATH_PATTERNS.some((pattern) => pattern.test(value));
}

function normalizeCandidate(candidate) {
  const cleaned = candidate.replace(/`/g, '').trim();
  const withoutQuery = cleaned.split('?')[0];
  return withoutQuery.split('#')[0];
}

function collectCandidates(content) {
  const candidates = new Set();
  const linkRegex = /\[[^\]]+\]\(([^)]+)\)/g;
  const codeRegex = /`([^`]+)`/g;
  let match;
  while ((match = linkRegex.exec(content))) {
    const value = normalizeCandidate(match[1]);
    if (value) candidates.add(value);
  }
  while ((match = codeRegex.exec(content))) {
    const value = normalizeCandidate(match[1]);
    if (value) candidates.add(value);
  }
  return [...candidates];
}

function looksLikePath(value) {
  if (isIgnored(value)) return false;
  if (value.includes('://')) return false;
  if (value.includes(' ')) return false;
  if (value.startsWith('./') || value.startsWith('../')) return true;
  if (value.startsWith('brainwav/') || value.startsWith('docs/') || value.startsWith('scripts/')) return true;
  if (value.endsWith('.md') || value.endsWith('.mjs') || value.endsWith('.json') || value.endsWith('.yaml') || value.endsWith('.yml') || value.endsWith('.toml')) return true;
  return false;
}

function resolvePath(value) {
  if (path.isAbsolute(value)) return value;
  if (value.startsWith('./') || value.startsWith('../')) return path.resolve(repoRoot, value);
  return path.resolve(repoRoot, value);
}

function validateAgentsPaths(files) {
  const failures = [];
  files.forEach((filePath) => {
    const content = read(filePath);
    const candidates = collectCandidates(content);
    candidates.forEach((candidate) => {
      if (!looksLikePath(candidate)) return;
      const resolved = resolvePath(candidate);
      if (!fs.existsSync(resolved)) {
        const rel = path.relative(repoRoot, filePath);
        failures.push(`${rel}: missing path ${candidate}`);
      }
    });
  });
  return failures;
}

function collectAncestorAgents(filePath) {
  const ancestors = [];
  let current = path.dirname(filePath);
  while (true) {
    const candidate = path.join(current, AGENTS_GLOB);
    if (fs.existsSync(candidate)) ancestors.push(candidate);
    if (current === repoRoot) break;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return ancestors;
}

function validateAgentsSize(files) {
  const failures = [];
  files.forEach((filePath) => {
    const chain = collectAncestorAgents(filePath);
    const bytes = chain.reduce((sum, entry) => sum + fs.statSync(entry).size, 0);
    if (bytes > MAX_BYTES) {
      const rel = path.relative(repoRoot, filePath);
      failures.push(`AGENTS size budget exceeded for ${rel}: ${bytes} bytes > ${MAX_BYTES} bytes`);
    }
  });
  return failures;
}

function validateJobs(files) {
  const failures = [];
  const combined = files.map((file) => read(file)).join('\n');
  const jobNames = [];
  if (combined.includes('docs-validate')) jobNames.push('docs-validate');
  if (combined.includes('agents-integrity')) jobNames.push('agents-integrity');
  if (jobNames.length === 0) return failures;
  const workflowsDir = path.join(repoRoot, '.github', 'workflows');
  if (!fs.existsSync(workflowsDir)) {
    failures.push('missing .github/workflows for job checks');
    return failures;
  }
  const workflows = fs.readdirSync(workflowsDir).filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'));
  const workflowContent = workflows.map((file) => read(path.join(workflowsDir, file))).join('\n');
  jobNames.forEach((job) => {
    const pattern = new RegExp(`^\\s*${job}:`, 'm');
    if (!pattern.test(workflowContent)) {
      failures.push(`missing workflow job: ${job}`);
    }
  });
  return failures;
}

/**
 * CLI entry point.
 * @returns {void} No return value.
 */
function main() {
  const agentsFiles = walk(repoRoot);
  const failures = [
    ...validateAgentsSize(agentsFiles),
    ...validateAgentsPaths(agentsFiles),
    ...validateJobs(agentsFiles)
  ];
  if (failures.length > 0) {
    console.error('[brAInwav] AGENTS integrity check failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
    return;
  }
  console.log('[brAInwav] AGENTS integrity check passed.');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('validate-agents.mjs')) {
  main();
}

export default main;

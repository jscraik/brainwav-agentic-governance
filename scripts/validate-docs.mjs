#!/usr/bin/env node
/**
 * @fileoverview Validate docs links and referenced paths.
 * @license Apache-2.0
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const DOCS = ['AGENTS.md', 'CODESTYLE.md', 'README.md', 'docs/adoption.md', 'brainwav/governance/docs/gold-standard-checklist.md'];
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
  /\*\*/, // bold markers from tables
  /^docs\/GOVERNANCE\.md$/,
  /\.{3}/
];

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function isIgnored(pathValue) {
  return IGNORE_PATH_PATTERNS.some((pattern) => pattern.test(pathValue));
}

function normalizeCandidate(candidate) {
  return candidate.replace(/`/g, '').trim();
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
  if (value.startsWith('http://') || value.startsWith('https://')) return false;
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

function validateDocs() {
  const failures = [];
  DOCS.forEach((doc) => {
    const docPath = path.join(repoRoot, doc);
    if (!fs.existsSync(docPath)) return;
    const content = read(docPath);
    const candidates = collectCandidates(content);
    candidates.forEach((candidate) => {
      if (!looksLikePath(candidate)) return;
      const resolved = resolvePath(candidate);
      if (!fs.existsSync(resolved)) {
        failures.push(`${doc}: missing path ${candidate}`);
      }
    });
  });
  return failures;
}

/**
 * CLI entry point.
 * @returns {void} No return value.
 */
function main() {
  const failures = validateDocs();
  if (failures.length > 0) {
    console.error('[brAInwav] docs validation failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
    return;
  }
  console.log('[brAInwav] docs validation passed.');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('validate-docs.mjs')) {
  main();
}

export default main;

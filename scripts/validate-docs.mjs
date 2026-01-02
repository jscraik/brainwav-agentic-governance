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

const ROOT_DOCS = [
  'AGENTS.md',
  'CODESTYLE.md',
  'README.md',
  'docs/packs.md',
  'brainwav/governance/README.md',
  'brainwav/governance-pack/README.md',
  'brainwav/governance/docs/documentation-governance.md',
  'brainwav/governance/docs/cortex-aegis.md',
  'brainwav/governance/docs/testing-qa.md',
  'brainwav/governance/docs/gold-standard-checklist.md'
];
const IGNORE_PATH_PATTERNS = [
  /^https?:/i,
  /^mailto:/i,
  /^#/,
  /^\$\{/,
  /<slug>/,
  /<PR_NUMBER>/,
  /<SHORT_SHA>/,
  /<[^>]+>/,
  /^tasks\//,
  /^logs\//,
  /^verification\//,
  /^json\//,
  /^reports\//,
  /^attestations\//,
  /^sbom\//,
  /^analysis\//,
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
  if (value.startsWith('http://') || value.startsWith('https://')) return false;
  if (value.includes('://')) return false;
  if (value.includes(' ')) return false;
  if (!value.includes('/') && !value.startsWith('.')) return false;
  if (value.startsWith('./') || value.startsWith('../')) return true;
  if (value.startsWith('brainwav/') || value.startsWith('docs/') || value.startsWith('scripts/')) return true;
  if (value.endsWith('.md') || value.endsWith('.mjs') || value.endsWith('.json') || value.endsWith('.yaml') || value.endsWith('.yml') || value.endsWith('.toml')) return true;
  return false;
}

function resolvePath(value, baseDir) {
  if (path.isAbsolute(value)) return value;
  const isRepoRooted = value.startsWith('brainwav/')
    || value.startsWith('docs/')
    || value.startsWith('scripts/')
    || value.startsWith('.github/')
    || value.startsWith('.agentic-governance/')
    || value.startsWith('.cortex/');
  if (value.startsWith('./') || value.startsWith('../')) return path.resolve(baseDir, value);
  if (isRepoRooted || value.startsWith('.')) return path.resolve(repoRoot, value);
  return path.resolve(baseDir, value);
}

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  entries.forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(full));
      return;
    }
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(full);
  });
  return files;
}

function resolveDocsList() {
  const docs = new Set(ROOT_DOCS);
  const governanceDocsDir = path.join(repoRoot, 'brainwav', 'governance', 'docs');
  listMarkdownFiles(governanceDocsDir).forEach((file) => docs.add(path.relative(repoRoot, file)));
  return Array.from(docs);
}

function validateDocs() {
  const failures = [];
  const docs = resolveDocsList();
  docs.forEach((doc) => {
    const docPath = path.join(repoRoot, doc);
    if (!fs.existsSync(docPath)) return;
    const content = read(docPath);
    const candidates = collectCandidates(content);
    candidates.forEach((candidate) => {
      if (!looksLikePath(candidate)) return;
      const resolved = resolvePath(candidate, path.dirname(docPath));
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

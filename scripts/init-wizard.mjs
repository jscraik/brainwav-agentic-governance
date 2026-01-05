#!/usr/bin/env node
/**
 * @fileoverview Interactive init wizard for brAInwav governance.
 * @license Apache-2.0
 *
 * This wizard guides users through initial governance setup with 3-5 questions.
 * Designed to reduce adoption friction from "read docs for 30 min" to "5 min to governed task".
 */

import fs from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function logo() {
  return `
${colorize('═══════════════════════════════════════════════════════════════', 'blue')}
${colorize('  brAInwav Agentic Governance', 'bold')}
${colorize('  from demo to duty', 'dim')}
${colorize('═══════════════════════════════════════════════════════════════', 'blue')}
`;
}

async function detectProjectType() {
  const hasPackageJson = fs.existsSync('package.json');
  const hasCargoToml = fs.existsSync('Cargo.toml');
  const hasGoMod = fs.existsSync('go.mod');
  const hasPyProject = fs.existsSync('pyproject.toml');

  if (hasPackageJson) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (pkg.dependencies?.react || pkg.dependencies?.next || pkg.dependencies?.vue) {
      return 'frontend';
    }
    if (pkg.dependencies?.express || pkg.dependencies?.fastify) {
      return 'backend';
    }
    return 'node';
  }
  if (hasCargoToml) return 'rust';
  if (hasGoMod) return 'go';
  if (hasPyProject) return 'python';
  return 'general';
}

async function question(rl, query, defaultValue = null, options = []) {
  let prompt = `${colorize('→', 'blue')} ${query}`;
  if (defaultValue) {
    prompt += colorize(` [${defaultValue}]`, 'dim');
  }
  if (options.length > 0) {
    prompt += '\n' + options.map((opt, i) => `  ${i + 1}. ${opt}`).join('\n');
    prompt += `\n${colorize('Choose a number:', 'blue')} `;
  } else {
    prompt += ': ';
  }

  const answer = await rl.question(prompt);

  if (answer.trim() === '' && defaultValue) {
    return defaultValue;
  }

  if (options.length > 0) {
    const num = parseInt(answer, 10);
    if (num >= 1 && num <= options.length) {
      return options[num - 1];
    }
  }

  return answer.trim();
}

async function confirm(rl, query, defaultValue = true) {
  const prompt = `${colorize('→', 'blue')} ${query} ${colorize(
    defaultValue ? '[Y/n]' : '[y/N]',
    'dim'
  )}: `;
  const answer = (await rl.question(prompt)).toLowerCase().trim();
  if (answer === '') return defaultValue;
  return answer === 'y' || answer === 'yes';
}

function createConfig(answers) {
  return {
    version: '1.0.0',
    mode: answers.mode,
    profile: answers.profile,
    packs: answers.packs || [],
    features: {
      sdd: answers.profile === 'enterprise',
      agentLoop: answers.profile === 'enterprise',
    },
    taskRoot: 'tasks',
    specRoot: 'specs',
    overlays: [],
    mcp: {
      transports: answers.hasMcp ? ['stdio'] : [],
    },
  };
}

/**
 * Create a task folder with standard structure.
 * @param {string} slug - Task identifier.
 * @param {string} tier - Task tier/type.
 * @returns {string} Path to created task directory.
 */
function createTaskFolder(slug, tier) {
  const taskDir = path.join(process.cwd(), 'tasks', slug);
  fs.mkdirSync(taskDir, { recursive: true });
  fs.mkdirSync(path.join(taskDir, 'context'), { recursive: true });
  fs.mkdirSync(path.join(taskDir, 'plan'), { recursive: true });
  fs.mkdirSync(path.join(taskDir, 'evidence'), { recursive: true });
  fs.mkdirSync(path.join(taskDir, 'logs'), { recursive: true });

  // Create task brief template
  const brief = `# ${slug}

**Type**: ${tier}
**Status**: In Progress
**Created**: ${new Date().toISOString().split('T')[0]}

## Objective

<!-- Describe what this task aims to accomplish -->

## Acceptance Criteria

<!-- Define what "done" looks like -->

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Context

<!-- Any background context, constraints, or dependencies -->

## Plan

<!-- Your AI assistant will create a ≤7-step plan here -->

`;

  fs.writeFileSync(path.join(taskDir, 'BRIEF.md'), brief);

  // Create evidence triplet placeholders
  fs.writeFileSync(
    path.join(taskDir, 'evidence', 'tests.md'),
    '# Test Evidence\n\n<!-- Add test results here -->\n'
  );
  fs.writeFileSync(
    path.join(taskDir, 'evidence', 'review.json'),
    JSON.stringify({ status: 'pending', findings: [] }, null, 2)
  );
  fs.writeFileSync(
    path.join(taskDir, 'evidence', 'summary.md'),
    '# Review Summary\n\n<!-- Add review summary here -->\n'
  );

  return taskDir;
}

/**
 * Run the interactive governance initialization wizard.
 * Guides users through initial setup with 3-5 questions.
 * @returns {Promise<void>} Resolves when wizard completes.
 */
export async function runInitWizard() {
  console.log(logo());

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Detect project context
    const projectType = await detectProjectType();

    console.log(colorize('\n📋 Detected project type:', 'dim'), projectType);

    // Question 1: Task type
    console.log(colorize('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue'));
    console.log(colorize('Step 1 of 3: What type of work?', 'bold'));

    const taskType = await question(rl, 'What are you working on?', 'feature', [
      'feature',
      'fix',
      'research',
      'refactor',
      'update',
    ]);

    // Question 2: Governance level
    console.log(colorize('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue'));
    console.log(colorize('Step 2 of 3: How much governance do you need?', 'bold'));
    console.log(colorize('\n  Starter:     Workflow only (no extra tools)', 'dim'));
    console.log(colorize('  Standard:    Workflow + basic checks (semgrep, gitleaks)', 'dim'));
    console.log(colorize('  Enterprise:  Full compliance (all security tools)', 'dim'));

    const profile = await question(rl, 'Select governance level', 'starter', [
      'starter',
      'standard',
      'enterprise',
    ]);

    // Question 3: Task name
    console.log(colorize('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue'));
    console.log(colorize('Step 3 of 3: Name your task', 'bold'));

    const taskName = await question(rl, 'Task identifier (slug format: my-task)', 'my-first-task');
    const slug = taskName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Optional: MCP setup
    console.log(colorize('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue'));
    console.log(colorize('Optional: MCP Integration', 'bold'));

    const hasMcp = await confirm(rl, 'Do you use Model Context Protocol (MCP) with Claude or similar?', false);

    // Create config
    const config = createConfig({
      mode: taskType === 'research' ? 'creative' : 'delivery',
      profile,
      packs: profile === 'starter' ? [] : profile === 'standard' ? ['security-appsec'] : ['security-appsec', 'supply-chain', 'a11y'],
      hasMcp,
    });

    // Create .agentic-governance directory
    const agDir = path.join(process.cwd(), '.agentic-governance');
    fs.mkdirSync(agDir, { recursive: true });

    // Write config
    fs.writeFileSync(path.join(agDir, 'config.json'), JSON.stringify(config, null, 2) + '\n');

    // Create task folder
    createTaskFolder(slug, taskType);

    // Success message
    console.log(colorize('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green'));
    console.log(colorize('✓ Governance initialized!', 'bold'));
    console.log(colorize('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green'));

    console.log(colorize('\n📁 Created:', 'bold'));
    console.log(`  .agentic-governance/config.json`);
    console.log(`  tasks/${slug}/`);

    console.log(colorize('\n🎯 Profile:', 'bold'), profile);
    console.log(colorize('  Mode:', 'dim'), config.mode);
    console.log(colorize('  Packs:', 'dim'), config.packs.length > 0 ? config.packs.join(', ') : 'none');

    if (profile === 'starter') {
      console.log(colorize('\n💡 Tip:', 'yellow'), 'Upgrade to Standard or Enterprise later with:');
      console.log(colorize('   pnpm exec brainwav-governance init --profile standard', 'dim'));
    } else {
      console.log(colorize('\n📦 Security tools:', 'bold'), 'Run this to install required tools:');
      console.log(colorize('   pnpm exec brainwav-governance doctor', 'dim'));
      console.log(colorize('   Or use Docker:', 'dim'));
      console.log(colorize('   docker run --rm -v $(pwd):/workspace brainwav/governance-tools:latest', 'dim'));
    }

    console.log(colorize('\n🚀 Next steps:', 'bold'));
    console.log('  1. Open tasks/' + slug + '/BRIEF.md and fill in the objective');
    console.log('  2. Ask your AI assistant to create a ≤7-step plan');
    console.log('  3. Run: pnpm exec brainwav-governance validate');
    console.log('  4. Create your PR with evidence');

    console.log(colorize('\n📚 Learn more:', 'dim'));
    console.log('   Quickstart:  brainwav/governance/10-flow/governance-quickstart.md');
    console.log('   Agent rules: brainwav/governance/00-core/AGENT_CHARTER.md');

    console.log();
  } catch (error) {
    console.error(colorize('\n❌ Error:', 'red'), error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle --help
if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(logo());
    console.log('Interactive init wizard for brAInwav governance\n');
    console.log('Usage:');
    console.log('  pnpm exec brainwav-governance init');
    console.log('  npx brainwav-governance init\n');
    console.log('Options:');
    console.log('  -h, --help     Show this help');
    console.log('  --mode <type>  Skip prompt: creative | delivery');
    console.log('  --profile <lvl> Skip prompt: starter | standard | enterprise');
    console.log('  --slug <name>  Skip prompt: task identifier');
    console.log('  --yes          Use all defaults\n');
    process.exit(0);
  }

  await runInitWizard();
}

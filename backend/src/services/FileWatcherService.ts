/**
 * FileWatcherService - Watches framework files for changes
 * Triggers auto-reindex when skills or governance documents are modified
 */

import { watch } from 'chokidar';
import { join } from 'path';
import { EventEmitter } from 'events';

export type WatchEventType = 'add' | 'change' | 'unlink';
export type WatchTarget = 'skill' | 'governance' | 'manifest';

export interface FileChangeEvent {
  type: WatchEventType;
  target: WatchTarget;
  path: string;
  timestamp: number;
}

export class FileWatcherService extends EventEmitter {
  private watchers: Map<string, any>;
  private projectRoot: string;
  private isEnabled: boolean;

  constructor(projectRoot: string = process.cwd()) {
    super();
    this.projectRoot = projectRoot;
    this.watchers = new Map();
    this.isEnabled = false;
  }

  /**
   * Start watching framework files
   */
  start(): void {
    if (this.isEnabled) {
      return;
    }

    console.log('👁️  Starting file watchers...');

    // Watch skills directory
    this.watchSkills();

    // Watch governance directory
    this.watchGovernance();

    // Watch tasks directory (run-manifest.json files)
    this.watchTasks();

    this.isEnabled = true;
    console.log('✅ File watchers started');
  }

  /**
   * Stop watching files
   */
  stop(): void {
    if (!this.isEnabled) {
      return;
    }

    console.log('🛑 Stopping file watchers...');

    for (const [name, watcher] of this.watchers) {
      watcher.close();
      console.log(`   Closed: ${name}`);
    }

    this.watchers.clear();
    this.isEnabled = false;
    console.log('✅ File watchers stopped');
  }

  /**
   * Watch skills directory
   */
  private watchSkills(): void {
    const skillsPath = join(this.projectRoot, '.claude/skills');
    const watcher = watch(skillsPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('add', (path) => this.handleSkillChange('add', path))
      .on('change', (path) => this.handleSkillChange('change', path))
      .on('unlink', (path) => this.handleSkillChange('unlink', path));

    this.watchers.set('skills', watcher);
    console.log(`   Watching: .claude/skills/`);
  }

  /**
   * Watch governance directory
   */
  private watchGovernance(): void {
    const governancePath = join(this.projectRoot, 'brainwav/governance');
    const watcher = watch(governancePath, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('add', (path) => this.handleGovernanceChange('add', path))
      .on('change', (path) => this.handleGovernanceChange('change', path))
      .on('unlink', (path) => this.handleGovernanceChange('unlink', path));

    this.watchers.set('governance', watcher);
    console.log(`   Watching: brainwav/governance/`);
  }

  /**
   * Watch tasks directory for run-manifest.json
   */
  private watchTasks(): void {
    const tasksPath = join(this.projectRoot, 'tasks');
    const watcher = watch(tasksPath, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('add', (path) => this.handleTaskChange('add', path))
      .on('change', (path) => this.handleTaskChange('change', path))
      .on('unlink', (path) => this.handleTaskChange('unlink', path));

    this.watchers.set('tasks', watcher);
    console.log(`   Watching: tasks/`);
  }

  /**
   * Handle skill file changes
   */
  private handleSkillChange(type: WatchEventType, path: string): void {
    // Only care about SKILL.md files
    if (!path.endsWith('SKILL.md')) {
      return;
    }

    console.log(`📝 Skill ${type}: ${path}`);

    const event: FileChangeEvent = {
      type,
      target: 'skill',
      path,
      timestamp: Date.now()
    };

    this.emit('change', event);
    this.emit('skill:change', event);
  }

  /**
   * Handle governance file changes
   */
  private handleGovernanceChange(type: WatchEventType, path: string): void {
    // Focus on governance-index.json and .md files
    if (!path.endsWith('.json') && !path.endsWith('.md')) {
      return;
    }

    console.log(`📜 Governance ${type}: ${path}`);

    const event: FileChangeEvent = {
      type,
      target: 'governance',
      path,
      timestamp: Date.now()
    };

    this.emit('change', event);
    this.emit('governance:change', event);

    // Special handling for governance-index.json
    if (path.endsWith('governance-index.json')) {
      this.emit('governance:index:change', event);
    }
  }

  /**
   * Handle task manifest changes
   */
  private handleTaskChange(type: WatchEventType, path: string): void {
    // Only care about run-manifest.json files
    if (!path.endsWith('run-manifest.json')) {
      return;
    }

    console.log(`✅ Task ${type}: ${path}`);

    const event: FileChangeEvent = {
      type,
      target: 'manifest',
      path,
      timestamp: Date.now()
    };

    this.emit('change', event);
    this.emit('task:change', event);
  }

  /**
   * Get watcher status
   */
  getStatus(): { enabled: boolean; watchers: string[] } {
    return {
      enabled: this.isEnabled,
      watchers: Array.from(this.watchers.keys())
    };
  }
}

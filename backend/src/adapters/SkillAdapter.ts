/**
 * SkillAdapter - Reads and indexes your existing skills from .claude/skills/
 * NEVER modifies your skill files - only reads and indexes them
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { createHash } from 'crypto';
import { glob } from 'glob';
import { getDatabase, transaction } from '../db/client.js';
import type {
  Skill,
  SkillMetadata,
  SkillSearchResult,
  IndexResult
} from '../types/index.js';

export class SkillAdapter {
  private skillsDir: string;
  private db: ReturnType<typeof getDatabase>;

  constructor(projectRoot: string = process.cwd()) {
    this.skillsDir = join(projectRoot, '.claude/skills');
    this.db = getDatabase();
  }

  /**
   * Index all skills from .claude/skills directory
   * Searches for SKILL.md files in subdirectories
   */
  async indexAllSkills(): Promise<IndexResult> {
    const startTime = Date.now();
    console.log('🔍 Indexing skills from .claude/skills/...');

    // Find all SKILL.md files
    const pattern = join(this.skillsDir, '*/SKILL.md');
    const skillFiles = await glob(pattern);

    console.log(`   Found ${skillFiles.length} skill files`);

    let indexed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const filePath of skillFiles) {
      try {
        const stat = statSync(filePath);
        const currentHash = this.computeFileHash(filePath);

        // Check if already indexed and unchanged
        const existing = this.db
          .prepare('SELECT hash FROM skills_index WHERE file_path = ?')
          .get(filePath) as { hash: string } | undefined;

        if (existing && existing.hash === currentHash) {
          skipped++;
          continue;
        }

        // Parse and index
        const skill = await this.parseSkillFile(filePath);
        await this.indexSkill(skill, stat.mtimeMs, currentHash);
        indexed++;

        console.log(`   ✅ Indexed: ${skill.name} (${skill.category})`);
      } catch (error) {
        const msg = `Failed to index ${filePath}: ${error}`;
        errors.push(msg);
        console.error(`   ❌ ${msg}`);
      }
    }

    // Update metadata
    const duration = Date.now() - startTime;
    await this.updateIndexMetadata(skillFiles.length, duration, errors);

    const result: IndexResult = {
      indexed,
      skipped,
      total: skillFiles.length,
      duration
    };

    console.log(`\n✅ Skills indexing complete!`);
    console.log(`   Indexed: ${indexed}`);
    console.log(`   Skipped: ${skipped} (unchanged)`);
    console.log(`   Duration: ${duration}ms`);

    if (errors.length > 0) {
      console.log(`   Errors: ${errors.length}`);
    }

    return result;
  }

  /**
   * Parse your existing SKILL.md format
   */
  private async parseSkillFile(filePath: string): Promise<SkillMetadata> {
    const content = readFileSync(filePath, 'utf8');
    const relativePath = relative(process.cwd(), filePath);

    // Extract frontmatter (your existing format)
    const frontmatterMatch = content.match(/^## Metadata\n([\s\S]+?)\n##/m);
    if (!frontmatterMatch) {
      throw new Error(`Invalid skill format: ${relativePath}`);
    }

    const metadata = this.parseMetadata(frontmatterMatch[1]);
    const skillId = (metadata.name || 'unknown').toLowerCase().replace(/\s+/g, '-');
    const category = this.getCategoryFromPath(filePath);

    return {
      skillId,
      name: metadata.name || 'Unknown',
      description: metadata.description || '',
      triggers: metadata.triggers || [],
      category,
      version: metadata.version || '1.0.0',
      workflowSteps: metadata.workflowSteps || 7,
      filePath: relativePath,
      lastModified: 0, // Will be set by caller
      indexedAt: Date.now(),
      hash: '',
      accessCount: 0
    };
  }

  /**
   * Parse metadata section from SKILL.md
   */
  private parseMetadata(frontmatter: string): Partial<SkillMetadata> {
    const metadata: any = {
      name: '',
      description: '',
      triggers: [],
      version: '1.0.0',
      workflowSteps: 7
    };

    const lines = frontmatter.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*-\s*\*\*([^*]+)\*\*:\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        switch (key.trim().toLowerCase()) {
          case 'name':
            metadata.name = value.trim();
            break;
          case 'description':
            metadata.description = value.trim();
            break;
          case 'triggers':
            // Parse array format: ["trigger1", "trigger2"]
            const arrayMatch = value.match(/\[(.+)\]/);
            if (arrayMatch) {
              metadata.triggers = arrayMatch[1]
                .split(',')
                .map((t: string) => t.trim().replace(/['"]/g, ''));
            }
            break;
          case 'version':
            metadata.version = value.trim();
            break;
          case 'workflow_steps':
            metadata.workflowSteps = parseInt(value.trim(), 10);
            break;
        }
      }
    }

    return metadata;
  }

  /**
   * Get category from file path
   */
  private getCategoryFromPath(filePath: string): string {
    const parentDir = dirname(filePath);
    return parentDir.split('/').pop() || 'general';
  }

  /**
   * Index a skill in the database
   */
  private async indexSkill(
    skill: SkillMetadata,
    lastModified: number,
    hash: string
  ): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO skills_index (
        skill_id, name, description, triggers, category, version,
        workflow_steps, file_path, last_modified, indexed_at, hash,
        access_count, last_accessed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      skill.skillId,
      skill.name,
      skill.description,
      JSON.stringify(skill.triggers),
      skill.category,
      skill.version,
      skill.workflowSteps,
      skill.filePath,
      lastModified,
      Date.now(),
      hash,
      skill.accessCount,
      skill.lastAccessed || 0
    );
  }

  /**
   * Get skill by ID (with caching)
   */
  async getSkill(skillId: string): Promise<Skill | null> {
    const row = this.db
      .prepare('SELECT * FROM skills_index WHERE skill_id = ?')
      .get(skillId) as any;

    if (!row) {
      return null;
    }

    // Record access
    this.recordAccess(skillId);

    // Load body from file if not cached
    let body = row.body;
    if (!body) {
      try {
        body = readFileSync(row.file_path, 'utf-8');
        // Cache body
        this.db.prepare('UPDATE skills_index SET body = ? WHERE skill_id = ?')
          .run(body, skillId);
      } catch (error) {
        console.error(`Failed to load skill body: ${row.file_path}`, error);
        body = '';
      }
    }

    return {
      ...row,
      triggers: JSON.parse(row.triggers),
      body,
      cached: !!row.body
    };
  }

  /**
   * Search skills (full-text search)
   */
  async searchSkills(query: string, limit = 20): Promise<SkillSearchResult[]> {
    const rows = this.db.prepare(`
      SELECT
        si.skill_id,
        si.name,
        si.description,
        si.triggers,
        si.category,
        bm25(skills_fts) as rank
      FROM skills_index si
      JOIN skills_fts fts ON si.rowid = fts.rowid
      WHERE skills_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `).all(query, limit) as any[];

    return rows.map((row: any) => ({
      skillId: row.skill_id,
      name: row.name,
      description: row.description,
      triggers: JSON.parse(row.triggers),
      category: row.category,
      rank: row.rank
    }));
  }

  /**
   * Find skills by trigger phrase
   */
  async findByTrigger(trigger: string, limit = 10): Promise<SkillMetadata[]> {
    const rows = this.db.prepare(`
      SELECT * FROM skills_index
      WHERE json_extract(triggers, '$') LIKE ?
      ORDER BY access_count DESC, last_accessed DESC
      LIMIT ?
    `).all(`%"${trigger}"%`, limit) as any[];

    return rows.map((row: any) => ({
      ...row,
      triggers: JSON.parse(row.triggers)
    }));
  }

  /**
   * List all skills (for API)
   */
  async listSkills(options: {
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<SkillMetadata[]> {
    let sql = 'SELECT * FROM skills_index';
    const params: any[] = [];

    if (options.category) {
      sql += ' WHERE category = ?';
      params.push(options.category);
    }

    sql += ' ORDER BY access_count DESC, last_accessed DESC';

    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }

    const rows = this.db.prepare(sql).all(...params) as any[];

    return rows.map((row: any) => ({
      ...row,
      triggers: JSON.parse(row.triggers)
    }));
  }

  /**
   * Record skill access for LRU and popularity
   */
  private recordAccess(skillId: string): void {
    this.db.prepare(`
      UPDATE skills_index
      SET access_count = access_count + 1,
          last_accessed = ?
      WHERE skill_id = ?
    `).run(Date.now(), skillId);
  }

  /**
   * Validate skill integrity (hash check)
   */
  async validateSkill(skillId: string): Promise<{
    valid: boolean;
    expectedHash: string;
    actualHash: string;
  }> {
    const row = this.db
      .prepare('SELECT * FROM skills_index WHERE skill_id = ?')
      .get(skillId) as any;

    if (!row) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    const actualHash = this.computeFileHash(row.file_path);
    const valid = actualHash === row.hash;

    return {
      valid,
      expectedHash: row.hash,
      actualHash
    };
  }

  /**
   * Compute SHA-256 hash of a file
   */
  private computeFileHash(filePath: string): string {
    const content = readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Update index metadata
   */
  private async updateIndexMetadata(
    itemCount: number,
    duration: number,
    errors: string[]
  ): Promise<void> {
    const status = errors.length === 0 ? 'success' : 'failed';

    this.db.prepare(`
      UPDATE index_metadata
      SET last_indexed_at = ?,
          items_indexed = ?,
          index_duration_ms = ?,
          status = ?,
          error_message = ?
      WHERE id = 'skills'
    `).run(
      Date.now(),
      itemCount,
      duration,
      status,
      errors.length > 0 ? errors.join('\n') : null
    );
  }

  /**
   * Get index statistics
   */
  getIndexStats() {
    const row = this.db
      .prepare('SELECT * FROM index_metadata WHERE id = ?')
      .get('skills') as any;

    const totalSkills = this.db
      .prepare('SELECT COUNT(*) as count FROM skills_index')
      .get() as any;

    const byCategory = this.db
      .prepare(`
        SELECT category, COUNT(*) as count
        FROM skills_index
        GROUP BY category
        ORDER BY count DESC
      `).all();

    return {
      ...row,
      totalSkills: totalSkills.count,
      byCategory
    };
  }
}

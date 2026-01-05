/**
 * GovernanceAdapter - Reads and caches your governance-index.json
 * Validates document hashes against actual files
 */

import { readFileSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { createHash } from 'crypto';
import { getDatabase } from '../db/client.js';
import type {
  GovernanceDocument,
  ValidationResult,
  DriftReport,
  DriftedDocument,
  ValidationReport
} from '../types/index.js';

interface GovernanceIndex {
  description: string;
  version: string;
  updated: string;
  note?: string;
  precedence: string[];
  skills?: any;
  infra?: any;
  packScoped?: any;
  reference?: string[];
  docs?: {
    [docName: string]: {
      path: string;
      sha256: string;
      required_tokens: string[];
      class: 'normative' | 'infra' | 'reference';
      owner?: string;
      change_class?: string;
      [key: string]: any;
    };
  };
}

export class GovernanceAdapter {
  private governanceDir: string;
  private indexPath: string;
  private db: ReturnType<typeof getDatabase>;

  constructor(projectRoot: string = process.cwd()) {
    this.governanceDir = join(projectRoot, 'brainwav/governance');
    this.indexPath = join(this.governanceDir, '90-infra/governance-index.json');
    this.db = getDatabase();
  }

  /**
   * Load governance-index.json and cache in SQLite
   */
  async loadAndCacheIndex(): Promise<void> {
    console.log('🔍 Loading governance-index.json...');

    try {
      const content = readFileSync(this.indexPath, 'utf-8');
      const index: GovernanceIndex = JSON.parse(content);

      console.log(`   Version: ${index.version}`);
      console.log(`   Precedence: ${index.precedence.length} documents`);

      // Cache precedence order
      await this.cachePrecedence(index.precedence);

      // Cache documents
      if (index.docs) {
        let cached = 0;
        for (const [docName, doc] of Object.entries(index.docs)) {
          await this.cacheDocument(docName, doc, index.precedence);
          cached++;
        }
        console.log(`   Cached ${cached} documents`);
      }

      // Update metadata
      await this.updateIndexMetadata(Object.keys(index.docs || {}).length, true);

      console.log('✅ Governance index loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load governance index:', error);
      await this.updateIndexMetadata(0, false, String(error));
      throw error;
    }
  }

  /**
   * Cache precedence order
   */
  private async cachePrecedence(precedence: string[]): Promise<void> {
    this.db.prepare('DELETE FROM governance_precedence').run();

    const stmt = this.db.prepare(
      'INSERT INTO governance_precedence (precedence_order, path) VALUES (?, ?)'
    );

    for (let i = 0; i < precedence.length; i++) {
      stmt.run(i, precedence[i]);
    }
  }

  /**
   * Cache a single document from index
   */
  private async cacheDocument(docName: string, doc: any, precedenceList: string[]): Promise<void> {
    this.db.prepare(`
      INSERT OR REPLACE INTO governance_cache
      (doc_name, path, sha256, required_tokens, class, precedence, last_validated)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      docName,
      doc.path,
      doc.sha256,
      JSON.stringify(doc.required_tokens || []),
      doc.class,
      this.getPrecedence(doc.path, precedenceList),
      Date.now()
    );
  }

  /**
   * Get precedence order for a document path
   */
  private getPrecedence(path: string, precedenceList: string[]): number {
    const index = precedenceList.findIndex(p => path.includes(p) || p.includes(path));
    return index >= 0 ? index : 999;
  }

  /**
   * Validate a single document (instant - cached)
   */
  async validateDocument(docName: string): Promise<ValidationResult> {
    const cached = this.db
      .prepare('SELECT * FROM governance_cache WHERE doc_name = ?')
      .get(docName) as any;

    if (!cached) {
      return {
        valid: false,
        error: `Document not found in index: ${docName}`
      };
    }

    // Compute current file hash
    const fullPath = join(this.governanceDir, cached.path);
    let actualHash: string;

    try {
      actualHash = await this.computeFileHash(fullPath);
    } catch (error) {
      return {
        valid: false,
        error: `Failed to read file: ${cached.path}`
      };
    }

    // Compare with expected hash
    const valid = actualHash === cached.sha256;
    const drifted = !valid;

    // Update drift status
    this.db.prepare(`
      UPDATE governance_cache
      SET file_hash = ?,
          hash_drift = ?,
          last_checked = ?
      WHERE doc_name = ?
    `).run(actualHash, drifted ? 1 : 0, Date.now(), docName);

    return {
      valid,
      actualHash,
      expectedHash: cached.sha256,
      drifted,
      path: cached.path
    };
  }

  /**
   * Validate all documents (fast - O(n) with cache)
   */
  async validateAll(): Promise<ValidationReport> {
    console.log('🔍 Validating all governance documents...');

    const documents = this.db
      .prepare('SELECT doc_name FROM governance_cache')
      .all() as any[];

    const results: ValidationResult[] = [];
    let valid = 0;
    let invalid = 0;

    for (const doc of documents) {
      const result = await this.validateDocument(doc.doc_name);
      results.push(result);

      if (result.valid) {
        valid++;
      } else {
        invalid++;
        console.log(`   ❌ ${doc.doc_name}: ${result.drifted ? 'hash mismatch' : 'error'}`);
      }
    }

    const report: ValidationReport = {
      valid: invalid === 0,
      totalDocuments: results.length,
      validDocuments: valid,
      invalidDocuments: invalid,
      results,
      validatedAt: Date.now()
    };

    console.log(`\n✅ Validation complete: ${valid}/${results.length} valid`);

    return report;
  }

  /**
   * Detect drift across all documents (fast - from cache)
   */
  async detectDrift(): Promise<DriftReport> {
    console.log('🔍 Detecting governance hash drift...');

    const documents = this.db
      .prepare('SELECT * FROM governance_cache')
      .all() as any[];

    const drifted: DriftedDocument[] = [];

    for (const doc of documents) {
      // Check if we've already detected drift
      if (doc.hash_drift) {
        drifted.push({
          docName: doc.doc_name,
          path: doc.path,
          expectedHash: doc.sha256,
          actualHash: doc.file_hash,
          canAutoFix: false // Content drift cannot be auto-fixed
        });
      } else {
        // Re-validate to be sure
        const result = await this.validateDocument(doc.doc_name);
        if (result.drifted) {
          drifted.push({
            docName: doc.doc_name,
            path: result.path!,
            expectedHash: result.expectedHash!,
            actualHash: result.actualHash!,
            canAutoFix: false
          });
        }
      }
    }

    const report: DriftReport = {
      hasDrift: drifted.length > 0,
      driftedDocuments: drifted,
      totalDocuments: documents.length,
      checkedAt: Date.now()
    };

    if (drifted.length > 0) {
      console.log(`\n⚠️  Detected drift in ${drifted.length} documents:`);
      drifted.forEach(d => {
        console.log(`   - ${d.docName}: ${d.path}`);
      });
    } else {
      console.log('✅ No drift detected');
    }

    return report;
  }

  /**
   * Get governance index status
   */
  async getStatus() {
    const metadata = this.db
      .prepare('SELECT * FROM index_metadata WHERE id = ?')
      .get('governance') as any;

    const totalDocs = this.db
      .prepare('SELECT COUNT(*) as count FROM governance_cache')
      .get() as any;

    const driftedCount = this.db
      .prepare('SELECT COUNT(*) as count FROM governance_cache WHERE hash_drift = 1')
      .get() as any;

    return {
      ...metadata,
      totalDocuments: totalDocs.count,
      driftedDocuments: driftedCount.count
    };
  }

  /**
   * Get document by name
   */
  async getDocument(docName: string): Promise<GovernanceDocument | null> {
    const row = this.db
      .prepare('SELECT * FROM governance_cache WHERE doc_name = ?')
      .get(docName) as any;

    if (!row) {
      return null;
    }

    return {
      docName: row.doc_name,
      path: row.path,
      sha256: row.sha256,
      requiredTokens: JSON.parse(row.required_tokens),
      class: row.class,
      precedence: row.precedence
    };
  }

  /**
   * List all documents in precedence order
   */
  async listDocuments(): Promise<GovernanceDocument[]> {
    const rows = this.db.prepare(`
      SELECT
        gc.doc_name,
        gc.path,
        gc.sha256,
        gc.required_tokens,
        gc.class,
        gc.precedence
      FROM governance_cache gc
      ORDER BY gc.precedence ASC
    `).all() as any[];

    return rows.map((row: any) => ({
      docName: row.doc_name,
      path: row.path,
      sha256: row.sha256,
      requiredTokens: JSON.parse(row.required_tokens),
      class: row.class,
      precedence: row.precedence
    }));
  }

  /**
   * Compute SHA-256 hash of a file
   */
  private async computeFileHash(filePath: string): Promise<string> {
    const content = readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Update index metadata
   */
  private async updateIndexMetadata(
    itemCount: number,
    success: boolean,
    error?: string
  ): Promise<void> {
    this.db.prepare(`
      UPDATE index_metadata
      SET last_indexed_at = ?,
          items_indexed = ?,
          status = ?,
          error_message = ?
      WHERE id = 'governance'
    `).run(
      Date.now(),
      itemCount,
      success ? 'success' : 'failed',
      error || null
    );
  }
}

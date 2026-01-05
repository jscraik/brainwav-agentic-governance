/**
 * TaskAccountabilityAdapter - Manages four-perspective sign-off system
 * Product, Dev, QA, and AI Agent perspectives with veto power
 * This is a key differentiator from MCAF which lacks accountability tracking
 */

import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { getDatabase } from '../db/client.js';
import type {
  TaskAccountability,
  Perspective,
  SignOffStatus,
  AIMode,
  FourPerspectives,
  PerspectiveStatus,
  AIStatus,
  SignOffReceipt,
  AIModeTransition
} from '../types/index.js';

export interface SignOffRequest {
  taskId: string;
  perspective: Perspective;
  decision: SignOffStatus;
  signedBy: string;
  notes?: string;
  confidence?: number; // For AI perspective
}

export interface RiskAssessment {
  taskId: string;
  riskScore: number; // 0-100
  factors: string[];
  recommendedMode: AIMode;
  canProceed: boolean;
}

export class TaskAccountabilityAdapter {
  private tasksDir: string;
  private db: ReturnType<typeof getDatabase>;

  constructor(projectRoot: string = process.cwd()) {
    this.tasksDir = join(projectRoot, 'tasks');
    this.db = getDatabase();
    this.initializeDatabase();
  }

  /**
   * Initialize accountability tables
   */
  private initializeDatabase(): void {
    // Tables are created by migration, this ensures they exist
    this.db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='task_accountability'
    `).get();
  }

  /**
   * Create new task accountability record
   */
  async createAccountability(
    slug: string,
    tier: string,
    arc: string
  ): Promise<TaskAccountability> {
    const taskId = `${slug}-${Date.now()}`;

    const accountability: TaskAccountability = {
      taskId,
      slug,
      perspectives: this.createEmptyPerspectives(),
      riskScore: 50, // Default medium risk
      canProceed: false,
      blocked: false,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };

    this.db.prepare(`
      INSERT INTO task_accountability (
        task_id, slug, perspectives, risk_score, can_proceed,
        blocked, blocked_by, blocked_reason, created_at, completed_at, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      taskId,
      slug,
      JSON.stringify(accountability.perspectives),
      accountability.riskScore,
      accountability.canProceed ? 1 : 0,
      accountability.blocked ? 1 : 0,
      null,
      null,
      accountability.createdAt,
      null,
      accountability.lastUpdated
    );

    return accountability;
  }

  /**
   * Create empty perspectives (all pending)
   */
  private createEmptyPerspectives(): FourPerspectives {
    return {
      product: { status: 'pending' },
      dev: { status: 'pending' },
      qa: { status: 'pending' },
      aiAgent: {
        perspective: 'aiAgent',
        status: 'pending',
        mode: 'consultative' // Default to consultative mode
      }
    };
  }

  /**
   * Record sign-off from a perspective
   */
  async recordSignOff(request: SignOffRequest): Promise<TaskAccountability> {
    const existing = this.getAccountability(request.taskId);
    if (!existing) {
      throw new Error(`Task not found: ${request.taskId}`);
    }

    const perspectives = { ...existing.perspectives };
    const perspective = perspectives[request.perspective];

    // Update perspective status
    if (request.perspective === 'aiAgent') {
      const aiStatus: AIStatus = {
        perspective: 'aiAgent',
        status: request.decision,
        mode: (perspective as AIStatus).mode,
        confidence: request.confidence
      };

      if (request.decision === 'vetoed') {
        aiStatus.vetoReason = request.notes;
      } else if (request.decision === 'approved') {
        aiStatus.signedBy = request.signedBy;
        aiStatus.signedAt = Date.now();
        aiStatus.notes = request.notes;
      }

      perspectives.aiAgent = aiStatus;
    } else {
      const status: PerspectiveStatus = {
        status: request.decision
      };

      if (request.decision === 'approved') {
        status.signedBy = request.signedBy;
        status.signedAt = Date.now();
        status.notes = request.notes;
      } else if (request.decision === 'vetoed') {
        status.vetoReason = request.notes;
      }

      (perspectives as any)[request.perspective] = status;
    }

    // Check for veto
    const vetoPerspective = this.checkForVeto(perspectives);
    const canProceed = this.calculateCanProceed(perspectives);

    // Update risk score based on perspectives
    const riskScore = this.calculateRiskScore(perspectives);

    const accountability: TaskAccountability = {
      ...existing,
      perspectives,
      canProceed,
      blocked: !!vetoPerspective,
      blockedBy: vetoPerspective || undefined,
      blockedReason: vetoPerspective
        ? `Vetoed by ${vetoPerspective} perspective`
        : undefined,
      lastUpdated: Date.now()
    };

    // Update database
    this.db.prepare(`
      UPDATE task_accountability
      SET perspectives = ?,
          can_proceed = ?,
          blocked = ?,
          blocked_by = ?,
          blocked_reason = ?,
          risk_score = ?,
          last_updated = ?
      WHERE task_id = ?
    `).run(
      JSON.stringify(accountability.perspectives),
      accountability.canProceed ? 1 : 0,
      accountability.blocked ? 1 : 0,
      accountability.blockedBy || null,
      accountability.blockedReason || null,
      accountability.riskScore,
      accountability.lastUpdated,
      request.taskId
    );

    // Record sign-off receipt
    this.recordReceipt(request);

    return accountability;
  }

  /**
   * Check if any perspective has vetoed
   */
  private checkForVeto(perspectives: FourPerspectives): Perspective | null {
    for (const [key, perspective] of Object.entries(perspectives)) {
      if (perspective.status === 'vetoed') {
        return key as Perspective;
      }
    }
    return null;
  }

  /**
   * Calculate if task can proceed
   * Requires approval from all perspectives OR explicit delegation
   */
  private calculateCanProceed(perspectives: FourPerspectives): boolean {
    const aiMode = (perspectives.aiAgent as AIStatus).mode;

    // Delegated mode: AI can proceed with just AI approval
    if (aiMode === 'delegated') {
      return perspectives.aiAgent.status === 'approved';
    }

    // Collaborative mode: AI + at least one human perspective
    if (aiMode === 'collaborative') {
      return perspectives.aiAgent.status === 'approved' &&
        (perspectives.product.status === 'approved' ||
         perspectives.dev.status === 'approved' ||
         perspectives.qa.status === 'approved');
    }

    // Consultative mode: All perspectives must approve
    return perspectives.product.status === 'approved' &&
           perspectives.dev.status === 'approved' &&
           perspectives.qa.status === 'approved' &&
           perspectives.aiAgent.status === 'approved';
  }

  /**
   * Calculate risk score based on perspective agreement
   */
  private calculateRiskScore(perspectives: FourPerspectives): number {
    let score = 50; // Base score

    // Increase score if perspectives disagree
    const disagreements = this.countDisagreements(perspectives);
    score += disagreements * 10;

    // Decrease score if all approve
    if (this.calculateCanProceed(perspectives)) {
      score -= 20;
    }

    // Increase if any veto
    if (this.checkForVeto(perspectives)) {
      score += 30;
    }

    // Normalize to 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count disagreements between perspectives
   */
  private countDisagreements(perspectives: FourPerspectives): number {
    let disagreements = 0;

    const humanPerspectives = [perspectives.product, perspectives.dev, perspectives.qa];
    const approvedCount = humanPerspectives.filter(p => p.status === 'approved').length;
    const vetoCount = humanPerspectives.filter(p => p.status === 'vetoed').length;

    if (approvedCount > 0 && vetoCount > 0) {
      disagreements += 2; // Mixed approvals and vetoes
    } else if (vetoCount > 1) {
      disagreements += vetoCount; // Multiple vetoes
    }

    // Check AI alignment with humans
    if (perspectives.aiAgent.status === 'approved' && vetoCount > 0) {
      disagreements += 1;
    }

    return disagreements;
  }

  /**
   * Record sign-off receipt
   */
  private recordReceipt(request: SignOffRequest): void {
    const receipt: SignOffReceipt = {
      taskId: request.taskId,
      perspective: request.perspective,
      decision: request.decision,
      signedBy: request.signedBy,
      timestamp: Date.now(),
      notes: request.notes
    };

    this.db.prepare(`
      INSERT INTO sign_off_receipts
      (task_id, perspective, decision, signed_by, timestamp, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      receipt.taskId,
      receipt.perspective,
      receipt.decision,
      receipt.signedBy,
      receipt.timestamp,
      receipt.notes || null
    );
  }

  /**
   * Get accountability by task ID
   */
  getAccountability(taskId: string): TaskAccountability | null {
    const row = this.db
      .prepare('SELECT * FROM task_accountability WHERE task_id = ?')
      .get(taskId) as any;

    if (!row) {
      return null;
    }

    return {
      taskId: row.task_id,
      slug: row.slug,
      perspectives: JSON.parse(row.perspectives),
      riskScore: row.risk_score,
      canProceed: row.can_proceed === 1,
      blocked: row.blocked === 1,
      blockedBy: row.blocked_by,
      blockedReason: row.blocked_reason,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      lastUpdated: row.last_updated
    };
  }

  /**
   * Get accountability by slug
   */
  getAccountabilityBySlug(slug: string): TaskAccountability | null {
    const row = this.db
      .prepare('SELECT * FROM task_accountability WHERE slug = ? ORDER BY created_at DESC LIMIT 1')
      .get(slug) as any;

    if (!row) {
      return null;
    }

    return {
      taskId: row.task_id,
      slug: row.slug,
      perspectives: JSON.parse(row.perspectives),
      riskScore: row.risk_score,
      canProceed: row.can_proceed === 1,
      blocked: row.blocked === 1,
      blockedBy: row.blocked_by,
      blockedReason: row.blocked_reason,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      lastUpdated: row.last_updated
    };
  }

  /**
   * Get sign-off receipts for task
   */
  getSignOffReceipts(taskId: string): SignOffReceipt[] {
    const rows = this.db
      .prepare('SELECT * FROM sign_off_receipts WHERE task_id = ? ORDER BY timestamp DESC')
      .all(taskId) as any[];

    return rows.map(row => ({
      taskId: row.task_id,
      perspective: row.perspective,
      decision: row.decision,
      signedBy: row.signed_by,
      timestamp: row.timestamp,
      notes: row.notes
    }));
  }

  /**
   * List all pending tasks
   */
  listPending(): TaskAccountability[] {
    const rows = this.db
      .prepare(`
        SELECT * FROM task_accountability
        WHERE can_proceed = 0 AND blocked = 0
        ORDER BY created_at ASC
      `)
      .all() as any[];

    return rows.map(row => ({
      taskId: row.task_id,
      slug: row.slug,
      perspectives: JSON.parse(row.perspectives),
      riskScore: row.risk_score,
      canProceed: row.can_proceed === 1,
      blocked: row.blocked === 1,
      blockedBy: row.blocked_by,
      blockedReason: row.blocked_reason,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      lastUpdated: row.last_updated
    }));
  }

  /**
   * List all blocked tasks
   */
  listBlocked(): TaskAccountability[] {
    const rows = this.db
      .prepare(`
        SELECT * FROM task_accountability
        WHERE blocked = 1
        ORDER BY created_at ASC
      `)
      .all() as any[];

    return rows.map(row => ({
      taskId: row.task_id,
      slug: row.slug,
      perspectives: JSON.parse(row.perspectives),
      riskScore: row.risk_score,
      canProceed: row.can_proceed === 1,
      blocked: row.blocked === 1,
      blockedBy: row.blocked_by,
      blockedReason: row.blocked_reason,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      lastUpdated: row.last_updated
    }));
  }
}

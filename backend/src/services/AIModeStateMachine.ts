/**
 * AIModeStateMachine - Manages AI participation mode transitions
 * Tracks Delegated/Collaborative/Consultative modes with automatic escalation
 *
 * Modes:
 * - Delegated: AI can proceed autonomously on low-risk tasks
 * - Collaborative: AI works with humans, requires at least one human approval
 * - Consultative: AI advises, humans decide (full approval required)
 *
 * Automatic escalation based on risk score and complexity
 */

import { getDatabase } from '../db/client.js';
import type { AIMode, AIModeTransition, FourPerspectives } from '../types/index.js';

export interface ModeTransitionConfig {
  escalateToConsultative: number; // Risk score threshold (default: 70)
  escalateToCollaborative: number; // Risk score threshold (default: 40)
  delegateThreshold: number; // Risk score threshold (default: 20)
}

export interface ComplexityAssessment {
  complexity: 'low' | 'medium' | 'high';
  factors: string[];
  estimatedEffort: number; // hours
  uncertainty: number; // 0-100
}

export class AIModeStateMachine {
  private db: ReturnType<typeof getDatabase>;
  private config: ModeTransitionConfig;

  constructor(config?: Partial<ModeTransitionConfig>) {
    this.db = getDatabase();
    this.config = {
      escalateToConsultative: 70,
      escalateToCollaborative: 40,
      delegateThreshold: 20,
      ...config
    };
  }

  /**
   * Assess task complexity and recommend mode
   */
  assessComplexity(
    slug: string,
    tier: string,
    arc: string,
    description?: string
  ): ComplexityAssessment & { recommendedMode: AIMode } {
    const factors: string[] = [];
    let complexity: 'low' | 'medium' | 'high' = 'low';
    let estimatedEffort = 4; // Default 4 hours
    let uncertainty = 30;

    // Analyze tier
    if (tier.includes('critical') || tier.includes('1')) {
      factors.push('Critical tier');
      complexity = 'high';
      estimatedEffort += 8;
      uncertainty += 20;
    } else if (tier.includes('important') || tier.includes('2')) {
      factors.push('Important tier');
      complexity = 'medium';
      estimatedEffort += 4;
      uncertainty += 10;
    }

    // Analyze arc
    if (arc.includes('security') || arc.includes('compliance')) {
      factors.push('Security/compliance arc');
      complexity = 'high';
      estimatedEffort += 6;
      uncertainty += 30;
    } else if (arc.includes('performance') || arc.includes('scaling')) {
      factors.push('Performance arc');
      complexity = 'medium';
      estimatedEffort += 4;
      uncertainty += 15;
    }

    // Analyze description
    if (description) {
      const descLower = description.toLowerCase();

      if (descLower.includes('refactor') || descLower.includes('rewrite')) {
        factors.push('Code restructuring');
        complexity = 'high';
        estimatedEffort += 6;
        uncertainty += 20;
      }

      if (descLower.includes('integration') || descLower.includes('api')) {
        factors.push('External integration');
        complexity = 'medium';
        estimatedEffort += 3;
        uncertainty += 15;
      }

      if (descLower.includes('test') || descLower.includes('coverage')) {
        factors.push('Test implementation');
        complexity = 'low';
        uncertainty -= 10;
      }

      if (descLower.includes('ui') || descLower.includes('ux')) {
        factors.push('UI/UX work');
        complexity = 'medium';
        uncertainty += 25; // UI is subjective
      }
    }

    // Normalize values
    estimatedEffort = Math.max(1, Math.min(40, estimatedEffort));
    uncertainty = Math.max(0, Math.min(100, uncertainty));

    // Determine complexity level
    if (estimatedEffort > 16 || uncertainty > 60) {
      complexity = 'high';
    } else if (estimatedEffort > 8 || uncertainty > 40) {
      complexity = 'medium';
    }

    // Recommend mode based on complexity
    let recommendedMode: AIMode = 'consultative';
    if (complexity === 'low' && uncertainty < 30) {
      recommendedMode = 'delegated';
    } else if (complexity === 'medium') {
      recommendedMode = 'collaborative';
    }

    return {
      complexity,
      factors,
      estimatedEffort,
      uncertainty,
      recommendedMode
    };
  }

  /**
   * Determine recommended mode based on risk score
   */
  getModeForRiskScore(riskScore: number): AIMode {
    if (riskScore >= this.config.escalateToConsultative) {
      return 'consultative';
    } else if (riskScore >= this.config.escalateToCollaborative) {
      return 'collaborative';
    } else {
      return 'delegated';
    }
  }

  /**
   * Check if mode should escalate based on perspectives
   */
  shouldEscalate(perspectives: FourPerspectives, currentMode: AIMode): boolean {
    // Check for disagreements
    const humanPerspectives = [perspectives.product, perspectives.dev, perspectives.qa];
    const approvedCount = humanPerspectives.filter(p => p.status === 'approved').length;
    const vetoCount = humanPerspectives.filter(p => p.status === 'vetoed').length;

    // Escalate if there are vetoes
    if (vetoCount > 0 && currentMode === 'delegated') {
      return true;
    }

    // Escalate if humans disagree
    if (approvedCount > 0 && vetoCount > 0 && currentMode === 'delegated') {
      return true;
    }

    return false;
  }

  /**
   * Transition AI mode
   */
  async transitionMode(
    taskId: string,
    from: AIMode,
    to: AIMode,
    reason: string,
    triggeredBy: 'automatic' | 'manual' = 'automatic',
    riskScore?: number
  ): Promise<AIModeTransition> {
    const transition: AIModeTransition = {
      taskId,
      from,
      to,
      reason,
      triggeredBy,
      riskScore,
      timestamp: Date.now()
    };

    // Record transition
    this.db.prepare(`
      INSERT INTO ai_mode_transitions
      (task_id, from_mode, to_mode, reason, triggered_by, risk_score, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      taskId,
      from,
      to,
      reason,
      triggeredBy,
      riskScore || null,
      transition.timestamp
    );

    // Update task accountability with new mode
    const existing = this.db
      .prepare('SELECT perspectives FROM task_accountability WHERE task_id = ?')
      .get(taskId) as any;

    if (existing) {
      const perspectives = JSON.parse(existing.perspectives);
      perspectives.aiAgent.mode = to;

      this.db.prepare(`
        UPDATE task_accountability
        SET perspectives = ?, last_updated = ?
        WHERE task_id = ?
      `).run(JSON.stringify(perspectives), Date.now(), taskId);
    }

    return transition;
  }

  /**
   * Get mode transition history for task
   */
  getTransitionHistory(taskId: string): AIModeTransition[] {
    const rows = this.db
      .prepare('SELECT * FROM ai_mode_transitions WHERE task_id = ? ORDER BY timestamp ASC')
      .all(taskId) as any[];

    return rows.map(row => ({
      taskId: row.task_id,
      from: row.from_mode,
      to: row.to_mode,
      reason: row.reason,
      triggeredBy: row.triggered_by,
      riskScore: row.risk_score,
      timestamp: row.timestamp
    }));
  }

  /**
   * Get current mode for task
   */
  getCurrentMode(taskId: string): AIMode | null {
    const row = this.db
      .prepare('SELECT perspectives FROM task_accountability WHERE task_id = ?')
      .get(taskId) as any;

    if (!row) {
      return null;
    }

    const perspectives = JSON.parse(row.perspectives);
    return perspectives.aiAgent?.mode || 'consultative';
  }

  /**
   * Auto-evaluate and escalate mode if needed
   */
  async autoEvaluateMode(
    taskId: string,
    riskScore: number,
    perspectives: FourPerspectives
  ): Promise<{ changed: boolean; newMode?: AIMode; transition?: AIModeTransition }> {
    const currentMode = perspectives.aiAgent.mode;
    const recommendedMode = this.getModeForRiskScore(riskScore);

    // Check if we should escalate based on perspectives
    const shouldEscalate = this.shouldEscalate(perspectives, currentMode);

    let targetMode = recommendedMode;

    // Escalate if there are disagreements
    if (shouldEscalate && currentMode === 'delegated') {
      targetMode = 'collaborative';
    }

    // No change needed
    if (targetMode === currentMode) {
      return { changed: false };
    }

    // Transition mode
    const transition = await this.transitionMode(
      taskId,
      currentMode,
      targetMode,
      `Automatic escalation based on risk score (${riskScore}) and perspective analysis`,
      'automatic',
      riskScore
    );

    return {
      changed: true,
      newMode: targetMode,
      transition
    };
  }

  /**
   * Get mode statistics across all tasks
   */
  getModeStats(): {
    delegated: number;
    collaborative: number;
    consultative: number;
    total: number;
    recentTransitions: AIModeTransition[];
  } {
    const delegated = this.db
      .prepare("SELECT COUNT(*) as count FROM task_accountability WHERE json_extract(perspectives, '$.aiAgent.mode') = 'delegated'")
      .get() as any;

    const collaborative = this.db
      .prepare("SELECT COUNT(*) as count FROM task_accountability WHERE json_extract(perspectives, '$.aiAgent.mode') = 'collaborative'")
      .get() as any;

    const consultative = this.db
      .prepare("SELECT COUNT(*) as count FROM task_accountability WHERE json_extract(perspectives, '$.aiAgent.mode') = 'consultative'")
      .get() as any;

    const total = this.db
      .prepare('SELECT COUNT(*) as count FROM task_accountability')
      .get() as any;

    const recentTransitions = this.db
      .prepare(`
        SELECT * FROM ai_mode_transitions
        ORDER BY timestamp DESC
        LIMIT 10
      `)
      .all() as any[];

    return {
      delegated: delegated.count,
      collaborative: collaborative.count,
      consultative: consultative.count,
      total: total.count,
      recentTransitions: recentTransitions.map(row => ({
        taskId: row.task_id,
        from: row.from_mode,
        to: row.to_mode,
        reason: row.reason,
        triggeredBy: row.triggered_by,
        riskScore: row.risk_score,
        timestamp: row.timestamp
      }))
    };
  }

  /**
   * Update mode transition configuration
   */
  updateConfig(config: Partial<ModeTransitionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ModeTransitionConfig {
    return { ...this.config };
  }
}

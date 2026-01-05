/**
 * AMYGA Governance Backend - REST API Server
 * Acceleration layer with caching, accountability, and real-time streaming
 * KEY DIFFERENTIATORS vs MCAF:
 * - Real-time WebSocket streaming (MCAF lacks this)
 * - Four-perspective accountability (MCAF lacks this)
 * - Auto-reindex file watchers (MCAF lacks this)
 * - Progressive disclosure caching (superior to MCAF)
 */

import express from 'express';
import { getDatabase, healthCheck } from './db/client.js';
import { SkillAdapter } from './adapters/SkillAdapter.js';
import { GovernanceAdapter } from './adapters/GovernanceAdapter.js';
import { TaskAccountabilityAdapter } from './adapters/TaskAccountabilityAdapter.js';
import { CacheManager } from './cache/CacheManager.js';
import { FileWatcherService } from './services/FileWatcherService.js';
import { AIModeStateMachine } from './services/AIModeStateMachine.js';
import { WebSocketService } from './services/WebSocketService.js';
import type { APIResponse, APIError } from './types/index.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Initialize Services
// ============================================
const cacheManager = new CacheManager();
const fileWatcher = new FileWatcherService();
const aiModeStateMachine = new AIModeStateMachine();
const webSocketService = new WebSocketService(3001);

const skillAdapter = new SkillAdapter();
const governanceAdapter = new GovernanceAdapter();
const accountabilityAdapter = new TaskAccountabilityAdapter();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// Health Check
// ============================================
app.get('/health', async (req, res) => {
  const dbHealth = healthCheck();
  const wsStatus = webSocketService.getStatus();
  const watcherStatus = fileWatcher.getStatus();

  res.json({
    status: dbHealth.healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: dbHealth,
      websocket: wsStatus,
      fileWatcher: watcherStatus
    }
  });
});

// ============================================
// Skills Endpoints
// ============================================

app.get('/api/v1/skills', async (req, res) => {
  try {
    const { category, limit, offset } = req.query;
    const skills = await skillAdapter.listSkills({
      category: category as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    });

    res.json({
      data: skills,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to list skills', error);
  }
});

app.get('/api/v1/skills/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || typeof q !== 'string') {
      return sendError(res, 400, 'INVALID_QUERY', 'Query parameter "q" is required');
    }

    // Check cache first
    const cacheKey = `search:${q}:${limit}`;
    const cached = cacheManager.getSearch(cacheKey);
    if (cached) {
      return res.json({
        data: cached,
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
          version: '0.2.0',
          cached: true
        }
      });
    }

    const results = await skillAdapter.searchSkills(q, parseInt(limit as string));

    // Cache results
    cacheManager.setSearch(cacheKey, results);

    res.json({
      data: results,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Search failed', error);
  }
});

app.get('/api/v1/skills/trigger', async (req, res) => {
  try {
    const { phrase, limit = 10 } = req.query;

    if (!phrase || typeof phrase !== 'string') {
      return sendError(res, 400, 'INVALID_PHRASE', 'Trigger phrase is required');
    }

    const results = await skillAdapter.findByTrigger(phrase, parseInt(limit as string));

    res.json({
      data: results,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to find skills by trigger', error);
  }
});

app.get('/api/v1/skills/:skillId', async (req, res) => {
  try {
    const { skillId } = req.params;

    // Check cache first
    const cached = cacheManager.getSkill(skillId);
    if (cached) {
      return res.json({
        data: {
          metadata: {
            skillId: cached.skillId,
            name: cached.name,
            description: cached.description,
            triggers: cached.triggers,
            category: cached.category,
            version: cached.version,
            workflowSteps: cached.workflowSteps,
            accessCount: cached.accessCount,
            lastAccessed: cached.lastAccessed
          },
          body: cached.body,
          cached: true
        },
        meta: {
          requestId: req.id,
          timestamp: new Date().toISOString(),
          version: '0.2.0'
        }
      });
    }

    const skill = await skillAdapter.getSkill(skillId);

    if (!skill) {
      return sendError(res, 404, 'SKILL_NOT_FOUND', `Skill not found: ${skillId}`);
    }

    // Cache skill
    cacheManager.setSkill(skillId, skill);

    res.json({
      data: {
        metadata: {
          skillId: skill.skillId,
          name: skill.name,
          description: skill.description,
          triggers: skill.triggers,
          category: skill.category,
          version: skill.version,
          workflowSteps: skill.workflowSteps,
          accessCount: skill.accessCount,
          lastAccessed: skill.lastAccessed
        },
        body: skill.body,
        cached: skill.cached
      },
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to get skill', error);
  }
});

// ============================================
// Compliance Endpoints
// ============================================

app.get('/api/v1/compliance/status', async (req, res) => {
  try {
    const status = await governanceAdapter.getStatus();

    res.json({
      data: status,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to get status', error);
  }
});

app.get('/api/v1/compliance/documents', async (req, res) => {
  try {
    const documents = await governanceAdapter.listDocuments();

    res.json({
      data: documents,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to list documents', error);
  }
});

app.post('/api/v1/compliance/validate', async (req, res) => {
  try {
    const report = await governanceAdapter.validateAll();

    // Broadcast drift if detected
    if (!report.valid && report.invalidDocuments > 0) {
      webSocketService.broadcastGovernanceDrift(
        report.results
          .filter(r => !r.valid)
          .map(r => ({
            docName: 'unknown',
            path: r.path!,
            expectedHash: r.expectedHash!,
            actualHash: r.actualHash!,
            canAutoFix: false
          }))
      );
    }

    res.json({
      data: {
        valid: report.valid,
        totalDocuments: report.totalDocuments,
        validDocuments: report.validDocuments,
        invalidDocuments: report.invalidDocuments,
        validatedAt: report.validatedAt,
        duration: 0
      },
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Validation failed', error);
  }
});

app.get('/api/v1/compliance/drift', async (req, res) => {
  try {
    const report = await governanceAdapter.detectDrift();

    res.json({
      data: {
        hasDrift: report.hasDrift,
        driftedDocuments: report.driftedDocuments,
        totalDocuments: report.totalDocuments,
        checkedAt: report.checkedAt
      },
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Drift detection failed', error);
  }
});

// ============================================
// Accountability Endpoints (KEY DIFFERENTIATOR vs MCAF)
// ============================================

/**
 * POST /api/v1/accountability/create - Create accountability record
 */
app.post('/api/v1/accountability/create', async (req, res) => {
  try {
    const { slug, tier, arc } = req.body;

    if (!slug || !tier || !arc) {
      return sendError(res, 400, 'INVALID_INPUT', 'slug, tier, and arc are required');
    }

    const accountability = await accountabilityAdapter.createAccountability(slug, tier, arc);

    // Assess complexity and set initial AI mode
    const assessment = aiModeStateMachine.assessComplexity(slug, tier, arc);
    await aiModeStateMachine.transitionMode(
      accountability.taskId,
      'consultative',
      assessment.recommendedMode,
      `Initial mode based on complexity assessment: ${assessment.complexity}`,
      'automatic',
      accountability.riskScore
    );

    res.json({
      data: {
        accountability,
        complexityAssessment: assessment
      },
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to create accountability', error);
  }
});

/**
 * GET /api/v1/accountability/:taskId - Get accountability by task ID
 */
app.get('/api/v1/accountability/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const accountability = accountabilityAdapter.getAccountability(taskId);

    if (!accountability) {
      return sendError(res, 404, 'TASK_NOT_FOUND', `Task not found: ${taskId}`);
    }

    res.json({
      data: accountability,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to get accountability', error);
  }
});

/**
 * GET /api/v1/accountability/slug/:slug - Get accountability by slug
 */
app.get('/api/v1/accountability/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const accountability = accountabilityAdapter.getAccountabilityBySlug(slug);

    if (!accountability) {
      return sendError(res, 404, 'TASK_NOT_FOUND', `Task not found: ${slug}`);
    }

    res.json({
      data: accountability,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to get accountability', error);
  }
});

/**
 * POST /api/v1/accountability/signoff - Record sign-off
 */
app.post('/api/v1/accountability/signoff', async (req, res) => {
  try {
    const { taskId, perspective, decision, signedBy, notes, confidence } = req.body;

    if (!taskId || !perspective || !decision || !signedBy) {
      return sendError(res, 400, 'INVALID_INPUT', 'taskId, perspective, decision, and signedBy are required');
    }

    const accountability = await accountabilityAdapter.recordSignOff({
      taskId,
      perspective,
      decision,
      signedBy,
      notes,
      confidence
    });

    // Broadcast sign-off event
    webSocketService.broadcastAccountabilitySignoff(
      taskId,
      perspective,
      decision,
      accountability.canProceed
    );

    // Check if task was blocked/unblocked
    if (accountability.blocked) {
      webSocketService.broadcastTaskBlocked(
        taskId,
        accountability.blockedBy!,
        accountability.blockedReason || 'No reason provided'
      );
    } else if (accountability.canProceed) {
      webSocketService.broadcastTaskUnblocked(taskId);
    }

    res.json({
      data: accountability,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to record sign-off', error);
  }
});

/**
 * GET /api/v1/accountability/pending - List pending tasks
 */
app.get('/api/v1/accountability/pending', async (req, res) => {
  try {
    const pending = accountabilityAdapter.listPending();

    res.json({
      data: pending,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to list pending tasks', error);
  }
});

/**
 * GET /api/v1/accountability/blocked - List blocked tasks
 */
app.get('/api/v1/accountability/blocked', async (req, res) => {
  try {
    const blocked = accountabilityAdapter.listBlocked();

    res.json({
      data: blocked,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to list blocked tasks', error);
  }
});

/**
 * GET /api/v1/accountability/modes/stats - AI mode statistics
 */
app.get('/api/v1/accountability/modes/stats', async (req, res) => {
  try {
    const stats = aiModeStateMachine.getModeStats();

    res.json({
      data: stats,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to get mode stats', error);
  }
});

// ============================================
// Cache Endpoints
// ============================================

/**
 * GET /api/v1/cache/stats - Get cache statistics
 */
app.get('/api/v1/cache/stats', async (req, res) => {
  try {
    const stats = cacheManager.getStats();

    res.json({
      data: stats,
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to get cache stats', error);
  }
});

/**
 * POST /api/v1/cache/clear - Clear caches
 */
app.post('/api/v1/cache/clear', async (req, res) => {
  try {
    const { type } = req.body; // 'skills', 'governance', 'all'

    if (type === 'skills' || !type) {
      cacheManager.invalidateSkill('*');
    }
    if (type === 'governance' || !type) {
      cacheManager.invalidateGovernance('*');
    }
    if (type === 'search' || !type) {
      cacheManager.invalidateSearch();
    }
    if (!type || type === 'all') {
      cacheManager.clearAll();
    }

    webSocketService.broadcastCacheInvalidated(type || 'all', ['*']);

    res.json({
      data: {
        cleared: true,
        type: type || 'all'
      },
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to clear cache', error);
  }
});

// ============================================
// Index Management Endpoints
// ============================================

app.post('/api/v1/index/skills', async (req, res) => {
  try {
    const result = await skillAdapter.indexAllSkills();

    // Broadcast completion
    webSocketService.broadcastIndexComplete('skills', result.indexed, result.duration);

    res.json({
      data: {
        indexed: result.indexed,
        skipped: result.skipped,
        total: result.total,
        duration: result.duration
      },
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Indexing failed', error);
  }
});

app.post('/api/v1/index/governance', async (req, res) => {
  try {
    await governanceAdapter.loadAndCacheIndex();

    res.json({
      data: {
        success: true,
        message: 'Governance index reloaded'
      },
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to reload governance index', error);
  }
});

// ============================================
// Stats & Info
// ============================================

app.get('/api/v1/stats', async (req, res) => {
  try {
    const skillsStats = skillAdapter.getIndexStats();
    const governanceStats = await governanceAdapter.getStatus();
    const cacheStats = cacheManager.getStats();
    const wsStatus = webSocketService.getStatus();
    const modeStats = aiModeStateMachine.getModeStats();

    res.json({
      data: {
        skills: skillsStats,
        governance: governanceStats,
        cache: cacheStats,
        websocket: wsStatus,
        aiModes: modeStats,
        uptime: process.uptime()
      },
      meta: {
        requestId: req.id,
        timestamp: new Date().toISOString(),
        version: '0.2.0'
      }
    });
  } catch (error) {
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to get stats', error);
  }
});

// ============================================
// Error Handling
// ============================================

app.use((req, res) => {
  sendError(res, 404, 'NOT_FOUND', `Endpoint not found: ${req.method} ${req.path}`);
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred', err);
});

function sendError(
  res: express.Response,
  status: number,
  code: string,
  message: string,
  details?: any
): void {
  const error: APIError = {
    code,
    message,
    details
  };

  res.status(status).json({
    errors: [error],
    meta: {
      requestId: (req as any).id,
      timestamp: new Date().toISOString(),
      version: '0.2.0'
    }
  });
}

// ============================================
// Start Server
// ============================================

if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`\n🚀 AMYGA Governance Backend v0.2.0`);
    console.log(`   REST API: http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   WebSocket: ws://localhost:3001`);
    console.log(`\n💡 Getting started:`);
    console.log(`   1. Run migrations: pnpm run db:migrate`);
    console.log(`   2. Index skills: POST http://localhost:${PORT}/api/v1/index/skills`);
    console.log(`   3. Index governance: POST http://localhost:${PORT}/api/v1/index/governance`);
    console.log(`\n✨ Key Features (vs MCAF):`);
    console.log(`   ✅ Real-time WebSocket streaming`);
    console.log(`   ✅ Four-perspective accountability`);
    console.log(`   ✅ Auto-reindex file watchers`);
    console.log(`   ✅ Progressive disclosure caching`);
    console.log('   ');
  });

  // Start WebSocket server
  webSocketService.start();

  // Start file watcher (optional, can be enabled via env)
  if (process.env.ENABLE_FILE_WATCHER === 'true') {
    fileWatcher.start();

    // Connect file watcher to cache invalidation
    fileWatcher.on('skill:change', (event) => {
      const skillId = event.path.split('/').pop()?.replace('.md', '') || '';
      cacheManager.invalidateSkill(skillId);
      webSocketService.broadcastSkillChange(skillId, event.type);
    });

    fileWatcher.on('governance:change', (event) => {
      const docName = event.path.split('/').pop() || '';
      cacheManager.invalidateGovernance(docName);
      webSocketService.broadcastGovernanceChange(docName, event.type);
    });
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    webSocketService.stop();
    fileWatcher.stop();
    process.exit(0);
  });
}

export { app };

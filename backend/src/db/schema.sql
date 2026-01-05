-- AMYGA Governance Backend - Acceleration Layer Schema
-- This schema creates INDEXES on top of existing framework files
-- The filesystem remains the source of truth

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ============================================
-- SKILLS INDEX
-- Reads from: .claude/skills/*/SKILL.md
-- ============================================
CREATE TABLE IF NOT EXISTS skills_index (
  skill_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  triggers TEXT NOT NULL,              -- JSON array of trigger phrases
  category TEXT NOT NULL,
  version TEXT NOT NULL,
  workflow_steps INTEGER NOT NULL,
  file_path TEXT NOT NULL UNIQUE,     -- Absolute path to SKILL.md
  last_modified INTEGER NOT NULL,     -- File mtime (ms since epoch)
  indexed_at INTEGER NOT NULL,        -- When we indexed it
  hash TEXT NOT NULL,                 -- SHA-256 for cache invalidation
  access_count INTEGER DEFAULT 0,      -- For popularity sorting
  last_accessed INTEGER,              -- For LRU
  body TEXT                           -- Full skill body (cached)
);

-- Full-text search on skills
CREATE VIRTUAL TABLE IF NOT EXISTS skills_fts USING fts5(
  name,
  description,
  triggers,
  content=skills_index
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS skills_fts_insert AFTER INSERT ON skills_index BEGIN
  INSERT INTO skills_fts(rowid, name, description, triggers)
  VALUES (new.rowid, new.name, new.description, new.triggers);
END;

CREATE TRIGGER IF NOT EXISTS skills_fts_delete AFTER DELETE ON skills_index BEGIN
  DELETE FROM skills_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS skills_fts_update AFTER UPDATE ON skills_index BEGIN
  UPDATE skills_fts
  SET name = new.name,
      description = new.description,
      triggers = new.triggers
  WHERE rowid = new.rowid;
END;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills_index(category);
CREATE INDEX IF NOT EXISTS idx_skills_access_count ON skills_index(access_count DESC, last_accessed DESC);
CREATE INDEX IF NOT EXISTS idx_skills_last_modified ON skills_index(last_modified);

-- ============================================
-- GOVERNANCE CACHE
-- Reads from: brainwav/governance/90-infra/governance-index.json
-- Validates against: brainwav/governance/**/*.md
-- ============================================
CREATE TABLE IF NOT EXISTS governance_cache (
  doc_name TEXT PRIMARY KEY,          -- Key from governance-index.json
  path TEXT NOT NULL UNIQUE,          -- Relative path from brainwav/governance/
  sha256 TEXT NOT NULL,               -- Expected hash from index
  required_tokens TEXT NOT NULL,      -- JSON array from index
  class TEXT,                         -- normative, informative, infra
  precedence INTEGER NOT NULL,        -- Order from precedence array
  file_hash TEXT,                     -- Current actual file hash
  hash_drift BOOLEAN DEFAULT 0,       -- Calculated: file_hash != sha256
  last_validated INTEGER,             -- Last time we validated
  last_checked INTEGER                -- Last time we checked file
);

CREATE TABLE IF NOT EXISTS governance_precedence (
  precedence_order INTEGER PRIMARY KEY,
  path TEXT NOT NULL UNIQUE           -- Path from precedence array
);

-- Index for drift detection
CREATE INDEX IF NOT EXISTS idx_governance_drift ON governance_cache(hash_drift, precedence);

-- ============================================
-- TASK ACCOUNTABILITY OVERLAY
-- Reads from: tasks/<slug>/json/run-manifest.json
-- Adds: Four-perspective sign-off capability (Product, Dev, QA, AI Agent)
-- This is a KEY DIFFERENTIATOR from MCAF which lacks accountability tracking
-- ============================================
CREATE TABLE IF NOT EXISTS task_accountability (
  task_id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,

  -- Four-perspective sign-offs (JSON for flexibility)
  perspectives TEXT NOT NULL,         -- JSON: {product, dev, qa, aiAgent}

  -- Risk and state tracking
  risk_score REAL DEFAULT 50,         -- 0-100 risk score
  can_proceed INTEGER DEFAULT 0,      -- BOOLEAN: can task proceed?
  blocked INTEGER DEFAULT 0,          -- BOOLEAN: is task blocked?
  blocked_by TEXT,                    -- Which perspective vetoed
  blocked_reason TEXT,

  -- Metadata
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  last_updated INTEGER NOT NULL
);

-- Sign-off receipts (audit trail)
CREATE TABLE IF NOT EXISTS sign_off_receipts (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  perspective TEXT NOT NULL CHECK(perspective IN ('product', 'dev', 'qa', 'aiAgent')),
  decision TEXT NOT NULL CHECK(decision IN ('pending', 'approved', 'deferred', 'vetoed')),
  signed_by TEXT NOT NULL,
  notes TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (task_id) REFERENCES task_accountability(task_id) ON DELETE CASCADE
);

-- AI mode transition history
CREATE TABLE IF NOT EXISTS ai_mode_transitions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  from_mode TEXT NOT NULL CHECK(from_mode IN ('delegated', 'collaborative', 'consultative')),
  to_mode TEXT NOT NULL CHECK(to_mode IN ('delegated', 'collaborative', 'consultative')),
  reason TEXT NOT NULL,
  triggered_by TEXT NOT NULL CHECK(triggered_by IN ('automatic', 'manual')),
  risk_score REAL,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (task_id) REFERENCES task_accountability(task_id) ON DELETE CASCADE
);

-- Indexes for accountability queries
CREATE INDEX IF NOT EXISTS idx_signoff_receipts_task ON sign_off_receipts(task_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_mode_transitions_task ON ai_mode_transitions(task_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_task_can_proceed ON task_accountability(can_proceed, blocked);
CREATE INDEX IF NOT EXISTS idx_task_slug ON task_accountability(slug);

-- ============================================
-- TEST EXECUTION CACHE
-- Parallel to: Your existing test execution
-- ============================================
CREATE TABLE IF NOT EXISTS test_cache (
  test_id TEXT PRIMARY KEY,
  test_file_path TEXT NOT NULL,
  layer TEXT NOT NULL CHECK(layer IN ('change-specific', 'related', 'full')),
  result TEXT NOT NULL CHECK(result IN ('passed', 'failed', 'skipped')),
  duration_ms INTEGER,
  executed_at INTEGER NOT NULL,

  -- For cache invalidation
  test_code_hash TEXT NOT NULL,        -- SHA-256 of test file
  sut_files_hash TEXT NOT NULL,        -- SHA-256 of files under test
  dependencies TEXT NOT NULL,          -- JSON array of dependency file paths

  -- LRU eviction
  last_used INTEGER NOT NULL,
  expired BOOLEAN DEFAULT 0,

  -- Coverage data
  coverage_lines REAL,
  coverage_branches REAL,
  coverage_functions REAL
);

-- Indexes for test cache
CREATE INDEX IF NOT EXISTS idx_test_cache_layer ON test_cache(layer, last_used);
CREATE INDEX IF NOT EXISTS idx_test_cache_expired ON test_cache(expired, last_used);
CREATE INDEX IF NOT EXISTS idx_test_cache_deps ON test_cache(dependencies);  -- For invalidation lookup

-- ============================================
-- METADATA
-- Track indexing operations
-- ============================================
CREATE TABLE IF NOT EXISTS index_metadata (
  id TEXT PRIMARY KEY,
  index_type TEXT NOT NULL,            -- 'skills', 'governance', 'tasks'
  last_indexed_at INTEGER NOT NULL,
  items_indexed INTEGER NOT NULL,
  index_duration_ms INTEGER,
  status TEXT NOT NULL,                -- 'success', 'failed', 'in_progress'
  error_message TEXT
);

-- Initial metadata records
INSERT OR IGNORE INTO index_metadata (id, index_type, last_indexed_at, items_indexed, status)
VALUES
  ('skills', 'skills', 0, 0, 'pending'),
  ('governance', 'governance', 0, 0, 'pending'),
  ('tasks', 'tasks', 0, 0, 'pending');

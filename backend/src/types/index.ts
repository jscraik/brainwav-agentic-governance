/**
 * Type definitions for AMYGA Governance Backend
 */

// ============================================
// Skill Types
// ============================================

export interface SkillMetadata {
  skillId: string;
  name: string;
  description: string;
  triggers: string[];
  category: string;
  version: string;
  workflowSteps: number;
  filePath: string;
  lastModified: number;
  indexedAt: number;
  hash: string;
  accessCount: number;
  lastAccessed?: number;
}

export interface Skill extends SkillMetadata {
  body: string;
  cached: boolean;
}

export interface SkillSearchResult {
  skillId: string;
  name: string;
  description: string;
  triggers: string[];
  category: string;
  rank?: number;
}

// ============================================
// Governance Types
// ============================================

export interface GovernanceDocument {
  docName: string;
  path: string;
  sha256: string;
  requiredTokens: string[];
  class: 'normative' | 'informative' | 'infra';
  precedence: number;
}

export interface ValidationResult {
  valid: boolean;
  actualHash?: string;
  expectedHash?: string;
  drifted?: boolean;
  path?: string;
  error?: string;
}

export interface DriftedDocument {
  docName: string;
  path: string;
  expectedHash: string;
  actualHash: string;
  canAutoFix: boolean;
}

export interface DriftReport {
  hasDrift: boolean;
  driftedDocuments: DriftedDocument[];
  totalDocuments: number;
  checkedAt: number;
}

export interface ValidationReport {
  valid: boolean;
  totalDocuments: number;
  validDocuments: number;
  invalidDocuments: number;
  results: ValidationResult[];
  validatedAt: number;
}

// ============================================
// Accountability Types
// ============================================

export type Perspective = 'product' | 'dev' | 'qa' | 'aiAgent';
export type SignOffStatus = 'pending' | 'approved' | 'deferred' | 'vetoed';
export type AIMode = 'delegated' | 'collaborative' | 'consultative';

export interface PerspectiveStatus {
  status: SignOffStatus;
  signedBy?: string;
  signedAt?: number;
  notes?: string;
  vetoReason?: string;
}

export interface AIStatus extends PerspectiveStatus {
  perspective: 'aiAgent';
  mode: AIMode;
  confidence?: number;
}

export interface FourPerspectives {
  product: PerspectiveStatus;
  dev: PerspectiveStatus;
  qa: PerspectiveStatus;
  aiAgent: AIStatus;
}

export interface TaskAccountability {
  taskId: string;
  slug: string;
  perspectives: FourPerspectives;
  riskScore: number;
  canProceed: boolean;
  blocked: boolean;
  blockedBy?: Perspective;
  blockedReason?: string;
  createdAt: number;
  completedAt?: number;
  lastUpdated: number;
}

export interface SignOffReceipt {
  taskId: string;
  perspective: Perspective;
  decision: SignOffStatus;
  signedBy: string;
  timestamp: number;
  notes?: string;
}

export interface AIModeTransition {
  taskId: string;
  from: AIMode;
  to: AIMode;
  reason: string;
  triggeredBy: 'automatic' | 'manual';
  riskScore?: number;
  timestamp: number;
}

// ============================================
// Task Types (from run-manifest.json)
// ============================================

export interface TaskManifest {
  taskId: string;
  slug: string;
  tier: string;
  arc: string;
  gates: TaskGate[];
  evidenceTriplet: {
    tests: string;
    contract: string;
    review: string;
  };
}

export interface TaskGate {
  gate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp?: number;
}

// ============================================
// API Types
// ============================================

export interface APIResponse<T = any> {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
  errors?: APIError[];
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    hasMore: boolean;
  };
}

// ============================================
// Index Types
// ============================================

export interface IndexResult {
  indexed: number;
  skipped: number;
  total: number;
  duration: number;
}

export interface IndexMetadata {
  id: string;
  indexType: 'skills' | 'governance' | 'tasks';
  lastIndexedAt: number;
  itemsIndexed: number;
  indexDuration: number;
  status: 'success' | 'failed' | 'in_progress';
  errorMessage?: string;
}

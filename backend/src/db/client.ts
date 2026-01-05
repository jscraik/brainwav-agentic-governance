/**
 * Database client for AMYGA Governance Backend
 * Provides a singleton instance with connection pooling
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { mkdirSync } from 'fs';

export interface DatabaseConfig {
  path?: string;
  verbose?: boolean;
}

let dbInstance: Database.Database | null = null;

/**
 * Get or create database instance
 */
export function getDatabase(config: DatabaseConfig = {}): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = config.path || join(process.cwd(), 'backend/data/governance.db');

  // Ensure data directory exists
  mkdirSync(dirname(dbPath), { recursive: true });

  dbInstance = new Database(dbPath, {
    verbose: config.verbose ? console.log : undefined
  });

  // Enable WAL mode for better performance
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  return dbInstance;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Run a transaction
 */
export function transaction<T>(
  fn: (db: Database.Database) => T
): T {
  const db = getDatabase();
  return db.transaction(fn)(db);
}

/**
 * Health check for database
 */
export function healthCheck(): { healthy: boolean; error?: string } {
  try {
    const db = getDatabase();
    db.prepare('SELECT 1').get();
    return { healthy: true };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Database Migration Script
 * Creates and initializes the governance acceleration layer database
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { getDatabase } from './client.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = getDatabase();

console.log('🔄 Running database migrations...\n');

// Read and execute schema
const schemaPath = join(__dirname, 'schema.sql');
const schema = readFileSync(schemaPath, 'utf-8');

// Enable foreign keys and WAL mode
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Execute the entire schema at once (better-sqlite3 handles multi-statement)
try {
  db.exec(schema);
} catch (error) {
  console.error('❌ Error executing schema:', error);
  process.exit(1);
}

console.log('✅ Database schema created successfully\n');
console.log('📊 Tables created:');
console.log('   • skills_index - Skills from .claude/skills/');
console.log('   • skills_fts - Full-text search index');
console.log('   • governance_cache - Governance document hashes');
console.log('   • governance_precedence - Document precedence order');
console.log('   • task_accountability - Four-perspective sign-offs');
console.log('   • sign_off_receipts - Sign-off audit trail');
console.log('   • ai_mode_transitions - AI mode change history');
console.log('   • test_cache - Test execution cache');
console.log('   • index_metadata - Index operation metadata\n');

console.log('📍 Database location: ', join(process.cwd(), 'data/governance.db'));
console.log('\n💡 Next steps:');
console.log('   1. Start the server: pnpm run dev');
console.log('   2. Index skills: POST http://localhost:3000/api/v1/index/skills');
console.log('   3. Index governance: POST http://localhost:3000/api/v1/index/governance\n');

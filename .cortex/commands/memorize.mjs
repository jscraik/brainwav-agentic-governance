// .cortex/commands/memorize.mjs
/**
 * @fileoverview Memory storage script with basic recall integration.
 * Allows storing, updating, and recalling memories via the Memory API.
 * For comprehensive memory recall capabilities, see: /.cortex/commands/recall.md
 *
 * Environment Variables:
 * - TASK_SLUG: The unique identifier for the task (or passed as argv[2]).
 * - HOME/USERPROFILE: Used to locate the .Cortex-OS directory.
 * - MEM_MODE: 'new' or 'update' (defaults based on existence of memory-ids.json).
 * - LOCAL_MEMORY_BASE_URL: Base URL for the Memory API (default: http://localhost:3002/api/v1).
 * - LOCAL_MEMORY_API_KEY: Optional API key for authentication.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const slug = process.env.TASK_SLUG ?? process.argv[2];
if (!slug) {
	console.error('[brAInwav] Missing TASK_SLUG. Pass via env or argv.');
	process.exitCode = 1;
	process.exit();
}

const homeDir = process.env.HOME ?? process.env.USERPROFILE;
if (!homeDir) {
	console.error('[brAInwav] Unable to resolve HOME directory.');
	process.exitCode = 1;
	process.exit();
}

const taskDir = path.join(homeDir, '.Cortex-OS', 'tasks', slug);
const idsPath = path.join(taskDir, 'json', 'memory-ids.json');
const outDir = path.join(taskDir, 'logs', 'memorize');
fs.mkdirSync(outDir, { recursive: true });

const hasId = fs.existsSync(idsPath);
const mode = process.env.MEM_MODE ?? (hasId ? 'update' : 'new');
const tag = `topic_context_${new Date().getUTCFullYear()}`;

// Memory API configuration
const MEMORY_API_BASE = process.env.LOCAL_MEMORY_BASE_URL || 'http://localhost:3002/api/v1';
const MEMORY_API_KEY = process.env.LOCAL_MEMORY_API_KEY;

/**
 * Returns the current timestamp in ISO 8601 format, with milliseconds removed.
 *
 * @returns {string} The formatted timestamp string (e.g., "2023-10-27T10:00:00Z").
 */
function now() {
	return new Date().toISOString().replace(/\.\d+Z$/, 'Z');
}

/**
 * Makes an HTTP request to the Memory API.
 *
 * @param {string} endpoint - The API endpoint suffix (e.g., 'memories').
 * @param {object} [data] - The payload to send (for POST/PUT requests).
 * @param {string} [method='POST'] - The HTTP method to use (GET, POST, PUT, etc.).
 * @returns {Promise<object|null>} The JSON response from the API, or null if the request failed.
 */
async function callMemoryAPI(endpoint, data, method = 'POST') {
	try {
		const response = await fetch(`${MEMORY_API_BASE}/${endpoint}`, {
			method,
			headers: {
				'Content-Type': 'application/json',
				Authorization: MEMORY_API_KEY ? `Bearer ${MEMORY_API_KEY}` : undefined,
			},
			body: method !== 'GET' ? JSON.stringify(data) : undefined,
		});

		if (!response.ok) {
			console.warn(`[brAInwav] API call failed: ${response.status} ${response.statusText}`);
			return null;
		}

		return await response.json();
	} catch (error) {
		console.warn(`[brAInwav] API error: ${error.message}`);
		return null;
	}
}

/**
 * Stores a new memory entry in the system.
 *
 * @param {string} content - The text content of the memory.
 * @param {object} [metadata={}] - Additional metadata for the memory.
 * @param {string[]} [metadata.tags] - Optional tags to append to standard tags.
 * @returns {Promise<object|null>} The API response from the storage operation.
 */
async function storeMemory(content, metadata = {}) {
	const payload = {
		content,
		domain: 'governance',
		importance: 7,
		source: 'memorize-command',
		tags: ['governance', 'task-memory', slug || 'unknown', ...(metadata.tags || [])],
	};

	return await callMemoryAPI('memories', payload);
}

/**
 * Updates an existing memory entry.
 *
 * @param {string} memoryId - The ID of the memory to update.
 * @param {string} content - The new text content for the memory.
 * @param {object} [metadata={}] - Additional metadata for the update.
 * @param {string[]} [metadata.tags] - Optional tags to append to standard tags.
 * @returns {Promise<object|null>} The API response from the update operation.
 */
async function updateMemory(memoryId, content, metadata = {}) {
	const payload = {
		content,
		importance: 7,
		tags: ['governance', 'task-memory', slug || 'unknown', ...(metadata.tags || [])],
	};

	return await callMemoryAPI(`memories/${memoryId}`, payload, 'PUT');
}

/**
 * Recalls memories relevant to a query.
 *
 * @param {string} query - The search query string.
 * @param {number} [limit=5] - The maximum number of memories to retrieve.
 * @returns {Promise<Array<object>>} An array of recalled memory objects.
 */
async function recallMemories(query, limit = 5) {
	// Basic recall functionality for memorize command
	// For comprehensive recall capabilities, use the /recall command (see /.cortex/commands/recall.md)
	try {
		const searchParams = new URLSearchParams({
			query,
			limit: limit.toString(),
			domain: 'governance',
		});

		const response = await fetch(`${MEMORY_API_BASE}/memories/search?${searchParams}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: MEMORY_API_KEY ? `Bearer ${MEMORY_API_KEY}` : undefined,
			},
		});

		if (!response.ok) {
			console.warn(`[brAInwav] Memory recall failed: ${response.status} ${response.statusText}`);
			return [];
		}

		const result = await response.json();
		return result.data || [];
	} catch (error) {
		console.warn(`[brAInwav] Memory recall error: ${error.message}`);
		return [];
	}
}

/**
 * Main execution function.
 * Orchestrates the flow of recalling context, determining mode (new/update),
 * storing/updating memory, and writing the result to a Markdown file.
 *
 * @returns {Promise<void>}
 */
async function main() {
	let retrieval;
	const ids = hasId ? JSON.parse(fs.readFileSync(idsPath, 'utf8')) : {};

	// Recall relevant governance memories before storing/updating
	// Note: For advanced recall capabilities, use the dedicated /recall command (/.cortex/commands/recall.md)
	console.log(`[brAInwav] Recalling governance memories for task: ${slug}`);
	const recalledMemories = await recallMemories(`task governance ${slug} vibe-check decision`, 3);
	const contextMemories = await recallMemories('governance workflow pattern decision', 2);

	const allRecalledMemories = [...recalledMemories, ...contextMemories];
	const relevantContext = allRecalledMemories
		.map((mem) => `- ${mem.id}: ${mem.content?.substring(0, 100)}...`)
		.join('\n');
	const recalledMemoryIds = allRecalledMemories.map((mem) => mem.id);

	if (mode === 'new') {
		const content = `Governance task: ${slug}
Mode: ${mode}
Timestamp: ${now()}
Tag: ${tag}

## Recalled Context
${relevantContext || 'No relevant memories found'}

## Current Session
Fresh governance session initiated for task ${slug}`;
		const result = await storeMemory(content, {
			tags: ['context-aware', 'recalled-memories'],
			related_memory_ids: recalledMemoryIds,
		});
		const id = result?.data?.id || `fallback-${Date.now()}`;

		retrieval = {
			status: 'created',
			memory_id: id,
			tag,
			importance: 7,
			domain: 'governance',
			summary: `Task ${slug} governance context`,
			recalled_memories_count: allRecalledMemories.length,
			recalled_memory_ids: recalledMemoryIds,
			api_result: result?.success ? 'success' : 'fallback',
		};

		ids.primary = retrieval.memory_id;
		fs.mkdirSync(path.dirname(idsPath), { recursive: true });
		fs.writeFileSync(idsPath, `${JSON.stringify(ids, null, 2)}\n`);
	} else {
		const id = ids.primary;
		if (!id) {
			throw new Error('No memory id to update; run with MEM_MODE=new once.');
		}

		const content = `Updated governance task: ${slug}
Mode: ${mode}
Timestamp: ${now()}
Tag: ${tag}

## Recalled Context (Update)
${relevantContext || 'No relevant memories found'}

## Session Update
Governance context updated for task ${slug}`;
		const result = await updateMemory(id, content, {
			tags: ['context-aware', 'recalled-memories', 'updated'],
			related_memory_ids: recalledMemoryIds,
		});

		retrieval = {
			status: 'updated',
			memory_id: id,
			tag,
			originally_created: now(),
			updated: now(),
			recalled_memories_count: allRecalledMemories.length,
			recalled_memory_ids: recalledMemoryIds,
			changes: [
				{
					section: 'Conversation Evolution',
					change: 'updated governance context with recalled memories',
				},
			],
			api_result: result?.success ? 'success' : 'fallback',
		};
	}

	const md = `## Memory ${retrieval.status === 'created' ? 'Saved' : 'Updated'}

**Retrieval Information (JSON)**

\`\`\`json
${JSON.stringify(retrieval, null, 2)}
\`\`\`

## VerificationSummary
- Mode: ${mode}
- Tag: ${tag}
- Brand: brAInwav
- Timestamp: ${now()}
- Recalled: ${retrieval.recalled_memories_count || 0} memories
- API Success: ${retrieval.api_result || 'fallback'}
`;

	const outfile = path.join(outDir, `${now()}-${mode}.md`);
	fs.writeFileSync(outfile, `${md}\n`);
	console.log(`[brAInwav] MEMORY_PARITY:OK file=${outfile}`);
}

main().catch((error) => {
	console.error(`[brAInwav] MEMORY_PARITY:ERROR ${error.message}`);
	process.exitCode = 1;
});

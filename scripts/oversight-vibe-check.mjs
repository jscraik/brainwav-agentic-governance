#!/usr/bin/env node
/**
 * Legacy shim for oversight:vibe-check.
 * Prefer scripts/oversight-aegis-check.mjs.
 */
import main from './oversight-aegis-check.mjs';

console.warn('[brAInwav] oversight:vibe-check is deprecated; use oversight:aegis-check');

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('oversight-vibe-check.mjs')) {
	main();
}

export default main;

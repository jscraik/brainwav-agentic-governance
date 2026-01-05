import fs from 'node:fs';
import path from 'node:path';

/**
 * Ensure a directory exists.
 * @param {string} dir - Directory path.
 * @returns {void}
 */
export function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

/**
 * Write file contents, creating parent directories if needed.
 * @param {string} filePath - Target file path.
 * @param {string} content - File content.
 * @returns {void}
 */
export function writeFile(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}

/**
 * Write file contents if the file does not already exist.
 * @param {string} filePath - File path.
 * @param {string} content - File contents.
 * @returns {void}
 */
export function writeIfMissing(filePath, content) {
    if (fs.existsSync(filePath)) return;
    writeFile(filePath, content);
}

/**
 * Read JSON file safely, returning null on error or missing file.
 * @param {string|null} filePath - Path to JSON file.
 * @returns {Record<string, unknown>|null} Parsed JSON or null.
 */
export function readJsonFile(filePath) {
    if (!filePath) return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return null;
    }
}

/**
 * Read text file safely, returning null on error or missing file.
 * @param {string|null} filePath - Path to text file.
 * @returns {string|null} File contents or null.
 */
export function readTextFile(filePath) {
    if (!filePath) return null;
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch {
        return null;
    }
}

/**
 * Check if a file exists and is non-empty.
 * @param {string} filePath - Path to check.
 * @returns {boolean} True if file exists and has content.
 */
export function existsNonEmpty(filePath) {
    try {
        const stat = fs.statSync(filePath);
        return stat.isFile() && stat.size > 0;
    } catch {
        return false;
    }
}

/**
 * Copy a file or directory recursively.
 * @param {string} src - Source path.
 * @param {string} dest - Destination path.
 * @returns {void}
 */
export function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src)) {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    }
}

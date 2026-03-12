/**
 * Scan a theme directory for .hbs files, parse translation keys, return a Set of unique keys.
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import { extractTranslationKeys } from "./parse.js";

const DEFAULT_IGNORE = ["node_modules", ".git", "dist"];
const MIN_EXT = ".min.";

/**
 * Check if path should be ignored (directory name or path segment).
 */
function isIgnored(relativePath) {
  const parts = relativePath.split(/[/\\]/);
  for (const part of parts) {
    if (DEFAULT_IGNORE.includes(part)) return true;
    if (part.startsWith(".") && part !== ".hbs") return true;
    if (part.includes(MIN_EXT)) return true;
  }
  return false;
}

/**
 * Recursively find all .hbs files under dir, respecting ignore list.
 * @param {string} root - Absolute root path
 * @param {string} dir - Current directory (absolute)
 * @param {string[]} list - Mutable list of absolute paths
 */
function findHbsFiles(root, dir, list) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const abs = join(dir, e.name);
    const rel = relative(root, abs);
    if (isIgnored(rel)) continue;
    if (e.isDirectory()) {
      findHbsFiles(root, abs, list);
    } else if (e.isFile() && e.name.endsWith(".hbs")) {
      list.push(abs);
    }
  }
}

/**
 * Extract all unique translation keys from a theme directory.
 * @param {string} themeDir - Path to theme root (default: cwd)
 * @returns {Set<string>} Set of unique translation keys
 */
export function extractFromDirectory(themeDir) {
  const root = themeDir;
  const hbsFiles = [];
  findHbsFiles(root, root, hbsFiles);

  const keys = new Set();
  for (const filePath of hbsFiles) {
    const content = readFileSync(filePath, "utf8");
    const fileKeys = extractTranslationKeys(content);
    for (const k of fileKeys) {
      keys.add(k);
    }
  }
  return keys;
}

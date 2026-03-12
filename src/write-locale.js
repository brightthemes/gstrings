/**
 * Build locale object from extracted keys and optional existing file; write locales/en.json.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname } from "path";

/**
 * Build a locale object: key -> value (value = key for new keys, or existing value when merging).
 * @param {Set<string>} keys - Extracted translation keys
 * @param {Record<string, string> | null} existing - Existing key-value map (e.g. from en.json) or null
 * @param {boolean} merge - If true and existing is set, keep existing values for existing keys
 * @returns {Record<string, string>} Sorted key-value object
 */
export function buildLocaleObject(keys, existing = null, merge = true) {
  const out = {};
  const keyList = [...keys];
  for (const key of keyList) {
    if (merge && existing && existing[key] !== undefined) {
      out[key] = existing[key];
    } else {
      out[key] = key;
    }
  }
  return out;
}

/**
 * Read existing JSON locale file if it exists.
 * @param {string} outputPath - Path to locales/en.json
 * @returns {Record<string, string> | null} Parsed object or null if missing/invalid
 */
export function readExistingLocale(outputPath) {
  if (!existsSync(outputPath)) return null;
  try {
    const raw = readFileSync(outputPath, "utf8");
    const data = JSON.parse(raw);
    return typeof data === "object" && data !== null ? data : null;
  } catch {
    return null;
  }
}

/**
 * Write locale object to file (creates parent dir if needed).
 * @param {string} outputPath - Path to output file (e.g. locales/en.json)
 * @param {Record<string, string>} locale - Key-value object
 */
export function writeLocaleFile(outputPath, locale) {
  const dir = dirname(outputPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(outputPath, JSON.stringify(locale, null, 4) + "\n", "utf8");
}

/**
 * Extract translation keys from Handlebars content.
 * Matches {{t "..."}}, {{{t "..."}}}, {{t '...'}}, {{{t '...'}},
 * and subexpressions (t "..." ) and (t '...' ).
 * Returns unique keys (first argument of t only; placeholders like {page} kept as-is).
 */

/**
 * Extract translation keys from a string of .hbs content.
 * @param {string} content - Raw file content
 * @returns {string[]} Array of unique translation keys (may contain duplicates per file; caller can dedupe)
 */
export function extractTranslationKeys(content) {
  const keys = [];
  const seen = new Set();

  function add(key) {
    const trimmed = key.replace(/\\"/g, '"').replace(/\\'/g, "'").trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      keys.push(trimmed);
    }
  }

  // Block form: {{t "..."}} or {{{t "..."}}} — double-quoted
  const blockDouble = /\{\{\{?t\s+"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = blockDouble.exec(content)) !== null) {
    add(m[1]);
  }

  // Block form: {{t '...'}} or {{{t '...'}}} — single-quoted
  const blockSingle = /\{\{\{?t\s+'((?:[^'\\]|\\.)*)'/g;
  while ((m = blockSingle.exec(content)) !== null) {
    add(m[1]);
  }

  // Subexpression: (t "..." ) or (t "..." key=value) — double-quoted
  const subexprDouble = /\(t\s+"((?:[^"\\]|\\.)*)"\s*\)/g;
  while ((m = subexprDouble.exec(content)) !== null) {
    add(m[1]);
  }

  // Subexpression: (t '...' ) or (t '...' key=value) — single-quoted
  const subexprSingle = /\(t\s+'((?:[^'\\]|\\.)*)'\s*\)/g;
  while ((m = subexprSingle.exec(content)) !== null) {
    add(m[1]);
  }

  return keys;
}

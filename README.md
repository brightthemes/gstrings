# gstrings

CLI tool to extract translation strings from Ghost themes. Scans `.hbs` files for the `{{t}}` helper (and subexpressions like `(t "..." )`), collects unique keys, and writes `locales/en.json` in the format expected by [Ghost’s translate helper](https://ghost.org/docs/themes/helpers/translate/).

## Install

- **Global**: `npm install -g gstrings` — then run `gstrings` from any theme directory.
- **Local**: `npm install -D gstrings` — run via `npx gstrings` or a script: `"extract:i18n": "gstrings"`.

Requires Node.js 22+.

## Usage

```bash
gstrings [themeDir]   # themeDir defaults to current directory
```

### Options

| Option | Description |
|--------|-------------|
| `-o, --output <path>` | Output path for the locale JSON (default: `locales/en.json` under the theme dir). |
| `--locale <name>` | Locale name used when output path is inferred (default: `en`). |
| `--merge` | Merge with existing locale file; existing keys keep their values, new keys get value = key (default). |
| `--no-merge` | Replace existing locale file with only the extracted keys (all values = key). |
| `--dry-run` | Print extracted keys and output path; do not write any file. |
| `-q, --quiet` | Minimal output. |

### Examples

```bash
# Extract from current directory, write locales/en.json (merge with existing if present)
gstrings

# Extract from a specific theme path
gstrings /path/to/ghost/content/themes/my-theme

# Write to a custom path
gstrings -o ./locales/en.json

# Replace existing locale file instead of merging
gstrings --no-merge

# See what would be extracted without writing
gstrings --dry-run
```

## What gets extracted

- **Block form**: `{{t "Back"}}`, `{{{t "Subscribe"}}}` — double or triple braces.
- **With placeholders**: `{{t "Page {page} of {pages}" page=currentPage}}` — the key is the first string argument; placeholders like `{page}` or `%` are kept as-is in the key.
- **Subexpressions**: `(t "Send login link")`, `(t 'Sign in')` — e.g. inside `button_text=(t 'Send login link')`.

Only the **first argument** of `{{t}}` or `(t)` is used as the translation key; named parameters are ignored for extraction. Only `.hbs` files are scanned; `node_modules`, `.git`, and `dist` are ignored.

## Output format

The generated `locales/en.json` is a flat JSON object: each key is the extracted string, and the value is the same (English fallback). Keys are sorted alphabetically. Example:

```json
{
    "Back": "Back",
    "Subscribe": "Subscribe",
    "Page {page} of {pages}": "Page {page} of {pages}"
}
```

With `--merge` (default), if `locales/en.json` already exists, existing keys keep their current values and only new keys are added with value = key.

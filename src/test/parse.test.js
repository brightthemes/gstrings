import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { extractTranslationKeys } from "../parse.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "../../test/fixtures");

describe("extractTranslationKeys", () => {
  it("extracts block form {{t \"...\"}} and {{{t \"...\"}}}", () => {
    const content = '{{t "Back"}}\n{{{t "Subscribe"}}}';
    const keys = extractTranslationKeys(content);
    assert.ok(keys.includes("Back"));
    assert.ok(keys.includes("Subscribe"));
    assert.strictEqual(keys.length, 2);
  });

  it("extracts subexpressions (t \"...\" )", () => {
    const content = 'empty=(t "No posts") singular=(t "1 post")';
    const keys = extractTranslationKeys(content);
    assert.ok(keys.includes("No posts"));
    assert.ok(keys.includes("1 post"));
  });

  it("extracts keys with placeholders", () => {
    const content = '{{t "Page {page} of {pages}" page=currentPage}}';
    const keys = extractTranslationKeys(content);
    assert.ok(keys.includes("Page {page} of {pages}"));
  });

  it("extracts from fixture file", () => {
    const path = join(fixturesDir, "sample.hbs");
    const content = readFileSync(path, "utf8");
    const keys = extractTranslationKeys(content);
    assert.ok(keys.includes("Back"));
    assert.ok(keys.includes("Subscribe"));
    assert.ok(keys.includes("Page {page} of {pages}"));
    assert.ok(keys.includes("Sign in"));
    assert.ok(keys.includes("No posts"));
    assert.ok(keys.includes("1 post"));
    assert.ok(keys.includes("% posts"));
  });
});

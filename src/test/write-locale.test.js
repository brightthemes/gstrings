import { describe, it } from "node:test";
import assert from "node:assert";
import {
  buildLocaleObject,
  readExistingLocale,
  writeLocaleFile,
} from "../write-locale.js";
import { readFileSync, mkdirSync, writeFileSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

describe("buildLocaleObject", () => {
  it("sorts keys and uses key as value when no existing", () => {
    const keys = new Set(["Subscribe", "Back"]);
    const out = buildLocaleObject(keys, null, true);
    assert.deepStrictEqual(Object.keys(out), ["Back", "Subscribe"]);
    assert.strictEqual(out.Back, "Back");
    assert.strictEqual(out.Subscribe, "Subscribe");
  });

  it("merges with existing: keeps existing values, adds new with value=key", () => {
    const keys = new Set(["Back", "Subscribe"]);
    const existing = { Back: "Volver" };
    const out = buildLocaleObject(keys, existing, true);
    assert.strictEqual(out.Back, "Volver");
    assert.strictEqual(out.Subscribe, "Subscribe");
  });

  it("replace mode ignores existing values", () => {
    const keys = new Set(["Back"]);
    const existing = { Back: "Volver" };
    const out = buildLocaleObject(keys, existing, false);
    assert.strictEqual(out.Back, "Back");
  });
});

describe("readExistingLocale", () => {
  it("returns null for missing file", () => {
    assert.strictEqual(readExistingLocale("/nonexistent/en.json"), null);
  });

  it("returns null for invalid JSON", () => {
    const dir = join(tmpdir(), randomUUID());
    const file = join(dir, "en.json");
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, "not json", "utf8");
    try {
      assert.strictEqual(readExistingLocale(file), null);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("writeLocaleFile", () => {
  it("creates directory and writes sorted JSON", () => {
    const dir = join(tmpdir(), randomUUID());
    const file = join(dir, "locales", "en.json");
    const locale = { Back: "Back", Subscribe: "Subscribe" };
    try {
      writeLocaleFile(file, locale);
      assert.ok(existsSync(file));
      const raw = readFileSync(file, "utf8");
      const parsed = JSON.parse(raw);
      assert.deepStrictEqual(parsed, locale);
      assert.ok(raw.includes("\n"));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

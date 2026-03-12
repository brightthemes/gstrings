#!/usr/bin/env node

import { resolve } from "path";
import { existsSync, statSync } from "fs";
import { program } from "commander";
import { extractFromDirectory } from "../src/extract.js";
import {
  buildLocaleObject,
  readExistingLocale,
  writeLocaleFile,
} from "../src/write-locale.js";

const DEFAULT_LOCALE = "en";
const DEFAULT_OUTPUT = "locales/en.json";

program
  .name("gstrings")
  .description("Extract translation strings from Ghost theme .hbs files and write locales/en.json")
  .version("0.0.1")
  .argument("[themeDir]", "theme directory to scan (default: current directory)", ".")
  .option("-o, --output <path>", "output path for locale JSON (default: locales/en.json)")
  .option("--locale <name>", "locale name used when output is inferred (default: en)", DEFAULT_LOCALE)
  .option("--merge", "merge with existing locale file, keep existing values (default)", true)
  .option("--no-merge", "replace existing locale file with only extracted keys")
  .option("--dry-run", "print extracted keys and output path, do not write")
  .option("-q, --quiet", "minimal output")
  .action((themeDir, opts) => {
    const root = resolve(process.cwd(), themeDir);
    if (!existsSync(root)) {
      console.error("gstrings: error: path does not exist:", root);
      process.exit(1);
    }
    if (!statSync(root).isDirectory()) {
      console.error("gstrings: error: path is not a directory:", root);
      process.exit(1);
    }

    const outputPath = opts.output ?? resolve(root, `locales/${opts.locale}.json`);
    const merge = opts.merge;
    const dryRun = opts.dryRun ?? false;
    const quiet = opts.quiet ?? false;

    const keys = extractFromDirectory(root);
    const existing = readExistingLocale(outputPath);
    const locale = buildLocaleObject(keys, existing, merge);

    if (dryRun) {
      if (!quiet) {
        console.log("Output path:", outputPath);
        console.log("Extracted keys:", keys.size);
      }
      for (const k of keys) {
        console.log(k);
      }
      return;
    }

    writeLocaleFile(outputPath, locale);

    if (!quiet) {
      console.log(`Found ${keys.size} string(s), wrote ${outputPath}`);
    }
  });

program.parse();

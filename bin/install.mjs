#!/usr/bin/env node
/**
 * Installer for the gen-image Claude Code skill.
 *
 * A "skill" is just a folder containing a SKILL.md. Installing it means copying
 * that folder into a Claude skills directory. This script is the npx delivery
 * mechanism for that copy.
 *
 *   npx @grepinsight/gen-image-skill              # install for the current user (~/.claude/skills)
 *   npx @grepinsight/gen-image-skill --project    # install into ./.claude/skills (this project only)
 *   npx @grepinsight/gen-image-skill --dir <path> # install into a custom skills directory
 *   npx @grepinsight/gen-image-skill --force      # overwrite an existing install
 */

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_NAME = "gen-image";
const here = dirname(fileURLToPath(import.meta.url));
const skillSource = resolve(here, "..", "plugins", SKILL_NAME, "skills", SKILL_NAME);

function die(msg) {
  console.error(`gen-image-skill: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { scope: "user", dir: null, force: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
        break;
      case "--project":
        opts.scope = "project";
        break;
      case "--force":
        opts.force = true;
        break;
      case "--dir":
        opts.dir = argv[++i];
        if (!opts.dir) die("--dir requires a path argument");
        break;
      default:
        die(`unknown argument '${arg}' (try --help)`);
    }
  }
  return opts;
}

function printHelp() {
  console.log(`Install the ${SKILL_NAME} Claude Code skill.

Usage:
  npx @grepinsight/gen-image-skill [options]

Options:
  --project        Install into ./.claude/skills (this project only)
  --dir <path>     Install into a custom skills directory
  --force          Overwrite an existing install
  -h, --help       Show this help

Default target: ~/.claude/skills/${SKILL_NAME}`);
}

function resolveSkillsDir(opts) {
  if (opts.dir) return resolve(opts.dir);
  if (opts.scope === "project") return resolve(process.cwd(), ".claude", "skills");
  return join(homedir(), ".claude", "skills");
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!existsSync(join(skillSource, "SKILL.md"))) {
    die(`could not locate the skill source at '${skillSource}'. This package may be corrupt; reinstall it.`);
  }

  const skillsDir = resolveSkillsDir(opts);
  const dest = join(skillsDir, SKILL_NAME);

  if (existsSync(dest) && !opts.force) {
    die(`'${dest}' already exists. Re-run with --force to overwrite.`);
  }

  mkdirSync(skillsDir, { recursive: true });
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  cpSync(skillSource, dest, { recursive: true });

  console.log(`✓ Installed '${SKILL_NAME}' skill to ${dest}`);
  console.log("");
  console.log("Next steps:");
  console.log("  1. Install the gen-image CLI and put it on your PATH.");
  console.log("  2. Set an API key: GEMINI_API_KEY (or GOOGLE_API_KEY / OPENAI_API_KEY),");
  console.log("     in your environment or in ~/.config/gen-image/.env");
  console.log("  3. Restart Claude Code so it picks up the new skill, then try: /gen-image");
}

main();

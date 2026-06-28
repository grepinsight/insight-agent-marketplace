# CLAUDE

Contributor and agent guide for the **insight** Claude Code plugin marketplace. Read this before adding or editing a plugin.

## What this repo is

A marketplace of small, focused Claude Code plugins. Each plugin wraps one capability (usually a single skill). Plugins are distributed two ways, and **both must keep working**:

1. **Plugin marketplace**: `/plugin install <name>@insight`
2. **npx skill installer**: `npx @grepinsight/<name>-skill`

## Layout

```
.claude-plugin/
  marketplace.json              # marketplace manifest, lists every plugin
package.json                    # npm package, the npx installer entry point
bin/
  install.mjs                   # generic skill installer (copies a skill folder into .claude/skills)
plugins/
  <plugin>/
    .claude-plugin/
      plugin.json               # plugin manifest
    README.md                   # per-plugin docs (format below)
    skills/
      <skill>/
        SKILL.md
        references/             # optional supporting docs
```

The skill folder at `plugins/<plugin>/skills/<skill>/` is the **single source** both channels copy. Don't duplicate skill content elsewhere.

## Adding a plugin, checklist

1. Create `plugins/<name>/.claude-plugin/plugin.json` (`name`, `version`, `description`, `author`, `license`).
2. Put the skill at `plugins/<name>/skills/<name>/SKILL.md` (+ `references/` if needed).
3. Register it in `.claude-plugin/marketplace.json` under `plugins[]` (`name`, `source`, `description`, `version`).
4. Write `plugins/<name>/README.md` per the format below.
5. If the skill should be npx-installable, make sure `package.json` `files[]` includes its skill path, and that `bin/install.mjs` can target it (the current installer is single-skill; generalize it if adding a second).
6. Run the sanitization pass (below) before committing.

## Per-plugin README format (required)

Every `plugins/<name>/README.md` MUST have these sections, in this order:

1. `# <plugin> (Claude Code plugin)` title + one-line summary.
2. `## What you get` — what the skill does and example trigger phrases.
3. `## Prerequisites` — any external CLI/tool/API key the skill shells out to. State plainly when an install method (e.g. npx) does **not** install these.
4. `## Configuration` — a table of env vars / config files and their effect (omit only if there are genuinely none).
5. `## Install` — MUST document **both** channels as subsections:
   - `### From the insight marketplace` — `/plugin marketplace add ...` + `/plugin install <name>@insight`
   - `### Via npx (skill only)` — `npx @grepinsight/<name>-skill` with `--project` and `--force` variants, and a note that npx installs the skill but not external prerequisites.
6. `## License`.

**The npx install block is mandatory.** A plugin README without a working `### Via npx (skill only)` subsection is incomplete.

## Sanitization (public-shareable, no exceptions)

This repo is meant to be shared. Before committing any plugin, strip:

- Personal or work identity: no real emails (especially work addresses), no machine hostnames, no home directory absolute paths (`/Users/<you>/...`).
- Hardcoded vault/local paths: make output locations env-configurable (e.g. an env var) with a sane default (a folder beside the target file, or the cwd). Never hardcode a personal vault root.
- Private cross-references: don't reference sibling skills/helpers that only exist in a private setup. A skill here must stand alone or declare its external prerequisites.
- Use the public GitHub handle (`grepinsight`) for attribution, nothing more identifying.

Grep before committing:

```bash
grep -rniE '<work-domain>|/Users/|<your-private-vault-name>|<work-email>' . --include='*.md' --include='*.json'
```

## Conventions

- Commit style: conventional commits (`feat:`, `fix:`, `docs:`), no AI authorship attribution.
- Keep `version` in sync across `plugin.json`, the marketplace entry, and (for npx) `package.json` when a plugin changes.
- Skill frontmatter: `name` (lowercase, kebab-case), `description`, optional `allowed-tools`, `license`. No private/vault-specific metadata fields.

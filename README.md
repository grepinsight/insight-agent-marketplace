# insight, a Claude Code plugin marketplace

A small marketplace of focused [Claude Code](https://docs.claude.com/en/docs/claude-code) plugins.

## Plugins

| Plugin | What it does |
|---|---|
| [`gen-image`](plugins/gen-image) | Generate educational/explanatory images from a text prompt via the `gen-image` CLI and get back ready-to-paste image links. Single or batch. |

## Install

There are two ways to get a plugin from here. Use whichever fits.

### Option A, plugin marketplace (native)

Add this marketplace, then install a plugin from it:

```
/plugin marketplace add grepinsight/insight-claude-marketplace
/plugin install gen-image@insight
```

Or point at a local clone during development:

```
/plugin marketplace add /path/to/insight-claude-marketplace
```

### Option B, npx (install just the skill)

If you don't use the plugin system, install a plugin's skill straight into your Claude skills directory with `npx`. This copies only the `SKILL.md` folder, no plugin registry involved.

```bash
# install for the current user (~/.claude/skills)
npx @grepinsight/gen-image-skill

# install into the current project only (./.claude/skills)
npx @grepinsight/gen-image-skill --project

# overwrite an existing install
npx @grepinsight/gen-image-skill --force
```

After installing either way, restart Claude Code (or reload plugins) so the new skill is picked up. Note the npx route installs the skill, not the underlying `gen-image` CLI, see the plugin's README for prerequisites.

## Layout

```
.claude-plugin/
  marketplace.json          # marketplace manifest, lists the plugins
plugins/
  gen-image/
    .claude-plugin/
      plugin.json           # plugin manifest
    skills/
      gen-image/
        SKILL.md            # the skill
        references/
          prompt-patterns.md
```

## License

MIT. See [LICENSE](LICENSE).

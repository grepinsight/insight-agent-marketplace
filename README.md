# insight, a Claude Code plugin marketplace

A small marketplace of focused [Claude Code](https://docs.claude.com/en/docs/claude-code) plugins.

## Plugins

| Plugin | What it does |
|---|---|
| [`gen-image`](plugins/gen-image) | Generate educational/explanatory images from a text prompt via the `gen-image` CLI and get back ready-to-paste image links. Single or batch. |

## Install

Add this marketplace, then install a plugin from it:

```
/plugin marketplace add grepinsight/insight-claude-marketplace
/plugin install gen-image@insight
```

Or point at a local clone during development:

```
/plugin marketplace add /path/to/insight-claude-marketplace
```

After installing, restart Claude Code (or reload plugins) so the new skill is picked up.

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

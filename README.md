# insight, a cross-agent skill marketplace

A small marketplace of focused agent skills. Each is packaged as a [Claude Code](https://docs.claude.com/en/docs/claude-code) plugin (Claude Code is the primary client), but the same skill installs into any of ~70 supported agents (Codex, Cursor, OpenClaw, Hermes, and more) via [`npx skills`](https://github.com/vercel-labs/skills).

## Plugins

| Plugin | What it does |
|---|---|
| [`gen-image`](plugins/gen-image) | Generate educational/explanatory images from a text prompt via the `gen-image` CLI and get back ready-to-paste image links. Single or batch. |

## Install

There are two ways to get a plugin from here. Use whichever fits.

### Option A, Claude Code plugin marketplace (native)

Add this marketplace, then install a plugin from it:

```
/plugin marketplace add grepinsight/insight-agent-marketplace
/plugin install gen-image@insight
```

Or point at a local clone during development:

```
/plugin marketplace add /path/to/insight-agent-marketplace
```

### Option B, `npx skills` (cross-agent, recommended)

This repo is also a [Vercel **skills**](https://github.com/vercel-labs/skills) package. The `skills` CLI installs into any supported agent (Claude Code, Codex, Cursor, OpenClaw, Hermes, and ~70 more), discovering skills straight from the plugin manifests, no extra structure needed.

Install **one plugin at a time** with `-s <skill>` (this is the recommended default, you never need to pull the whole repo):

```bash
# install just the gen-image skill, non-interactive
npx skills add grepinsight/insight-agent-marketplace -s gen-image -y

# preview what's in the repo without installing
npx skills add grepinsight/insight-agent-marketplace --list
```

Other granularities, if you want them:

```bash
# interactive picker (choose which skills to install)
npx skills add grepinsight/insight-agent-marketplace

# every skill in the repo at once (explicit opt-in)
npx skills add grepinsight/insight-agent-marketplace --all
```

`-g` installs globally (user-level) instead of into the current project. After installing, restart your agent so the new skill is picked up. Note: installing the skill does **not** install the underlying `gen-image` CLI, see the [plugin's README](plugins/gen-image#prerequisites) for prerequisites.

## Installing for AI agents

To teach an autonomous agent to install this skill into itself, give it the `npx skills` command with an explicit `--agent`. The CLI knows where each agent keeps its skills, so no path-wrangling is required.

```bash
# OpenClaw, global (lands in ~/.openclaw/skills/gen-image)
npx skills add grepinsight/insight-agent-marketplace -s gen-image -a openclaw -g -y --copy

# Hermes, global (lands in ~/.hermes/skills/gen-image)
npx skills add grepinsight/insight-agent-marketplace -s gen-image -a hermes-agent -g -y --copy

# both at once, project-scoped (OpenClaw -> ./skills, Hermes -> ./.hermes/skills)
npx skills add grepinsight/insight-agent-marketplace -s gen-image -a openclaw -a hermes-agent -y --copy
```

| Agent | `--agent` id | Global path | Project path |
|---|---|---|---|
| OpenClaw | `openclaw` | `~/.openclaw/skills/` | `./skills/` |
| Hermes | `hermes-agent` | `~/.hermes/skills/` | `./.hermes/skills/` |

Notes for agents:
- Use `--copy` (not the default symlink) when the agent runs on a host that doesn't share this repo's filesystem, it writes a standalone copy.
- `-y` skips all prompts so the command runs unattended.
- After install, the skill still needs the `gen-image` CLI on `PATH` and an API key (`GEMINI_API_KEY` / `GOOGLE_API_KEY` / `OPENAI_API_KEY`). See the [plugin README](plugins/gen-image#prerequisites).

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

# gen-image (Claude Code plugin)

Generate one or more educational/explanatory images from a text prompt and get back ready-to-paste image links. For explicit, user-requested generation, single or batch.

## What you get

A `gen-image` skill that Claude Code invokes when you say things like:

- `/gen-image a cartoon librarian locking a book in a safe`
- "make me 5 images showing the OAuth flow"
- "generate visuals for this concept"

The skill picks a sensible style, writes good prompts (see `skills/gen-image/references/prompt-patterns.md`), generates in parallel for batches, verifies the outputs, and returns image links ready to paste into a note or doc.

## Prerequisites

This plugin is a thin orchestration layer over a separate CLI named `gen-image` ([grepinsight/gen-image](https://github.com/grepinsight/gen-image)). You need:

1. The `gen-image` CLI on your `PATH` (a wrapper over Google Gemini / OpenAI image models). Install it from [github.com/grepinsight/gen-image](https://github.com/grepinsight/gen-image).
2. An API key, either exported in your environment or stored in `~/.config/gen-image/.env`:

   ```
   GEMINI_API_KEY=...      # or GOOGLE_API_KEY, or OPENAI_API_KEY
   ```

Verify it works:

```bash
gen-image --show-config | grep -E "provider|model"
```

## Configuration

| Env var | Effect |
|---|---|
| `GEN_IMAGE_OUTPUT_DIR` | Where generated images are written. Otherwise an `assets/` folder beside the target note, or the current directory. |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` / `OPENAI_API_KEY` | API credentials for the underlying model. |

The model itself is global CLI config (`gen-image --edit-config`), there is no per-call `--model` flag.

## Install

### From the `insight` marketplace

```
/plugin marketplace add grepinsight/insight-claude-marketplace
/plugin install gen-image@insight
```

### Via `npx skills` (cross-agent)

Install the skill into any supported agent with the [Vercel skills](https://github.com/vercel-labs/skills) CLI. Does **not** install the `gen-image` CLI, see Prerequisites above.

```bash
npx skills add grepinsight/insight-claude-marketplace -s gen-image -y        # current agent + scope
npx skills add grepinsight/insight-claude-marketplace -s gen-image -g -y     # global (user-level)
npx skills add grepinsight/insight-claude-marketplace -s gen-image -a openclaw -g -y --copy   # a specific agent
```

Restart your agent afterward so the skill is picked up. For installing into OpenClaw / Hermes agents, see [Installing for AI agents](../../README.md#installing-for-ai-agents) in the root README.

## License

MIT.

---
name: gen-image
description: "Generate one or more images via the gen-image CLI and return image links ready to paste into notes or docs. For explicit image-generation requests, standalone or batch. Use when the user says '/gen-image', 'generate an image of X', 'make me N images about Y', or 'generate visuals for this'."
license: MIT
allowed-tools:
  - Read
  - Edit
  - Bash
---

# gen-image

Generate standalone images via the `gen-image` CLI. This skill is for **explicit, user-requested generation**, single or batch, and returns image links ready to paste into a note or document.

## Prerequisites

This skill shells out to a CLI called `gen-image`. Install it and set an API key before use:

- The `gen-image` CLI on `PATH` (a typer-based wrapper over Google Gemini / OpenAI image models).
- An API key in the environment or in `~/.config/gen-image/.env` (recognized keys: `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `OPENAI_API_KEY`).

Verify the tool is reachable:

```bash
gen-image --show-config | grep -E "provider|model"
```

If `gen-image` is not found, tell the user to install it and set a key, then stop.

## When to Invoke

- `/gen-image <description>`
- "generate an image of X"
- "make me 5 images showing Y"
- "regenerate the images in this note" (after a model switch)
- "create visuals for this concept"

## Defaults

| Thing | Default | Override |
|---|---|---|
| Output dir | `$GEN_IMAGE_OUTPUT_DIR` if set; else, when bound to a note, an `assets/` folder beside the note; else the current working directory | Ask only when context is genuinely ambiguous |
| Filename slug | `<topic-kebab>-<index>.png` or a descriptive per-image name | User can specify |
| Style | Auto-select from the presets below based on content | `--style <preset>` |
| Model | Active config (`gen-image --show-config`) | `gen-image --edit-config` (global, there is **no** per-call `--model` flag) |
| Parallelism | All in parallel when N>1 | — |

## Model Selection (has a real quality delta)

| Model class | Use when |
|---|---|
| **Gemini "pro image"** | **Data viz / infographics / any image with labels, numbers, or text.** Gemini Pro has the best text rendering by a wide margin. |
| OpenAI `gpt-image` | Photorealistic or painterly subject matter, where text is absent or incidental. |
| Gemini "flash image" | Fast/cheap iterations where quality is secondary. |

Before generating, ask yourself: **"Does this image need legible text/numbers?"** If yes, make sure the active model is a Gemini pro-image model. There is **no per-call `--model` flag**, the model is global config. Verify with `gen-image --show-config` (or `gen-image --list-models`, which marks the active one). If it has been changed, reset via `gen-image --edit-config`.

Check current config once per session:

```bash
gen-image --show-config | grep -E "provider|model"
```

## Style Selection

| Style | Best for |
|---|---|
| `educational-cartoon` (default) | Metaphors, explainers with characters/scenes |
| `diagram-alternative` | Infographics, bar charts, ladders, calendars, data viz |
| `mnemonic` | Language learning, absurd visual puns |
| `first-person` | Immersive POV experiences, "I was there" scenes, scaled perspectives, sensory immersion |
| `manga-strip` | Educational storytelling, 2x4 panel comic narrative, step-by-step walkthroughs |
| `vintage-blueprint` | History of inventions, underlying principles, design rationale, patent-style diagrams |
| `custom` | Only when the user provides a full style spec |

## Prompt Patterns

Always structure prompts with:

1. **Layout direction**: "two-column", "vertical ladder", "7-day calendar strip", "split panel"
2. **Explicit labels/text**: every callout, axis, percentage, caption
3. **Color palette**: name 2-3 colors, e.g. "navy + gold + green"
4. **Style hint at end**: "flat infographic style, clean typography, no photorealism"

Vague prompts produce garbage. See `references/prompt-patterns.md` for reusable templates (split-panel, process flow, analogy mapping, system, problem-viz, data-insight) plus naming and embedding rules.

## Workflow

### Step 1, parse request

Extract from the user's message:

- Number of images (1 or batch)
- Subject / concept
- Target note or doc, if any (so the output dir picks up)
- Any constraints (style, palette, aspect ratio)

If ambiguous, make reasonable assumptions and proceed. Don't ping-pong questions.

### Step 2, pick output dir

Resolve in this order:

```bash
# 1. explicit override
ASSETS="${GEN_IMAGE_OUTPUT_DIR:-}"

# 2. bound to a note: an assets/ folder beside it
#    NOTE="/path/to/My Note.md"
#    ASSETS="$(dirname "$NOTE")/assets"

# 3. fallback: current directory
ASSETS="${ASSETS:-$PWD}"

mkdir -p "$ASSETS"
```

Use a topic prefix so batches stay grouped (e.g. `bonvoy-*.png`, `git-rebase-*.png`).

### Step 3, generate in parallel

For N>1, launch all with `&` and `wait`:

```bash
# $ASSETS comes from Step 2
gen-image "<prompt 1>" --style diagram-alternative -o "$ASSETS/<slug>-1.png" &
P1=$!
gen-image "<prompt 2>" --style diagram-alternative -o "$ASSETS/<slug>-2.png" &
P2=$!
# ... up to N
wait $P1 $P2
ls -la "$ASSETS"/<slug>-*.png
```

Run in the background (e.g. with `run_in_background: true`) so you don't block on the Bash call. Each image is roughly 20-40s.

### Step 4, verify

Gemini may return JPEG despite a `.png` extension. This is harmless (most renderers content-sniff). Check with:

```bash
stat -f '%z bytes  %N' <path>   # 0 bytes = failure (macOS); use `stat -c` on Linux
file <path>                     # should show JPEG or PNG
```

Don't parse `ls -la` columns for byte counts, use `stat`.

### Step 5, return image links

Emit a code block the user can copy. For Obsidian, use wikilink embeds:

```
![[<slug>-1.png]]
![[<slug>-2.png]]
```

For plain Markdown, use relative image links:

```
![](assets/<slug>-1.png)
![](assets/<slug>-2.png)
```

For single images, embed the link inline in the response.

## Cost Awareness

Image models charge per image (roughly $0.01-$0.04 each depending on model). 10 images is on the order of a few tens of cents. Mention the rough total when batching 5 or more.

## Common Gotchas

- **`.png` extension on JPEG files**: the model returns JPEG; the filename is what the user asked for. Harmless for most renderers.
- **0-byte outputs**: the CLI may report success while the file is empty (transient API error or rate limit). Retry the failures individually.
- **Text comes out garbled**: the active model isn't a Gemini pro-image model. There is no per-call `--model` flag, switch the global model with `gen-image --edit-config` (verify with `gen-image --show-config`).
- **Parallel failures**: sometimes one of N fails silently. After `wait`, run `stat` on every output and retry any 0-byte files.
- **Config drift**: the user may have switched models earlier. Confirm with `--show-config` if results look wrong.

## Config Changes

If the user asks to change the default model/provider:

1. Read `~/.config/gen-image/config.toml`
2. Edit it with the `Edit` tool (not `sed`)
3. Confirm with `gen-image --show-config`

## Related

- `references/prompt-patterns.md`: reusable prompt templates, naming, and embedding rules.

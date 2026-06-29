---
name: gen-image
description: "Generate one or more images via the gen-image CLI and return image links ready to paste into notes or docs. For explicit image-generation requests, standalone or batch, AND for turning a transcript (raw or speaker-resolved, e.g. an auto-podcast) into a set of per-topic images. Use when the user says '/gen-image', 'generate an image of X', 'make me N images about Y', 'generate visuals for this', or 'make images for this podcast/transcript/interview'."
license: MIT
allowed-tools:
  - Read
  - Edit
  - Bash
---

# gen-image

Generate standalone images via the `gen-image` CLI. This skill is for **explicit, user-requested generation**, single or batch, and returns image links ready to paste into a note or document.

It does one thing: prompt in, image file(s) out, link returned. It is the generation primitive. Planning an image narrative and embedding it into a specific note is a separate, higher-level workflow that typically *wraps* this skill, not part of it.

## Prerequisites

This skill shells out to a CLI called `gen-image` ([github.com/grepinsight/gen-image](https://github.com/grepinsight/gen-image)). Install it and set an API key before use:

- The `gen-image` CLI on `PATH` (a typer-based wrapper over Google Gemini / OpenAI image models), from [github.com/grepinsight/gen-image](https://github.com/grepinsight/gen-image).
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
- "make images for this podcast / transcript / interview" → see **Transcript Mode** below

## Step 0, Load Skill Config (do this first)

This skill is configurable so it can adapt to a personal note system without hardcoding anyone's paths. Before anything else, look for an optional config file and apply it:

```bash
SKILL_CFG="${GEN_IMAGE_SKILL_CONFIG:-$HOME/.config/gen-image/skill.toml}"
[ -f "$SKILL_CFG" ] && echo "found: $SKILL_CFG" || echo "none (using built-in defaults)"
```

If it exists, `Read` it and let its values override the defaults below. Every key is optional; anything unset falls back to the built-in default. The schema (link format, output resolution, model map, costs, extended reference) is documented in `references/skill-config.md`. **If no config file is present, the built-in defaults make this skill fully functional on their own.**

| Config key | Controls | Built-in default |
|---|---|---|
| `link_format` | Emitted reference style: `wikilink` or `markdown` | `markdown` |
| `output.note_resolver` | Command that resolves a note's output dir | none (use `assets/` beside the note) |
| `output.standalone_dir` | Output dir when not bound to a note | the current working directory |
| `models.*` | Concrete model ids per use-case (see Model Selection) | none (reason by model class) |
| `cost.<model-id>` | Per-image USD cost for the cost note | none (use the generic estimate) |
| `extended_reference` | Path to an extra prompt/style reference to consult | none |

## Defaults

| Thing | Default | Override |
|---|---|---|
| Output dir | `output.note_resolver` if note-bound and configured; else `assets/` beside the note; else `output.standalone_dir`; else cwd | Ask only when context is genuinely ambiguous |
| Filename slug | `<topic-kebab>-<index>.png` or a descriptive per-image name | User can specify |
| Style | Auto-select from the presets below based on content | `--style <preset>` |
| Model | Active config (`gen-image --show-config`) | `gen-image --edit-config` (global, there is **no** per-call `--model` flag) |
| Link format | `config.link_format`, else `markdown` | per request |
| Parallelism | All in parallel when N>1 | — |

## Model Selection (has a real quality delta)

There is **no per-call `--model` flag**, the model is global config. The skill's job is to make sure the *active* model fits the task. If the config provides concrete model ids under `[models]`, prefer those exact ids; otherwise reason by model class.

| Use-case | Config key | Class fallback (no config) |
|---|---|---|
| **Data viz / infographics / any image with labels, numbers, or text** | `models.text_heavy` | a Gemini "pro image" model (best text rendering by a wide margin) |
| Photorealistic or painterly subject, text absent or incidental | `models.photoreal` | an OpenAI `gpt-image` model |
| Fast / cheap iterations, quality secondary | `models.fast_cheap` | a Gemini "flash image" model |
| Cost-sensitive bulk, no text | `models.bulk_no_text` | a smaller/mini image model |

Before generating, ask: **"Does this image need legible text/numbers?"** If yes, make sure the active model is the text-heavy one (`models.text_heavy`, or a Gemini pro-image model). Verify with `gen-image --show-config` (or `gen-image --list-models`, which marks the active one). If it has been changed, reset via `gen-image --edit-config`.

Check current config once per session:

```bash
gen-image --show-config | grep -E "provider|model"
```

## Style Selection

The CLI owns the style catalog (each preset is baked-in prompt engineering). Get the live list, never hardcode it:

```bash
gen-image --list-styles
```

Your job is to map the request to the right preset. Rough heuristic (defer to whatever `--list-styles` actually reports):

- text / labels / numbers / data → the infographic preset (`diagram-alternative`)
- metaphor / explainer with characters → the cartoon preset (`educational-cartoon`, the default)
- language mnemonic / visual pun → `mnemonic`
- "you are there" POV scene → `first-person`
- step-by-step walkthrough → a sequential-panel preset if present (`manga-strip`)
- invention / mechanism / design rationale → a blueprint preset if present (`vintage-blueprint`)
- user supplies a full style spec → `custom`

If the preset you want isn't in `--list-styles`, fall back to `custom` with an inline spec, or add the preset to the CLI. If `extended_reference` is configured (e.g. a style-to-dimension mapping for a personal note system), `Read` it and apply its recipes on top of this heuristic.

## Prompt Patterns

Always structure prompts with:

1. **Layout direction**: "two-column", "vertical ladder", "7-day calendar strip", "split panel"
2. **Explicit labels/text**: every callout, axis, percentage, caption
3. **Color palette**: name 2-3 colors, e.g. "navy + gold + green"
4. **Style hint at end**: "flat infographic style, clean typography, no photorealism"

Vague prompts produce garbage. See `references/prompt-patterns.md` for reusable templates (split-panel, process flow, analogy mapping, system, problem-viz, data-insight, plus the transcript-oriented spectrum-triad / metaphor-mapping / thought-experiment patterns) plus naming and embedding rules.

## Workflow

### Step 1, parse request

Extract from the user's message:

- Number of images (1 or batch)
- Subject / concept
- Target note or doc, if any (so the output dir picks up)
- Any constraints (style, palette, aspect ratio)

If ambiguous, make reasonable assumptions and proceed. Don't ping-pong questions.

### Step 2, pick output dir

Resolve in this order (values from Step 0):

```bash
# 1. note-bound + a resolver is configured: let it compute and return the dir
#    NOTE="/path/to/My Note.md"
#    ASSETS="$("$NOTE_RESOLVER" "$NOTE")"   # NOTE_RESOLVER = config output.note_resolver
#
# 2. note-bound, no resolver: an assets/ folder beside the note
#    ASSETS="$(dirname "$NOTE")/assets"
#
# 3. standalone: configured standalone dir, else cwd
ASSETS="${STANDALONE_DIR:-$PWD}"      # STANDALONE_DIR = config output.standalone_dir

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

Emit a code block the user can copy, in the configured `link_format`.

For `wikilink` (Obsidian):

```
![[<slug>-1.png]]
![[<slug>-2.png]]
```

For `markdown` (default):

```
![](assets/<slug>-1.png)
![](assets/<slug>-2.png)
```

For single images, embed the link inline in the response.

## Transcript Mode (segment → distill → generate)

When the input is a **transcript** rather than a single concept, generation is not one-shot. A transcript carries many distinct ideas, and the goal is one strong image per *idea worth showing*, not one image of "the transcript." This mode wraps the generation primitive above with two planning steps in front of it.

Handles either input shape:

- **Raw transcript**: plain text, no speaker labels.
- **Speaker-resolved transcript**: lines tagged with speakers/timestamps (e.g. `**[02:15] Host A:** ...`), as produced by an auto-podcast / diarization pipeline.

Speaker labels and timestamps are **navigation aids, not segment boundaries**. Strip them when reading for content. Topics are defined by *idea*, not by who is talking, so a topic routinely spans many speaker turns.

### Step T1, Segment into topics

Read the whole transcript, then partition it into **distinct, non-overlapping topics**:

- Each topic is one self-contained idea that would benefit from its *own* image.
- **Merge** scattered turns that circle the same idea into one topic.
- **Drop** pure banter, filler, intros/outros, and "mm-hmm" exchanges, they carry no visual.
- **Score** each topic for *visual density*, how concretely the idea can be shown:
  - **High**, depict immediately: a vivid metaphor, a 2- or 3-way contrast, a thought experiment, a concrete scene, a specific number/ratio.
  - **Medium**, depictable with one concrete handle: an abstract idea that has a single clear visual anchor.
  - **Low**, skip: transitions, restatements, meta-commentary, banter.

Produce a short ordered table (topic, timecode span if present, visual hook, density). This is the artifact the user reviews before any image is generated.

### Step T2, Distill each chosen topic

For each topic you will illustrate, extract the **single most salient frame**, not a summary of everything said:

| Field | What it captures |
|---|---|
| `core_message` | The one sentence the image must make land |
| `the_one_visual` | The concrete scene/metaphor that carries it |
| `labels[]` | Every word that must appear legibly (headers, captions, numbers) |

If a topic has no concrete visual after distillation, it was mis-ranked in T1, drop it rather than forcing a generic illustration.

### Step T3, Select and generate

- **Default: generate for every topic at the visual-density threshold (Medium or above), no fixed count.** The threshold, not a top-N cap, decides how many images you make, so a dense transcript yields many and a thin one yields few. Skip Low topics entirely.
- Because the count is open-ended, **state the topic count and rough cost before generating** when it clears 5 images (see Cost Awareness), and let the user move the bar: "only the strongest" / "High only" raises the threshold, `--top N` caps the count, "all topics" includes Low.
- Map each distilled topic to a template + style (the `gen-image` CLI ships templates tuned for this content, see the table below), then generate via the **Workflow → Step 3** primitive (parallel, verified).
- Return links in transcript order. If the transcript is a note, offer to embed each image above the section it illustrates (per the embedding rules in `references/prompt-patterns.md`).

### Topic shape → template/style

| Topic shape (common in interviews) | CLI template | Style |
|---|---|---|
| 3-point spectrum (fragile/robust/antifragile, low/mid/high) | `spectrum-triad` | `diagram-alternative` |
| One vivid central metaphor (crystal ball, Damocles' sword) | `metaphor-mapping` | `educational-cartoon` |
| "Imagine 100 people..." two-outcome thought experiment | `thought-experiment` | `diagram-alternative` |
| 2-way comparison (X vs Y, before/after) | (inline) split-panel | `diagram-alternative` |
| Step-by-step process / mechanism | (inline) process-flow | `manga-strip` |

These templates require the `gen-image` CLI **≥ 0.6.0**. Verify with `gen-image --list-templates`; if a template is absent, fall back to the inline prompt patterns in `references/prompt-patterns.md` with the same style. Run `gen-image --show-template <name>` to see each template's `--var` slots.

## Cost Awareness

If `[cost]` maps the active model id to a per-image price, use it for an exact total. Otherwise, image models charge per image (roughly $0.01-$0.04 each depending on model), so 10 images is on the order of a few tens of cents. Mention the rough total when batching 5 or more.

## Common Gotchas

- **`.png` extension on JPEG files**: the model returns JPEG; the filename is what the user asked for. Harmless for most renderers.
- **0-byte outputs**: the CLI may report success while the file is empty (transient API error or rate limit). Retry the failures individually.
- **Text comes out garbled**: the active model isn't the text-heavy one. There is no per-call `--model` flag, switch the global model with `gen-image --edit-config` (verify with `gen-image --show-config`).
- **Parallel failures**: sometimes one of N fails silently. After `wait`, run `stat` on every output and retry any 0-byte files.
- **Config drift**: the user may have switched models earlier. Confirm with `--show-config` if results look wrong.

## Config Changes

If the user asks to change the default model/provider:

1. Read `~/.config/gen-image/config.toml` (the CLI's own config)
2. Edit it with the `Edit` tool (not `sed`)
3. Confirm with `gen-image --show-config`

To change this skill's behavior (link format, output dirs, model map), edit the skill config file (`references/skill-config.md` documents every key).

## Related

- `references/skill-config.md`: the optional skill config schema (link format, output, models, cost, extended reference).
- `references/prompt-patterns.md`: reusable prompt templates, naming, and embedding rules.

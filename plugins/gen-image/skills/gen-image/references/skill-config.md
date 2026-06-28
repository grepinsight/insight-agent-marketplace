# gen-image skill config

The skill reads an **optional** TOML file so it can adapt to a personal note system without hardcoding paths. The plugin works with sane defaults when this file is absent; the config only adds parity with a richer local setup.

## Location

Resolved in this order:

1. `$GEN_IMAGE_SKILL_CONFIG` (explicit path override)
2. `~/.config/gen-image/skill.toml`

This is **separate** from the `gen-image` CLI's own `~/.config/gen-image/config.toml` (which holds the active provider/model). This file configures the *skill's* behavior around the CLI.

## Schema

Every key is optional. Unset keys fall back to the built-in default.

```toml
# How emitted image references are formatted: "wikilink" (Obsidian ![[x.png]]) or "markdown" (![](path))
# Default: "markdown"
link_format = "markdown"

[output]
# Optional command to resolve the output dir for a NOTE-bound generation.
# Invoked as:  <note_resolver> "<note-path>"   and must print the absolute output dir on stdout.
# Use this to colocate images with their note, route into an attachments/ folder, etc.
# Default: unset → use an `assets/` folder beside the note.
note_resolver = ""

# Fallback dir for STANDALONE generation (no target note).
# Default: unset → the current working directory.
standalone_dir = ""

[models]
# Concrete model ids for the active gen-image CLI, mapped to use-cases.
# The skill uses these to (a) verify the active model fits the task and (b) advise a switch.
# Leave unset to let the skill reason by model *class* instead.
text_heavy   = ""   # data viz / infographics / labels / numbers  (best text rendering)
photoreal    = ""   # photorealistic or painterly, text absent
fast_cheap   = ""   # quick iterations, quality secondary
bulk_no_text = ""   # cost-sensitive bulk, no text
default      = ""   # the model you keep active by default

[cost]
# Per-image USD cost keyed by model id, for an exact cost-awareness note.
# Example:
# "gemini-3-pro-image-preview"     = 0.04
# "gpt-image-1.5"                  = 0.04
# "gemini-3.1-flash-image-preview" = 0.01

[routing]
# Sibling skills to defer to (the "when NOT to use this skill" map). All optional.
note_embed = ""   # skill that adds images INTO a specific note (creation or enrichment)
web_photos = ""   # skill that finds real web photos / screenshots
migrate    = ""   # skill that consolidates pre-existing scattered images for a note

# Optional path to an extended prompt/style reference the skill should consult,
# e.g. a style-to-dimension mapping for your own note system.
extended_reference = ""
```

## Behavior summary

| Key | When set | When unset (default) |
|---|---|---|
| `link_format` | Emit that reference style | `markdown` |
| `output.note_resolver` | Run it to get the note's output dir | `assets/` beside the note |
| `output.standalone_dir` | Output here when not note-bound | current working directory |
| `models.*` | Prefer these exact model ids | Reason by model class |
| `cost.<id>` | Exact per-image total | Generic $0.01–$0.04 estimate |
| `routing.*` | Defer matching requests to that skill | Handle the request here |
| `extended_reference` | `Read` and apply its recipes | Use only the built-in style table |

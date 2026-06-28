---
name: gen-suno
description: "Turn a concept, note, theme, or prerequisite chain into Suno-ready song lyrics AND generate the audio by running the `gen-suno` CLI (browser-in-the-loop, zero human interaction, writes the track URLs back into each note). Two modes: (A) general, one or a few standalone songs about any topic, mood, or note; (B) learning, a CHAINED prerequisite album engineered for memorization, each track teaching one node of a dependency graph with the formula in a clearly-enunciated chorus. Lyrics and the Suno style box are tuned for intelligibility (clear pronunciation is the whole point of a learning song). Use when the user says 'make a song about X', 'make songs to memorize X', 'turn this note into a Suno song', 'song cycle for X', or 'generate a Suno song'."
license: MIT
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# gen-suno

Write Suno-ready song lyrics **and** generate the actual audio. You ask for a song (or an album), the skill composes the lyrics in Suno's song-note format, then runs the `gen-suno` CLI to drive a logged-in browser and write each track's hosted audio URLs back into its note. Lyrics-first, audio by default, no copy-paste into the Suno web UI.

> Two outputs, one skill: a folder of copy-pasteable lyric notes **and** the generated tracks.

## Prerequisites

This skill shells out to a CLI called `gen-suno` ([github.com/grepinsight/gen-suno](https://github.com/grepinsight/gen-suno)). Installing this skill does **not** install the CLI. Before use you need:

- The `gen-suno` CLI on `PATH` (install it as a persistent tool, for example `uv tool install .` from the repo; do not run it through an ephemeral `uvx`/`uv run --with`, which re-resolves every run).
- A Suno account with available credits.
- A one-time interactive login so the browser session persists: `gen-suno login` (opens a real Chrome on a machine with a display; sign in once).

Verify the session is healthy (use this as a preflight):

```bash
gen-suno doctor          # "✓ session alive · N credits", or exits non-zero if dead
```

If `gen-suno` is not found or the session is dead, tell the user to install/log in, then stop. Do not loop.

## Two modes

| Mode | Use when | Shape |
|---|---|---|
| **A. General** (default) | "make a song about X", a single concept/note/mood, a tribute, a jingle, a vibe | 1..N **standalone** tracks. No forced dependency graph. |
| **B. Learning curriculum** | "make songs to memorize X", a multi-concept topic the user wants to internalize front-to-back | A **chained prerequisite album**: one track per graph node, ordered so each leans only on earlier tracks, with a spine refrain encoding the chain. |

Route by intent. If the user names one thing or wants a vibe, do Mode A. If they want to *memorize* a topic that decomposes into prerequisites, do Mode B. When the candidate concepts do **not** form a chain (orphans, no shared dependencies), don't fabricate a graph: offer **standalone singles** (Mode A with N tracks) instead.

## The pipeline (end to end)

```
gen-suno song request
  └─ 1. resolve input (topic / note / concept list / chain)
     └─ 2. write lyrics → album folder           (Mode A or B)
        └─ 3. gen-suno doctor        (session alive? credits?)
           └─ 4. gen-suno gen --dry-run   (plan + cost, spends nothing)
              └─ 5. CONFIRM cost → gen-suno gen   (drives browser, writes audio URLs)
                 └─ 6. report tracks
```

Steps 1 and 2 are the lyric craft (below). Steps 3 to 6 are the CLI. The CLI step **spends real Suno credits**, so it is gated on a cost confirmation unless the user opted in (see Generation).

## Enunciation first (the reason a learning song works)

**A learning song only teaches if the words come through.** Suno buries vocals by default in lots of genres, and smeared consonants make a memorization track useless. So for any learning/Mode-B song (and any Mode-A song whose *words* matter), push every lever toward intelligibility. This is load-bearing, not decoration.

**Style-box levers** (put these in `suno_style`):
- Add clarity descriptors: `clear enunciation`, `intelligible articulate vocals`, `crisp consonants`, `vocals up front in the mix`, `studio-clean lead vocal`, `clear diction`.
- Kill smear: `dry vocal`, `minimal reverb`, `no vocal effects`. Reverb and delay are the number-one consonant-killers.
- Moderate tempo: **70–95 bpm** sung, **≤100 bpm** rapped. State the bpm explicitly. Fast tempo slurs words.
- **Single** lead vocal on the payload. Stacked harmonies and choirs blur the lyric; save them for non-payload sections.
- **Avoid** clarity-killing descriptors for learning songs: heavy distortion, screamo, shoegaze/wall-of-sound, lo-fi/mumble, double-time trap, whisper, heavy autotune.

**Lyric-box levers**:
- Put the payload (the formula/definition/punchline) in a **sung, slow, repeated chorus**, not a fast rapped line.
- Use `[spoken]` / `[spoken word]` for the single most critical line (a clean definition). Spoken is maximally intelligible.
- One idea per line, **end-stopped**. Never enjamb a definition across a bar break.
- Spell formulas and symbols phonetically (see craft rule 2) and avoid consonant-cluster tongue-twisters.
- Drop `[clearly]` / `[enunciated]` inline hints right before key lines.

**Default learning style string** (clarity baked in, override per material):

```
nerdcore hip-hop, boom-bap beat, 85 bpm, single confident male rapper, melodic SUNG hook, clear enunciation, intelligible articulate vocals up front, dry lead vocal, minimal reverb, crisp consonants, clear diction
```

For a Mode-A vibe song where the *words don't need to be studied* (a mood piece, ambient, a tribute), relax these. Intelligibility is a learning constraint, not a universal one.

## Mode A: general song(s)

1. **Resolve the subject.** A concept, a note, a mood, a person, an inside joke. If a note is named, mine its core line(s) for the hook.
2. **Pick genre + style box.** Default to whatever fits the subject. If the words are meant to be *learned*, apply the enunciation levers above; if it's a vibe, optimize for feel.
3. **Write 1..N tracks.** One is the default. For "a few songs about X", write standalone tracks (no spine refrain, no forced order).
4. **Each track** follows the song-file contract below (frontmatter `suno_style` + a fenced ` ```lyrics ` block). Aim for ~3 minutes of lyric per track (see length target).
5. **Write the album folder**, then go to Generation.

## Mode B: learning curriculum (chained album)

This is the memorization power feature. The method is the load-bearing part.

### B1: build the prerequisite graph

List the concepts. Draw the dependency graph: an edge `A → B` means "you must understand A before B makes sense." **Topologically sort** it. That sort *is* the track order. Render the graph as an ASCII diagram for the README.

If the user gave a single note/concept, decompose it into prerequisites first: walk UP the chain by asking, for each concept, "what must be understood before this makes sense?" until you reach foundational ideas. One song per prerequisite plus a capstone song for the target.

### B2: choose the genre (default nerdcore, clarity-tuned)

Default to **nerdcore hip-hop** with the clarity levers baked in (rapped verses cram definitions; the sung hook carries the payload). Keep ONE coherent style across the whole album so it reads as one artist / one record, and reuse the same Suno persona/voice seed across tracks. Override by material:
- **Anthemic indie-folk**: principles/heuristics with one big singable claim.
- **Synthwave / cinematic**: geometric or spatial concepts (projections, phase spaces).
- **Trap (moderate, not double-time)**: aggressive, punchy procedural steps ("invert it", "kill the term"). Keep the bpm down so the words survive.

### B3: write the spine refrain (the chain encoder)

Compose ONE short refrain whose lines name the pipeline stages **in order**. Fragments appear in every song's intro/outro as connective tissue; the full refrain closes the final track. This is what makes listening in sequence rehearse the graph.

> Example (a variance-estimation cycle): *"From the form to the trace to the room / the expectation breaks in two / C times sigma, invert it through / that's how the variance comes to you."* Each line is one earlier song, in dependency order.

### B4: write each song (one per graph node)

One file per node, `NN - Title.md`, in the song-file contract below. The header carries the real notation; the lyrics spell it phonetically.

### B5: the five craft rules (non-negotiable)

1. **Payload in the chorus.** The chorus carries the actual formula or one-sentence punchline. It's the thing they'll remember at 3am, so make it the payload, not filler. Sing it slow, repeat it.
2. **Spell formulas phonetically in the lyrics.** Suno reads text literally: write `y prime A y`, not `y'Ay`; `sigma-squared`, not `σ²`; `C-inverse times S-S`, not `C⁻¹·SS`. Keep the *real* notation in the header only.
3. **One analogy per song.** A single systems/engineering metaphor, threaded through verse and chorus. Multiple analogies dilute the earworm.
4. **Spine refrain encodes the graph.** Each song echoes its position's fragment of the spine refrain, so sequence equals curriculum.
5. **Chain order is generation order.** Generate tracks 1→N in order so later choruses land as callbacks the listener already knows.

(Mode A reuses rules 1 to 3; rules 4 and 5 are Mode-B only.)

## Song-file contract (what the CLI reads)

`gen-suno` operates on a folder of `NN - title.md` files (the CLI matches a leading number followed by a hyphen or em-dash; a plain hyphen is fine). Each needs a **style** and a **lyrics block**. Use the structured shape:

````markdown
---
suno_style: "nerdcore hip-hop, boom-bap, 85 bpm, single male rapper, melodic SUNG hook, clear enunciation, dry vocal, minimal reverb, crisp consonants"
suno_status: pending
---
# 01 - Quadratic Form

**Teaches:** y'Ay is a scalar. **Depends on:** none.  **Real form:** `y'Ay ∈ ℝ`
**Analogy:** A is the bread, y the filling. Press the sandwich, one number drips out.

```lyrics
[Intro]
[spoken] y prime, A, y. One number. Watch.
[Verse 1]
Take a column of data, call the vector y...
[Chorus]
[clearly] y prime A y, squeeze it to a scalar...
[Verse 2]
...
[Chorus]
[clearly] y prime A y, squeeze it to a scalar...
[Bridge]
...
[Chorus]
[clearly] y prime A y, squeeze it to a scalar...
[Outro]
```
````

The pieces, in order:

1. **Frontmatter**: `suno_style` (the style box verbatim, clarity levers folded in) plus `suno_status: pending`. The CLI fills `suno_urls` / `suno_clip_ids` / `suno_status: done` / `suno_generated_at` after it runs.
2. **Header**: concept name, **what it teaches**, **depends on**, the **real formula/statement** in proper notation (header only, never in the sung lyrics).
3. **One core analogy**: a single systems/engineering metaphor, stated before the lyrics.
4. **The ` ```lyrics ` block**: Suno section tags `[Intro]` `[Verse]` `[Pre-Chorus]` `[Chorus]` `[Bridge]` `[Outro]` plus intelligibility hints `[spoken]` `[clearly]` `[enunciated]` `[sung]`. Formulas spelled phonetically.

`gen-suno` also accepts a "loose" shape (a `[Style: ...]` line plus a tagged fenced block) but prefer the structured shape so the lyric note is self-documenting. A file missing either a style or a lyrics block **fails loudly before any credits are spent**.

**Length target: each track ≈ 3 minutes.** Suno's track length follows lyric quantity, so a thin lyric produces a ~1-min stub. Fill ~3 min per track: **≥2–3 verses, the chorus repeated after each verse (≥3 chorus repeats), a bridge, a final chorus + outro.** The repetition *is* the pedagogy: the payload-bearing chorus heard 3–4× is what sticks.

## Write the album to disk

Albums are written under `$GEN_SUNO_ALBUMS_DIR` (default: a `suno-albums/` folder in the current directory):

```bash
ALBUMS_DIR="${GEN_SUNO_ALBUMS_DIR:-./suno-albums}"
SLUG="<kebab-topic>"                      # e.g. variance-song-cycle, or note--<slug> for a single note
DATE="$(date +%Y-%m-%d)"
ALBUM="$ALBUMS_DIR/${DATE}--${SLUG}"
mkdir -p "$ALBUM"
```

Folder contents (Mode B example; Mode A is the same minus the spine refrain and with fewer tracks):

```
suno-albums/2026-01-15--variance-song-cycle/
├── README.md                    # album overview (template below)
├── 01 - Quadratic Form.md
├── 02 - The Trace Trick.md
└── ...
```

Each song file is individually copy-pasteable into Suno as a manual fallback.

## Generation (run the CLI)

Run the CLI against the album folder:

```bash
gen-suno doctor                      # 1. session alive? exits non-zero if dead
gen-suno gen "$ALBUM" --dry-run      # 2. plan + cost, spends NOTHING
# → show the user the track count + credit cost, CONFIRM, then:
gen-suno gen "$ALBUM"                # 3. drives the browser, polls, writes audio URLs into each note
```

- **Credit confirmation gate.** `gen-suno gen "$ALBUM"` spends real credits (~10 per track, ~3 min each). It is an outward, hard-to-undo action, so by default: run `doctor` + `--dry-run`, surface the cost, and confirm once before the real run. Skip the confirm only when the user explicitly said "just generate it" / "and make the audio".
- **Lyrics only (no spend):** if the user wants lyrics without spending credits, stop after writing the album (optionally show `gen-suno gen "$ALBUM" --dry-run` for the cost estimate) and tell them how to generate later.
- **Order matters in Mode B**: `gen` walks the folder in filename order (`01 →`), so callbacks land correctly. `--limit N` caps a run (smoke test); `--force` regenerates tracks that already carry URLs.
- **Dead session / no credits**: `gen-suno` fails loudly (optionally via Pushover if configured) rather than hanging. Tell the user to run `gen-suno login` once. Don't loop or retry.

After a successful run each note carries:

```yaml
suno_status: done
suno_urls:
  - https://cdn1.suno.ai/<clip-a>.mp3
  - https://cdn1.suno.ai/<clip-b>.mp3
suno_clip_ids:
  - <clip-a>
  - <clip-b>
suno_generated_at: <YYYY-MM-DD>
```

## README template (album overview)

```markdown
---
title: "<Album Title>: a <topic> song cycle"
status: candidate
---

# <Album Title>

> One-line premise: <a vibe (Mode A) or an ordered, singable curriculum for <topic> (Mode B)>.

## The chain        (Mode B only)
<ASCII dependency-graph diagram, topologically sorted>

## Spine refrain    (Mode B only)
> <the 4-line refrain that threads every track>

## Tracks
1. 01 - <title>: teaches X (depends on: none)
2. 02 - <title>: teaches Y (depends on: 1)

## Source material
- Track 1 ← <source note or reference>

## How to generate
Automated (preferred): `gen-suno gen "<this album folder>"` drives a logged-in browser,
generates every track, writes both takes' audio URLs into each note. Zero human
interaction. (`gen-suno doctor` first to confirm the session is alive; `--dry-run` for cost.)

Manual fallback: generate tracks in order (1→N), pasting each `suno_style` into the style box
and the lyrics block into the lyrics box; reuse one persona for a consistent voice.
```

## Organizing generated albums

Keep freshly-written, not-yet-generated lyric folders separate from generated ones however you like (for example a `candidates/` and a `done/` subfolder under `$GEN_SUNO_ALBUMS_DIR`). Once every track in an album carries audio URLs, move the folder into the "done" area:

```bash
ALBUMS_DIR="${GEN_SUNO_ALBUMS_DIR:-./suno-albums}"
mkdir -p "$ALBUMS_DIR/done"
mv "$ALBUMS_DIR/<folder>" "$ALBUMS_DIR/done/<folder>"
```

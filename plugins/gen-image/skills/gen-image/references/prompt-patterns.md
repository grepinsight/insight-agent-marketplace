# Prompt Patterns for Educational Images

Reusable templates for `gen-image` prompts. Vague prompts produce garbage, every prompt should specify layout, labels, palette, and style.

## The four mandatory ingredients

1. **Layout direction**: "two-column", "vertical ladder", "7-day calendar strip", "split panel", "top-to-bottom flow"
2. **Explicit labels/text**: every callout, axis, percentage, caption written out
3. **Color palette**: name 2-3 colors, e.g. "navy + gold + green"
4. **Style hint at end**: "flat infographic style, clean typography, no photorealism"

## Pattern: Split-Panel Comparison

Use for: X vs Y, two approaches side-by-side, before/after.

```
A split-panel educational cartoon. LEFT side labeled '<Concept A>': <concrete visual scene>.
RIGHT side labeled '<Concept B>': <concrete visual scene showing the contrast>.
Clean, minimal, educational style with clear labels.
```

## Pattern: Process Flow

Use for: multi-step procedures, pipelines, sequential mechanisms.

```
An educational infographic showing a sequential process. Step 1: <scene>. Step 2: <scene>.
Step 3: <scene>. Numbered steps, arrows showing flow, clean educational style.
```

## Pattern: Analogy Mapping

Use for: mapping an unfamiliar concept onto a familiar one (the strongest pedagogical move).

```
Educational cartoon showing <familiar concept> mapping to <unfamiliar concept>.
Top layer labeled '<Domain A>' shows: <visual elements>.
Bottom layer labeled '<Domain B>' shows: <corresponding elements>.
Arrows connect corresponding parts. Clean diagram style with color coding.
```

## Pattern: System / Architecture

Use for: components and connections, infrastructure, organizational maps.

```
A diagram-style illustration of <system>. Components: <list with brief visual descriptions>.
Show connections between components with labeled arrows. Clean, minimal, spatial layout.
```

## Pattern: Problem Visualization (opener)

Use for: opening image of a long note, show WHY this matters.

```
Educational cartoon. <Protagonist> facing <problem>. Visual metaphor for the gap/pain.
Single focal point, clear emotional read, no text clutter. Clean illustration style.
```

## Pattern: Data Insight

Use for: a key finding that benefits from visual anchoring (counterintuitive ratios, thresholds).

```
Educational infographic. Headline number/finding centered: '<the punchline>'.
Supporting visual: <bar chart / before-after / ratio diagram>.
Two-color palette (<color1> for baseline, <color2> for highlight). Clean, minimal.
```

## Transcript-Oriented Patterns

These three recur in interview/podcast/deep-dive transcripts, where ideas arrive as spectrums, vivid metaphors, and thought experiments. Each has a matching first-class template in the `gen-image` CLI (≥ 0.6.0), prefer the CLI template (`gen-image --template <name> --var ...`) and fall back to the inline form below if the template is absent.

### Pattern: Spectrum / Triad (3-way)

CLI template: `spectrum-triad`. Use for a three-point spectrum (fragile/robust/antifragile, additive/neutral/multiplicative). The split-panel above only handles two.

```
A three-column infographic titled '<spectrum name>'.
LEFT '<low end> — <one-line behavior>': <concrete figure/scene>. caption '<consequence>'.
CENTER '<mid> — <behavior>': <figure/scene>. caption '<consequence>'.
RIGHT '<high end> — <behavior>': <figure/scene>. caption '<consequence>'.
Color-grade red → neutral → green. Bottom gradient arrow labeled '<the axis> →'.
Flat infographic, bold labels.
```

### Pattern: Metaphor-Made-Literal

CLI template: `metaphor-mapping`. Use when one vivid central metaphor carries the idea (crystal ball, Damocles' sword, broken weather report). Render the abstraction *as* its metaphor and annotate the mapping. (Distinct from `educational-metaphor`, which carries no text, this one shows the metaphor→meaning callouts.)

```
A single striking illustration of '<the metaphor>' as the literal embodiment of '<abstract concept>'.
Show: <the concrete metaphor scene in detail>. Annotate 2-3 parts with small callouts mapping
metaphor→concept: '<metaphor part>' = '<what it means>'. One focal point, clean, minimal text.
```

### Pattern: Thought-Experiment / Two-Outcome

CLI template: `thought-experiment`. Use for "imagine 100 people in a casino..." passages, a described experiment whose point is two diverging outcomes (ensemble vs time average).

```
A two-panel 'thought experiment' diagram titled '<experiment name>'.
SETUP banner across top: '<the rules in one line>'.
LEFT panel '<scenario A>': <visual of A> → outcome label '<result A>' (green/up).
RIGHT panel '<scenario B>': <visual of B> → outcome label '<result B>' (red/down).
Emphasize the divergence between the two. Clean diagram style, legible numbers.
```

## Dimension-Specific Recipes

Pair these prompt fragments with the right style to cover common explanatory dimensions of a concept.

### History, use `vintage-blueprint` or `manga-strip`

```
vintage-blueprint: "The invention of <X> by <inventor>, <year>. Show the core mechanism
as a patent-style diagram: <component A> connected to <component B>. Annotation callouts
label key innovations: 'first breakthrough', 'second breakthrough'. Title
annotation: '<Invention Name>, <Inventor>, <Year>'"

manga-strip: "The story of how <X> was invented: Panel 1, <inventor> in their lab facing
<problem>. Panel 2, the 'aha' moment: <key insight>. Panel 3, first prototype:
<what it looked like>. ... Panel 8, modern impact: <how it changed the field>"
```

### Economics, use `diagram-alternative`

```
"Cost breakdown infographic for <procedure/system>. Left column: raw material costs
(<$X for A, $Y for B>). Center column: commercial price (<$Z>). Right column: who pays
(<split across parties>). Use horizontal stacked bars. Green = covered,
red = out of pocket. Bottom annotation: 'Total market size: $N billion'"
```

### Output / Results, use `diagram-alternative`

```
"Sample output report for <system>. Show the actual format: <header with an ID>,
<table of results with N rows>, <interpretation section>. Mock data with realistic values.
Highlight the key decision-making number with a colored callout box. Clean document style."
```

### Underlying Principles, use `vintage-blueprint` or `educational-cartoon`

```
vintage-blueprint: "The principle of <principle name> illustrated across three domains.
Center: the abstract principle as a mechanical/geometric diagram. Three annotation branches
radiating outward, each showing the principle in a different domain: <domain A example>,
<domain B example>, <domain C example>. Hand-lettered title: '<Principle Name>'"

educational-cartoon: "Show <principle> as a visual metaphor: <concrete familiar thing>
that captures the essential dynamic. Left side: the principle operating in <domain A>.
Right side: the same principle in <domain B>. Visual connection between the two."
```

### Why THIS Design, use `vintage-blueprint`

```
"Engineering trade-off diagram for <design choice>. Show the chosen design in the center
with annotation callouts explaining each constraint: '<constraint 1: why not simpler>',
'<constraint 2: what breaks without this>'. Ghost-outlined alternative approach in the
corner with an X through it and annotation: 'Rejected because <reason>'"
```

### What Can Go Wrong, use `first-person`

```
"First-person POV in <dangerous scenario>. I can see <hazard> directly in front of me.
My gloved hands are <doing what>. Warning signs visible: <specific danger indicators>.
Speech bubble from colleague: '<warning dialogue>'. The scene should feel tense,
realistic lighting, shallow depth of field on the hazard."
```

### The Human, use `first-person`

```
"First-person POV sitting at the workstation of a <job title>. My hands are on
<their tools/equipment>. The screen in front shows <what they see daily>. To my left:
<their workspace context>. To my right: <colleague or equipment>. Morning light.
Coffee cup at the edge of frame. Speech bubble from supervisor: '<realistic dialogue>'"
```

## Quality checklist

Before generating, verify the prompt includes:

- [ ] Clear labels on all visual elements
- [ ] Explicit left/right or top/bottom layout instructions
- [ ] Style directive ("clean, minimal, educational" or "diagram-style")
- [ ] Specific objects/scenes (not abstract descriptions)
- [ ] Color coding instructions if comparing multiple things

## Naming convention

```
<note-slug>-<concept>.png
```

- `note-slug`: short kebab-case identifier for the note (`cup`, `rbac`, `aws-trust`)
- `concept`: what the image shows (`diagnostic-gap`, `assume-role-flow`)

Examples:

- `aws-trust-vs-permissions-analogy.png`
- `authn-vs-authz.png`
- `git-rebase-flow.png`
- `rbac-vs-abac-comparison.png`

## Embedding rules

- For Obsidian, wikilink format: `![[filename.png]]`. For plain Markdown, `![](assets/filename.png)`.
- Place the image **before** the paragraph it illustrates (the image primes understanding, the text fills in details).
- Blank line before and after the embed.
- Place after a section heading when the image covers the whole section.
- Place between paragraphs when the image covers a specific point.
- Don't add captions, alt text, or wrap in blockquotes/lists/tables, the image should be self-explanatory.

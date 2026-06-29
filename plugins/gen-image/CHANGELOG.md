# Changelog

All notable changes to the gen-image plugin are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com); this plugin uses semantic versioning.

## [0.4.0]: 2026-06-29

### Added
- **Transcript Mode** in `SKILL.md`: turn a transcript (raw or speaker-resolved,
  e.g. an auto-podcast) into a set of per-topic images via a segment → distill →
  generate pipeline. Segments by idea (not speaker), ranks topics by visual
  density, distills each to a single salient frame, and generates one image for
  every topic above a visual-density threshold (Medium or above), skipping
  transitions and banter, rather than one image per topic.
- Three transcript-oriented prompt patterns in `references/prompt-patterns.md`:
  spectrum-triad (3-point spectrum), metaphor-mapping (concept rendered as its
  metaphor with annotated callouts), and thought-experiment (two diverging
  outcomes). Each points at the matching first-class template in the `gen-image`
  CLI (≥ 0.6.0), with an inline fallback.

### Changed
- Skill description and trigger list now cover transcript/podcast input.

# gen-suno (Claude Code plugin)

Write Suno-ready song lyrics and generate the audio, in one step. Ask for a song or a whole album; the skill composes the lyrics in Suno's song-note format, runs the `gen-suno` CLI to generate every track, and writes the hosted audio URLs back into each note.

## What you get

A `gen-suno` skill that Claude Code invokes when you say things like:

- "make a song about the water cycle"
- "make songs to memorize the Krebs cycle" (a chained, ordered album)
- "turn this note into a Suno song"
- "song cycle for linear regression"

Two modes:

- **General**: one or a few standalone songs about any topic, mood, or note.
- **Learning curriculum**: a chained prerequisite album where each track teaches one node of a dependency graph, ordered so every song leans only on earlier ones, with a recurring spine refrain that encodes the chain. Lyrics and the Suno style box are tuned for **intelligibility**, because a learning song only teaches if the words come through (clear enunciation, vocals up front, moderate tempo, low reverb).

The skill is credit-aware: it runs a `--dry-run` cost preview and confirms before spending Suno credits.

## Prerequisites

This plugin is a thin orchestration layer over a separate CLI named `gen-suno` ([grepinsight/gen-suno](https://github.com/grepinsight/gen-suno)). Installing this plugin does **not** install the CLI. You need:

1. The `gen-suno` CLI on your `PATH`. Install it as a persistent tool from [github.com/grepinsight/gen-suno](https://github.com/grepinsight/gen-suno).
2. A Suno account with available credits.
3. A one-time interactive login so the browser session persists (run on a machine with a display):

   ```bash
   gen-suno login      # opens suno.com → sign in → the session persists
   ```

Verify the session is healthy (also the cron/CI preflight):

```bash
gen-suno doctor        # "✓ session alive · N credits", or exits non-zero
```

## Configuration

All configuration is via environment variables; nothing is required to get started.

| Env var | Default | Effect |
|---|---|---|
| `GEN_SUNO_ALBUMS_DIR` | `./suno-albums` | Where the skill writes album/lyric folders. |
| `GEN_SUNO_CDP_PORT` | `9223` | Chrome remote-debugging port the CLI attaches to. |
| `GEN_SUNO_CHROME_PROFILE` | `~/.config/gen-suno/chrome-profile` | Persistent browser profile that holds the Suno login. |
| `GEN_SUNO_CREDITS_PER_GEN` | `10` | Credits charged per generation (two takes). |
| `PUSHOVER_TOKEN`, `PUSHOVER_USER` | unset | If both set, the CLI pushes failures to your phone. |
| `GEN_SUNO_NOTIFY_CMD` | unset | A command run as `$CMD "<title>" "<message>"` for any other notifier. |

## Install

### From the `insight` marketplace

```
/plugin marketplace add grepinsight/insight-agent-marketplace
/plugin install gen-suno@insight
```

### Via `npx skills` (cross-agent)

Install the skill into any supported agent with the [Vercel skills](https://github.com/vercel-labs/skills) CLI. This installs the skill but **not** the `gen-suno` CLI, see Prerequisites above.

```bash
npx skills add grepinsight/insight-agent-marketplace -s gen-suno -y        # current agent + scope
npx skills add grepinsight/insight-agent-marketplace -s gen-suno -g -y     # global (user-level)
npx skills add grepinsight/insight-agent-marketplace -s gen-suno -a openclaw -g -y --copy   # a specific agent
```

Restart your agent afterward so the skill is picked up. For installing into OpenClaw / Hermes agents, see [Installing for AI agents](../../README.md#installing-for-ai-agents) in the root README.

## License

MIT.

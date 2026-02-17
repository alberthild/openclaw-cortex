# @vainplex/openclaw-cortex

> Conversation intelligence layer for [OpenClaw](https://github.com/openclaw/openclaw) — automated thread tracking, decision extraction, boot context generation, and pre-compaction snapshots.

[![npm](https://img.shields.io/npm/v/@vainplex/openclaw-cortex)](https://www.npmjs.com/package/@vainplex/openclaw-cortex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What It Does

`openclaw-cortex` listens to OpenClaw message hooks and automatically:

- **📋 Tracks conversation threads** — detects topic shifts, closures, decisions, and blocking items
- **🎯 Extracts decisions** — recognizes when decisions are made (English + German) and logs them
- **🚀 Generates boot context** — assembles a dense `BOOTSTRAP.md` at session start so the agent has continuity
- **📸 Pre-compaction snapshots** — saves thread state + hot snapshot before memory compaction
- **📖 Structured narratives** — generates 24h activity summaries from threads + decisions

Works **alongside** `memory-core` (OpenClaw's built-in memory) — doesn't replace it.

## Demo

Try the interactive demo to see Cortex in action:

```bash
git clone https://github.com/alberthild/openclaw-cortex.git
cd openclaw-cortex && npm install
npx tsx demo/demo.ts
```

The demo simulates a bilingual (EN/DE) developer conversation and shows:

- **🧵 Thread Tracking** — 3 threads detected, 1 auto-closed via "done ✅"
- **🎯 Decision Extraction** — 4 decisions found ("decided", "the plan is", "beschlossen")
- **😤→🔥 Mood Detection** — tracks emotional arc from frustrated to excited
- **📸 Pre-Compaction Snapshot** — saves full conversation state before memory loss
- **📋 Boot Context** — generates a dense BOOTSTRAP.md briefing (~800 tokens)

<details>
<summary>📸 Sample output</summary>

```
━━━ Phase 2: Thread Tracking Results ━━━

  Found 3 threads (2 open, 1 closed)

  ○ 🟠 the auth migration         → closed (detected "done ✅")
  ● 🟡 dem Performance-Bug        → open, mood: frustrated
  ● 🟡 the Kubernetes cluster     → open, waiting for Hetzner estimate

━━━ Phase 3: Decision Extraction ━━━

  Extracted 4 decisions:

  🎯 The plan is to keep backward compatibility for 2 weeks   [medium]
  🎯 We decided to use Auth0 as the provider                  [medium]
  🎯 Wir machen Batched DataLoader                            [medium]
  🎯 Beschlossen — warten auf Review von Alexey               [high: deploy]
```

</details>

## Install

```bash
# From npm
npm install @vainplex/openclaw-cortex

# Copy to OpenClaw extensions
cp -r node_modules/@vainplex/openclaw-cortex ~/.openclaw/extensions/openclaw-cortex
```

Or clone directly:

```bash
cd ~/.openclaw/extensions
git clone https://github.com/alberthild/openclaw-cortex.git
cd openclaw-cortex && npm install && npm run build
```

## Configure

Add to your OpenClaw config:

```json
{
  "plugins": {
    "openclaw-cortex": {
      "enabled": true,
      "patterns": {
        "language": "both"
      },
      "threadTracker": {
        "enabled": true,
        "pruneDays": 7,
        "maxThreads": 50
      },
      "decisionTracker": {
        "enabled": true,
        "maxDecisions": 100,
        "dedupeWindowHours": 24
      },
      "bootContext": {
        "enabled": true,
        "maxChars": 16000,
        "onSessionStart": true,
        "maxThreadsInBoot": 7,
        "maxDecisionsInBoot": 10,
        "decisionRecencyDays": 14
      },
      "preCompaction": {
        "enabled": true,
        "maxSnapshotMessages": 15
      },
      "narrative": {
        "enabled": true
      }
    }
  }
}
```

Restart OpenClaw after configuring.

## How It Works

### Hooks

| Hook | Feature | Priority |
|---|---|---|
| `message_received` | Thread + Decision Tracking | 100 |
| `message_sent` | Thread + Decision Tracking | 100 |
| `session_start` | Boot Context Generation | 10 |
| `before_compaction` | Pre-Compaction Snapshot | 5 |
| `after_compaction` | Logging | 200 |

### Output Files

```
{workspace}/
├── BOOTSTRAP.md                    # Dense boot context (regenerated each session)
└── memory/
    └── reboot/
        ├── threads.json            # Thread state
        ├── decisions.json          # Decision log
        ├── narrative.md            # 24h activity summary
        └── hot-snapshot.md         # Pre-compaction snapshot
```

### Pattern Languages

Thread and decision detection supports English, German, or both:

- **Decision patterns**: "we decided", "let's do", "the plan is", "wir machen", "beschlossen"
- **Closure patterns**: "is done", "it works", "fixed ✅", "erledigt", "gefixt"
- **Wait patterns**: "waiting for", "blocked by", "warte auf"
- **Topic patterns**: "back to", "now about", "jetzt zu", "bzgl."
- **Mood detection**: frustrated, excited, tense, productive, exploratory

### Graceful Degradation

- Read-only workspace → runs in-memory, skips writes
- Corrupt JSON → starts fresh, next write recovers
- Missing directories → creates them automatically
- Hook errors → caught and logged, never crashes the gateway

## Development

```bash
npm install
npm test            # 270 tests
npm run typecheck   # TypeScript strict mode
npm run build       # Compile to dist/
```

## Performance

- Zero runtime dependencies (Node built-ins only)
- All hook handlers are non-blocking (fire-and-forget)
- Atomic file writes via `.tmp` + rename
- Tested with 270 unit + integration tests

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full design document including module diagrams, data flows, type definitions, and testing strategy.

## License

MIT — see [LICENSE](LICENSE)

## Related

- [@vainplex/nats-eventstore](https://www.npmjs.com/package/@vainplex/nats-eventstore) — Publish OpenClaw events to NATS JetStream
- [OpenClaw](https://github.com/openclaw/openclaw) — Multi-channel AI gateway

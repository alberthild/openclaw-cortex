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

## 🎬 Demo

Try the interactive demo — it simulates a real bilingual dev conversation and shows every Cortex feature in action:

```bash
git clone https://github.com/alberthild/openclaw-cortex.git
cd openclaw-cortex && npm install
npx tsx demo/demo.ts
```

### What the demo shows

A 13-message conversation between a developer (Albert) and an AI assistant (Claudia) covering 3 topics in English and German. Cortex processes every message in real-time:

```
👤 Albert: Let's get back to the auth migration. We need to switch from JWT to OAuth2.
🤖 Claudia: I'll start with the token validation layer. The plan is to keep backward compatibility for 2 weeks.
👤 Albert: Agreed. We decided to use Auth0 as the provider.
👤 Albert: Also, jetzt zu dem Performance-Bug. Die API braucht 3 Sekunden für simple Queries.
🤖 Claudia: Ich hab den Profiler laufen lassen. Das Problem ist der N+1 Query im User-Resolver.
👤 Albert: Mist, das ist nervig. Wir brauchen das bis Freitag gefixt.
🤖 Claudia: Wir machen Batched DataLoader.
👤 Albert: Beschlossen. Und wir warten auf den Review von Alexey bevor wir deployen.
🤖 Claudia: Auth migration is done ✅ All tests green, backward compat verified.
👤 Albert: Nice! Perfekt gelaufen. 🚀
👤 Albert: Now about the Kubernetes cluster — we need to plan the migration from Docker Compose.
🤖 Claudia: I'll draft an architecture doc. Waiting for the cost estimate from Hetzner first.
👤 Albert: Guter Fortschritt heute. Lass uns morgen mit dem K8s-Plan weitermachen.
```

<details>
<summary><b>🧵 Thread Tracking</b> — 3 threads detected, 1 auto-closed</summary>

```
Found 3 threads (2 open, 1 closed)

  ○ 🟠 the auth migration
      Status: closed           ← detected "done ✅" as closure signal
      Priority: high
      Mood: neutral

  ● 🟡 dem Performance-Bug
      Status: open
      Priority: medium
      Mood: neutral

  ● 🟡 the Kubernetes cluster
      Status: open
      Priority: medium
      Mood: neutral
      Waiting for: cost estimate from Hetzner
```

</details>

<details>
<summary><b>🎯 Decision Extraction</b> — 4 decisions found across 2 languages</summary>

```
  🎯 The plan is to keep backward compatibility for 2 weeks
      Impact: medium | Who: claudia

  🎯 We decided to use Auth0 as the provider
      Impact: medium | Who: albert

  🎯 Wir machen Batched DataLoader
      Impact: medium | Who: claudia

  🎯 Beschlossen. Und wir warten auf den Review von Alexey bevor wir deployen.
      Impact: high | Who: albert
```

Trigger patterns: `"the plan is"`, `"we decided"`, `"wir machen"`, `"beschlossen"`

</details>

<details>
<summary><b>🔥 Mood Detection</b> — session mood tracked from patterns</summary>

```
  Session mood: 🔥 excited
  (Detected from "Nice!", "Perfekt gelaufen", "🚀")
```

Supported moods: `frustrated` 😤 · `excited` 🔥 · `tense` ⚡ · `productive` 🔧 · `exploratory` 🔬 · `neutral` 😐

</details>

<details>
<summary><b>📸 Pre-Compaction Snapshot</b> — saves state before memory loss</summary>

```
  Success: yes
  Messages snapshotted: 13
  Warnings: none

  Hot Snapshot (memory/reboot/hot-snapshot.md):
    # Hot Snapshot — 2026-02-17
    ## Last conversation before compaction

    **Recent messages:**
    - [user] Let's get back to the auth migration...
    - [assistant] I'll start with the token validation layer...
    - [user] Agreed. We decided to use Auth0 as the provider.
    - [user] Also, jetzt zu dem Performance-Bug...
    - ...
```

</details>

<details>
<summary><b>📋 Boot Context (BOOTSTRAP.md)</b> — ~786 tokens, ready for next session</summary>

```markdown
# Context Briefing
Generated: 2026-02-17 | Local: 12:30

## ⚡ State
Mode: Afternoon — execution mode
Last session mood: excited 🔥

## 📖 Narrative (last 24h)
**Completed:**
- ✅ the auth migration: Topic detected from albert

**Open:**
- 🟡 dem Performance-Bug: Topic detected from albert
- 🟡 the Kubernetes cluster: Topic detected from albert

**Decisions:**
- 🎯 The plan is to keep backward compatibility for 2 weeks (claudia)
- 🎯 We decided to use Auth0 as the provider (albert)
- 🎯 Wir machen Batched DataLoader (claudia)
- 🎯 Beschlossen. Warten auf Review von Alexey (albert)
```

Total: 3,143 chars · ~786 tokens · regenerated every session start

</details>

<details>
<summary><b>📁 Generated Files</b></summary>

```
{workspace}/
├── BOOTSTRAP.md                          3,143 bytes
└── memory/reboot/
    ├── threads.json                      1,354 bytes
    ├── decisions.json                    1,619 bytes
    ├── narrative.md                        866 bytes
    └── hot-snapshot.md                   1,199 bytes
```

All plain JSON + Markdown. No database, no external dependencies.

</details>

> 📝 Full raw output: [`demo/SAMPLE-OUTPUT.md`](demo/SAMPLE-OUTPUT.md)

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

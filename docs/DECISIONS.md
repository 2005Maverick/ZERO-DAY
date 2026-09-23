# Architecture Decision Records

One short ADR per architectural decision. Never edit an accepted ADR's decision. If it changes, add a new ADR that supersedes it.

Template:

```
## ADR-NNN — <title>
**Status:** proposed | accepted | superseded by ADR-XXX
**Date:** YYYY-MM-DD · **Roadmap:** <task id>
**Context:** the problem and constraints.
**Options:** what we considered, with tradeoffs.
**Choice:** what we picked, and who decided.
**Consequences:** what this makes easy, hard, or impossible.
```

---

## ADR-001 — Agent execution model: hybrid (deterministic Monitor, ReAct Research, single-shot Coach)
**Status:** accepted
**Date:** 2026-09-23 · **Roadmap:** 1.1 · **Decided by:** Bhavya Talwar

**Context:** V2 needs Monitor → Research → Coach under an orchestrator, with a per-step decision-audit log and no agent reading numbers off chart images. Constraints:
- Groq supports tool calling on all current models, including `llama-3.1-8b-instant`.
- Only `gpt-oss-20b/120b` and `qwen/qwen3.8-27b` support strict (schema-enforced) structured outputs.
- Structured outputs can't be combined with tool use or streaming in the same request.
- The simulation runs at up to 150 ms per simulated minute.
- The engine currently runs only in the browser.

**Options:**
- **A. Chained prompts.** Code gathers the data; one LLM call per agent. Fastest and most testable, but not meaningfully agentic, so it's hard to distinguish from V1.
- **B. Function calling with our own ReAct loop in every agent.** Fully agentic, but pays loop latency and small-model unreliability three times, including where there's no choice for the model to make.
- **C. MCP.** C1: Groq runs the loop against our MCP server, so we lose the per-step audit log and step limit, and the server must be public and authenticated. C2: our route acts as the MCP client, which is B plus a protocol layer with a single consumer.
- **D. Hybrid.** An LLM only where judgement is needed.

**Choice: D.**
- **Monitor**: deterministic TypeScript rules over the engine's action stream. No LLM.
- **Research**: a ReAct loop written by us, using native function calling, read-only tools and a hard step limit. It ends when the model calls a `submit_findings` tool, whose arguments are validated with Zod.
- **Coach**: one structured-output LLM call.
- **Orchestrator**: a plain TypeScript state machine, not an LLM supervisor.
- **Tool registry**: name, description and Zod schema per tool (the same shape MCP uses), so exposing tools over MCP later is additive.
- We write the loop ourselves rather than using the `ai` SDK's built-in loop, for control over audit logging and so the mechanism is ours to explain.

**Consequences:**
- The model has real choice in Research (which data windows and indicators to use). Detection and handoffs are deterministic and testable.
- Every step can be logged (3.6); step limits and budgets are enforced by our code.
- Research's final output can't use schema-enforced decoding, so we validate with Zod and allow one repair retry.
- Monitor is an "agent" only in the software sense: it has the same interface and appears in the audit log, but has no LLM. This must be stated plainly in the report.
- Tools need trusted session state on the server (see proposal P1). This is not decided by this ADR.
- Latency: roughly 2–5 s per decision event (to measure in 1.7), so feedback lags the sim at high speed. The UX answer (pause the sim on decision events vs. show feedback late) is deferred to 7.1/7.5.
- Model choice per agent is deferred to the eval set (2.7).

---

## ADR-002 — Orchestrator: fallback ladder, server re-check, split budget, client-side coalescing
**Status:** accepted
**Date:** 2026-09-23 · **Roadmap:** 1.4 · **Decided by:** Bhavya Talwar (approved design); implemented by Claude

**Context:** One decision event must flow Monitor → Research → Coach and always yield feedback, within a time limit. At the same time:
- Research can fail or stall (the live run showed 2–5 s per run).
- Session state is currently client-sent (untrusted, P1).
- Users can trigger several events per second at 10× speed.
- The app runs on Vercel, whose server instances don't share memory.

**Options considered:**
- *On failure:* fail the whole pipeline, or retry, or **degrade step by step**.
- *Event trust:* take the client's event as-is, or **re-run Monitor on the server first**.
- *Timing:* one timeout per agent, or **one deadline with a reserve for Coach**.
- *Bursts:* queue everything, run everything in parallel, or **coalesce (latest wins)**.
- *Where coalescing lives:* server memory (broken on serverless), a database lock, or **the browser**.

**Choice:**
- **Fallback ladder:** `full` → `monitor_only` (Coach without Research) → `template` (a deterministic message from Monitor's event). An event the server can't reproduce is `rejected` before any tokens are spent.
- **Trust the server's event:** the server re-runs Monitor's pure rules on its snapshot and uses *its* event, not the client's claimed facts.
- **Split budget:** Research gets `deadline − coachReserve`; Coach gets whatever is left. Each agent is raced against its budget, so a stalled agent can't hold the pipeline.
- **Coalescing in the browser:** one pipeline at a time per session. While one is running, only the latest new event waits; older waiting events are dropped and reported.
- **No streaming:** Coach uses strict structured output, which Groq can't stream.

**Consequences:**
- The user always gets feedback, and the audit log records which path produced it.
- The re-check is only as trustworthy as the snapshot. With `client_snapshot` it catches inconsistent or buggy events, **not** a client that lies consistently. Real trust needs P1 (server replay).
- Coalescing in the browser means a malicious client can bypass it, so the server still needs a rate limit (8.4).
- Dropped events get no AI feedback. They must still appear in the audit log (3.2).
- The template path means Monitor's `summary` must always be written as a sentence the user can read.

---

## ADR-003 — Persistence: event-sourced action log, server-written audit trail, RLS
**Status:** accepted
**Date:** 2026-09-23 · **Roadmap:** 3.1, 3.2, 3.5, P1 · **Decided by:** Bhavya Talwar; implemented by Claude

**Context:** V2 must persist sessions and a decision-audit trail, keep users' data private, and eventually give agents trustworthy state (P1). The engine is a reducer that runs in the browser, and the app is hosted serverless on Vercel.

**Options (P1):**
- (a) Trust client snapshots: simplest, but untrusted.
- (b) Store the action log and replay the reducer on the server: trusted once the reducer is pure; phased.
- (c) Run the engine on the server: not viable on serverless, and a rewrite.

**Choice:**
- **(b), phased.** `session_actions` is an append-only log of user decisions and the source of truth. Ticks aren't stored; replay regenerates them. Agents use client snapshots until the P2 engine fixes land, then switch to server replay. The schema is the same either way.
- **Six tables:** `profiles`, `sessions`, `session_actions`, `decision_events`, `pipeline_runs`, `agent_runs`. No `trades` table (derived from the log) and no `scenarios` table (scenario data stays in code).
- **`state_before` stored on each decision event** even though replay could rebuild it. After an engine change, replaying an old log through the new reducer gives different states; the snapshot records what the user actually saw. `sessions.engine_version` records which engine produced a session.
- **Security:**
  - Users read only their own rows, and may append only to their own *active* session.
  - The audit trail and session results are written by the server alone (service role).
  - Triggers make the log and audit rows immutable for every role, including the server.
  - A second trigger requires `seq` to be contiguous and `sim_minute` never to go backwards.

**Consequences:**
- One log serves audit (3.2), replay UI (7.2), QA (4.6) and cross-session analysis (5.4).
- **The client still chooses which actions to send.** Replay stops it inventing prices, fills or cash, but not leaving out an action. The contiguity trigger catches gaps from sync bugs, not deliberate omission. Say so in the report.
- The server needs `SUPABASE_SERVICE_ROLE_KEY` (8.2). Leaking it bypasses every policy.
- `consent_at` is in place, but the ethics question (consent, retention, clearance) is still open.
- The migration is tested only in PGlite with a minimal Supabase shim. Supabase-specific behaviour (real JWTs, the default grants on the `auth` schema) must be checked once it's applied to the real project.

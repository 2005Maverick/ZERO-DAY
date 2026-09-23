# Zero Day V2 — Roadmap

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked
**Audit tag** (from `docs/AUDIT.md` §8): `PARTIAL` = reusable pieces exist, `NEW` = nothing exists yet.
Build order: M1 → M3 → M2 → M4 → M5 → M6/M7 → M8. M4 can run in parallel with M2.

_Last updated: 2026-09-23_

---

## M0 — Baseline
- [x] 0.1 Repo audit → `docs/AUDIT.md` — reviewed 2026-09-23

## M1 — Agent Runtime & Orchestration
- [x] 1.1 DECIDE: function-calling vs MCP vs chained prompts `[BLOCKS M1, M2, M3.6]` — **D (hybrid)**, see ADR-001
- [x] 1.2 Agent base interface (input contract, tool registry, output schema, step cap) — done 2026-09-23 (`lib/agents/`); `executeTool` written by Claude at your request
- [x] 1.3 ReAct loop with step limit + termination condition — Research agent only (ADR-001) · done 2026-09-23 (`lib/agents/react-loop.ts`, 17 tests; written by Claude at your request). First live run 2026-09-23: works on `qwen/qwen3.8-27b` and `openai/gpt-oss-20b` (see `docs/evidence/`)
- [x] 1.4 Supervisor/orchestrator: Monitor → Research → Coach — done 2026-09-23 (`lib/agents/pipeline.ts` + client `coalesce.ts`, 15 tests; ADR-002; written by Claude at your request). **Tested with fake agents only**: real Monitor/Coach come in 2.1/2.5
- [x] 1.5 Structured output enforcement (Zod/JSON schema) — done 2026-09-23: loop validates `submit_findings`; `lib/agents/single-shot.ts` uses strict `json_schema` + Zod + one repair (12 tests; written by Claude at your request). Live: strict mode accepted on `gpt-oss-20b` and `qwen3.8-27b`
- [ ] 1.6 Retries, timeouts, single-shot fallback — PARTIAL: loop + pipeline enforce timeouts; fallback ladder (full → monitor_only → template) in 1.4. Missing: backoff on transient model errors
- [ ] 1.7 Token/latency budget per agent call — NEW

## M2 — The Three Agents
- [ ] 2.1 Monitor Agent: detect decision events from the FSM — PARTIAL: `TraceBridge` derives order/SL/halt events; news events never fire (engine bug) · deterministic rules, no LLM (ADR-001)
- [ ] 2.2 Monitor tools: position, portfolio state, scenario clock — PARTIAL: selectors exist client-side only
- [ ] 2.3 Research Agent — NEW (`/api/tutor` is the closest single-shot ancestor)
- [ ] 2.4 Research tools: OHLCV window, indicators, event timeline — PARTIAL: indicator math in `tab-technicals.tsx`, COV-20 timeline (synthetic) · **live-run rule: every tool must cap its data at `session.simMinute`** (qwen read future prices in the smoke run)
- [ ] 2.5 Coach Agent — PARTIAL: `/api/debrief` is a post-session single-shot coach · runner ready (`runSingleShot`). **Live-run rules:** Coach must not state market facts absent from Monitor/Research input; must not recommend features that don't work (it suggested stop-losses, which never execute: P2)
- [ ] 2.6 Coach tools: decision history, bias taxonomy — PARTIAL: 10-rule taxonomy in `lib/behavior/mistakes.ts`; history is single-session
- [ ] 2.7 Per-agent eval set (10–20 fixed cases) — NEW · live smoke harness exists (`npm run test:live`); model candidates on your key: `openai/gpt-oss-20b`, `openai/gpt-oss-120b`, `qwen/qwen3.8-27b` (no Llama)

## M3 — Persistence & Data Layer
- [ ] 3.1 Supabase schema — NEW (`types/database.ts` is an unrelated, unused older schema)
- [ ] 3.2 Decision-audit record design — PARTIAL: `TraceEvent` schema; lacks state before/after, reasoning, feedback
- [ ] 3.3 Migrate off localStorage — NEW (6 keys, see AUDIT §4; live session state isn't persisted at all)
- [ ] 3.4 Supabase Auth — PARTIAL: email + Google work; open redirect, missing `/dashboard`, no route guard, uncommitted auth-bypass fallback
- [ ] 3.5 RLS policies — NEW
- [ ] 3.6 Agent run logging (full ReAct trace) — NEW
- [ ] 3.7 OHLCV cache layer — NEW

## M4 — Scenario Pipeline
- [ ] 4.1 Audit COV-20, extract reusable template — PARTIAL: findings in AUDIT §1–2; template not extracted
- [ ] 4.2 Scenario manifest format — PARTIAL: `Scenario` type + unused 10-scenario metadata; needs session calendar, currency, circuit rules
- [ ] 4.3 Fetch + validate OHLCV — NEW. **Scope flag:** COV-20 is synthetic too; Polygon likely lacks NSE (verify)
- [ ] 4.4 Author event timelines — PARTIAL: COV-20 only
- [ ] 4.5 Wire 9 scenarios end-to-end — NEW; engine hardcodes COV-20 (AUDIT §1.4 #6)
- [ ] 4.6 Per-scenario QA replay — NEW; needs a pure reducer (AUDIT §1.4 #5)

## M5 — Evaluation & Scoring
- [ ] 5.1 Sharpe, max drawdown, win rate, avg hold time — NEW (inputs exist: `equityCurve`, orders)
- [ ] 5.2 Behavioural metrics — PARTIAL: panic-sell, overtrading, revenge, disposition exist; no averaging-down
- [ ] 5.3 End-of-scenario scorecard — PARTIAL: debrief page; no financial metrics
- [ ] 5.4 Cross-session progression `[thesis claim]` — NEW. **No cross-session behaviour data exists today;** also needs a study design
- [ ] 5.5 Baselines: user vs buy-and-hold vs rule-based — NEW

## M6 — FinVQA-Chart Alignment
- [ ] 6.1 Enforce: no agent reads numbers off chart images — NEW (trivially true today; unenforced)
- [ ] 6.2 Document as response to the Fusion Efficiency finding — NEW
- [ ] 6.3 Text-first chart path (computed indicators) — PARTIAL: indicator functions exist inside a component · live run: numbers were all grounded, but one was **bound to the wrong claim**; binding errors survive the text-first path
- [ ] 6.4 Architectural-justification section — NEW

## M7 — Frontend & UX
- [ ] 7.1 Streaming, non-blocking coach feedback — PARTIAL: streaming only in unreachable routes
- [ ] 7.2 Decision-audit timeline replay — NEW
- [ ] 7.3 Scenario selection screen — PARTIAL: Ledger exists; sim links hardcoded to COV-20
- [ ] 7.4 Scorecard + progression dashboard — PARTIAL: debrief only; `/dashboard` is linked but missing
- [ ] 7.5 Latency states for multi-agent calls — PARTIAL: debrief loading/fallback pattern

## M8 — Infrastructure & Delivery
- [ ] 8.1 Next.js 16 verification — PARTIAL: 16.1.6, `tsc` passes; build/lint not yet run; middleware→`proxy.ts` question
- [ ] 8.2 Secrets handling — PARTIAL: Groq keys server-only; no Polygon key
- [ ] 8.3 CI: run agent eval suite — PARTIAL: CI builds + lints only
- [ ] 8.4 Rate limiting / cost guardrails — PARTIAL: client-side coalescing (one pipeline per session, latest event wins) + server re-check before spending tokens (1.4). Missing: server-side rate limit
- [ ] 8.5 Vercel config for new routes — PARTIAL: `maxDuration = 30` set

---

## Proposed additions — NOT yet accepted (need your decision)

The audit surfaced these. I haven't folded them into the modules; accept, merge or reject each.

- P1 **Server-authoritative session state**: agents need a trusted state source (AUDIT §9 Q1). Likely belongs in M3 and gates 2.2.
- P2 **Engine fixes (your code)**: stop-loss execution, news firing, cash reservation, pure reducer, scenario parameterisation (AUDIT §1.4). Gates 2.1, 4.5, 4.6, 5.1.
- P3 **V1-vs-V2 ablation**: same fixed cases through single-shot and multi-agent, scored. Probably part of 2.7 / 5.5.
- P4 **Dead-code decision**: portfolio mode, orphan routes, `ai/` prototypes (AUDIT §7).
- P5 **Auth fixes**: open redirect, `/dashboard`, route guard, uncommitted fallback. Could fold into 3.4.
- P6 **Progression study design** for 5.4: participants, sessions, measure, comparison.
- P7 **V1 AI is likely down (your ORUS code):** 6 routes use `llama-3.1-8b-instant` and `/api/debrief` uses `llama-3.3-70b-versatile`; neither is available on your key (`404 model_not_found`, 2026-09-23). Lines: chat:83, copilot:45+97, debrief:160, feedback:57, portfolio-feedback:49, tutor:61, `lib/ai/groq-client.ts`:35. Suggested replacement: `openai/gpt-oss-20b`. Check the production key too.

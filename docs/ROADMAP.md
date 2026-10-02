# Zero Day V2 — Roadmap

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked
**Audit tag** (from `docs/AUDIT.md` §8): `PARTIAL` = reusable pieces exist, `NEW` = nothing exists yet.
Build order: M1 → M3 → M2 → M4 → M5 → M6/M7 → M8. M4 can run in parallel with M2.

_Last updated: 2026-10-02_

---

## M0 — Baseline
- [x] 0.1 Repo audit → `docs/AUDIT.md` — reviewed 2026-09-23

## M1 — Agent Runtime & Orchestration — ✅ complete 2026-09-23 (budgets provisional)
- [x] 1.1 DECIDE: function-calling vs MCP vs chained prompts `[BLOCKS M1, M2, M3.6]` — **D (hybrid)**, see ADR-001
- [x] 1.2 Agent base interface (input contract, tool registry, output schema, step cap) — done 2026-09-23 (`lib/agents/`); `executeTool` written by Claude at your request
- [x] 1.3 ReAct loop with step limit + termination condition — Research agent only (ADR-001) · done 2026-09-23 (`lib/agents/react-loop.ts`, 17 tests; written by Claude at your request). First live run 2026-09-23: works on `qwen/qwen3.8-27b` and `openai/gpt-oss-20b` (see `docs/evidence/`)
- [x] 1.4 Supervisor/orchestrator: Monitor → Research → Coach — done 2026-09-23 (`lib/agents/pipeline.ts` + client `coalesce.ts`, 15 tests; ADR-002; written by Claude at your request). **Tested with fake agents only**: real Monitor/Coach come in 2.1/2.5
- [x] 1.5 Structured output enforcement (Zod/JSON schema) — done 2026-09-23: loop validates `submit_findings`; `lib/agents/single-shot.ts` uses strict `json_schema` + Zod + one repair (12 tests; written by Claude at your request). Live: strict mode accepted on `gpt-oss-20b` and `qwen3.8-27b`
- [x] 1.6 Retries, timeouts, single-shot fallback — done 2026-09-23: `withRetry` (backoff + full jitter, transient errors only, `lib/agents/retry.ts`); timeouts in loop/single-shot/pipeline; fallback ladder in 1.4. Written by Claude at your request. `withRetry` gets wired in with the real agents (2.3/2.5)
- [x] 1.7 Token/latency budget per agent call — done 2026-09-23 (**provisional values**): `lib/agents/budgets.ts` + `maxRunTokens` → forced submit → `budget_exceeded`; consistency tests. Numbers come from 2 live runs per model; re-derive from the 2.7 eval set

## M2 — The Three Agents
- [~] 2.1 Monitor Agent — in progress (ADR-006): `lib/monitor/` judges each logged PLACE_ORDER in context (state before/after + history), at most one event per action (priority + 15-min cooldown), runs in browser and server (`monitorSession` = server re-check by replay). Claude's rules done: `revenge_trade`, `news_reflex`, `oversized_position`, `overtrading` (20 tests, 9 mutations caught). **Yours:** `averaging_down` (spec in `rules-bhavya.test.ts`, red until written) and `panic_sell` ("on-screen red", decided 2026-10-02: selling a ≥2%-underwater position while the stock is ≥5% below the previous close and still falling over 15 min). Specs in `rules-bhavya.test.ts`, red until written; validated against a scratch reference (each condition's removal fails exactly its test). Engine moved to `lib/engine/live-reducer.ts` (verbatim, at your request) so the server can replay it
- [ ] 2.2 Monitor tools: position, portfolio state, scenario clock — PARTIAL: selectors exist client-side only
- [~] 2.3 Research Agent — built 2026-10-02 (ADR-007): `lib/agents/research/` (ReAct, 5 tools, grounding check inside the loop). Tested with scripted models. **Live (2 runs, `docs/evidence/2026-10-02-live-research-agent.txt`): 1 of 8 runs ok.** Blockers found: Groq free tier = 8,000 tokens/min per model and one run uses 3.5–6.5k (it can 429 on its own); gpt-oss fails forced submits (loop fix applied, not yet re-run live); summary quality poor in the one ok run. Capacity decided (ADR-008): Research on `qwen/qwen3.8-27b`, Coach on `openai/gpt-oss-20b` (separate per-model limits), sim pauses on decision events (to build with the client wiring)
- [x] 2.4 Research tools — done 2026-10-02: `get_price_window`, `get_indicators`, `get_news`, `get_market`, `get_position` over a market view capped at the decision minute; lookback-only arguments; symbol enum per scenario. No-lookahead property test (every tool, 54 minutes × 6 symbols × 3 lookbacks, scenario cut and poisoned) + 2 planted leaks caught. New `lib/indicators/` (Wilder RSI, SMA, VWAP; null instead of invented values)
- [~] 2.5 Coach Agent — built 2026-10-02 (ADR-008): `lib/agents/coach/` single-shot strict JSON on `openai/gpt-oss-20b`; content rules ENFORCED by a check (every number must come from Monitor's facts or Research's findings; no stop-loss advice) with one repair; deterministic `coachTemplate` for the fallback path, which passes the same rules (tested on every kind and on all events from 40 random sessions). 21 tests. **Live: 2 of 2 ok, <1 s, ~1k tokens.** Open: Monitor's `news_reflex` facts carry the signal/noise label, and Coach repeats it (answer key; your call). Wired 2026-10-02: `/api/pipeline` + live-room panel (see 7.1)
- [ ] 2.6 Coach tools: decision history, bias taxonomy — PARTIAL: 10-rule taxonomy in `lib/behavior/mistakes.ts`; history is single-session
- [ ] 2.7 Per-agent eval set (10–20 fixed cases) — NEW · live smoke harness exists (`npm run test:live`); model candidates on your key: `openai/gpt-oss-20b`, `openai/gpt-oss-120b`, `qwen/qwen3.8-27b` (no Llama)

## M3 — Persistence & Data Layer
- [x] 3.1 Supabase schema — done 2026-09-23: `supabase/migrations/20260923120000_v2_core.sql` (6 tables, ADR-003), tested in PGlite. **Applied to your Supabase project** (verified 2026-09-24: all 6 tables exist; anon gets `permission denied`). Signed-in RLS not yet checked with a real user. `types/database.ts` is now obsolete
- [x] 3.2 Decision-audit record design — done 2026-09-23: `decision_events` (facts + `state_before`, FK to the triggering action) → `pipeline_runs` (path, feedback) → `agent_runs` (full trace); state after = replay
- [x] 3.3 Migrate off localStorage — **live session sync done 2026-10-02** (ADR-005): the reducer records a journal (`lib/session/journal.ts`); `SessionSync` sends it to `session_actions` (in-order queue, retry + resync, `lib/session/sync.ts`); `/api/sessions/end` completes the session; `replay()` rebuilds state, proven on 150 random sessions against the real engine. Engine edits (deterministic order ids, exports, journaled reducer) made by Claude at your request. 161 tests + `next build`. **Not yet verified against real Supabase** (play a session signed in, check `session_actions`). Scope decided 2026-10-02: the other 5 localStorage keys stay (ADR-005 addendum); behaviour metrics for 5.x come from server replay of the journal, not `zdm-trace`. Deferred: resume-after-refresh (needs a heartbeat)
- [x] 3.4 Supabase Auth — done 2026-10-02 (ADR-004): bypass → `NEXT_PUBLIC_DEMO_MODE` only; open redirect fixed (`safeNext`); `/dashboard` → `/ledger` (temporary); route guard in `proxy.ts` (Node runtime); missing `/auth/auth-code-error` → `/login`. 19 tests + `next build`. **Not yet verified on Vercel**; ORUS `/api` routes still unauthenticated (your code, P8)
- [x] 3.5 RLS policies — done 2026-09-23: users read own rows and append only to their own active session; audit trail + session results server-only; log and audit immutable (triggers). 16 PGlite tests + 3 mutation checks
- [x] 3.6 Agent run logging (full ReAct trace) — done 2026-09-24: `record_pipeline_run()` DB function (one transaction, server-only) + `lib/db/audit.ts` + `lib/db/admin.ts`; 8 tests incl. atomicity and permission. **New migration `20260924090000_record_pipeline_run.sql` must be applied to Supabase.** Called from the pipeline API route once it exists (2.x)
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
- [~] 6.1 Enforce: no agent reads numbers off chart images — enforced 2026-10-02 (ADR-007): agents get no images at all; Research may only state numbers a tool returned (`check` → `failed_check` → one repair), Coach only numbers from its inputs; tools cannot see past the decision minute (property test). Remaining: an eval-set measure of it (2.7) and the known gap (right number, wrong claim)
- [ ] 6.2 Document as response to the Fusion Efficiency finding — NEW
- [~] 6.3 Text-first chart path (computed indicators) — done for agents 2026-10-02: `lib/indicators/` (Wilder RSI, SMA, VWAP, null when data is short) behind `get_indicators`/`get_price_window`. Binding errors (right number, wrong claim) still pass grounding
- [ ] 6.4 Architectural-justification section — NEW

## M7 — Frontend & UX
- [~] 7.1 Coach feedback in the live room — wired 2026-10-02 (ADR-008): `components/live/live-agents.tsx` runs Monitor on every action, pauses the sim, calls `POST /api/pipeline` (server replay → Monitor re-check → Research → Coach → template ladder → audit), shows a panel with the source labelled honestly, resumes on "Continue trading". Non-streaming by design (strict JSON can't stream; ADR-002). 21 tests + build + local smoke (401s, route guard). **Not yet tried end-to-end with a signed-in user**
- [ ] 7.2 Decision-audit timeline replay — NEW
- [ ] 7.3 Scenario selection screen — PARTIAL: Ledger exists; sim links hardcoded to COV-20
- [ ] 7.4 Scorecard + progression dashboard — PARTIAL: debrief only; `/dashboard` is linked but missing
- [~] 7.5 Latency states — the panel shows a "clock is paused while the coach reviews" state; 20 s client timeout → standard feedback

## M8 — Infrastructure & Delivery
- [x] 8.1 Next.js 16 verification — done 2026-10-02: `next build` passes (Turbopack and webpack); `proxy.ts` confirmed (Node runtime). The random build failures were a known Turbopack bug with Google Fonts' extensionless `…&skey=…` URLs (vercel/next.js#99114); fixed by self-hosting the 11 used fonts from Fontsource packages via `next/font/local` (3 unused fonts removed). The build makes no Google requests. **Check visually** that pages look unchanged
- [ ] 8.2 Secrets handling — PARTIAL: Groq keys server-only; no Polygon key; **`SUPABASE_SERVICE_ROLE_KEY`** in `frontend/.env` and verified working (2026-09-24, read-only check); **still needed in Vercel** env vars (never `NEXT_PUBLIC_`)
- [ ] 8.3 CI: run agent eval suite — PARTIAL: CI builds + lints only
- [ ] 8.4 Rate limiting / cost guardrails — PARTIAL: client-side coalescing (one pipeline per session, latest event wins) + server re-check before spending tokens (1.4). Missing: server-side rate limit **Groq limits on your key (headers, 2026-10-02): 8,000 tokens/min per model, 1,000 requests/day, 1 key** — about one Research+Coach pipeline per minute.
- [ ] 8.5 Vercel config for new routes — PARTIAL: `maxDuration = 30` set

---

## Proposed additions — NOT yet accepted (need your decision)

The audit surfaced these. I haven't folded them into the modules; accept, merge or reject each.

- P1 **Server-authoritative session state** — **ACCEPTED 2026-09-23 as (b) phased** (ADR-003): action log stored from day one; agents switch from client snapshot to server replay once P2 lands.
- P2 **Engine fixes (your code)**: stop-loss execution, news firing, cash reservation, pure reducer, scenario parameterisation (AUDIT §1.4). Gates 2.1, 4.5, 4.6, 5.1.
- P3 **V1-vs-V2 ablation**: same fixed cases through single-shot and multi-agent, scored. Probably part of 2.7 / 5.5.
- P4 **Dead-code decision**: portfolio mode, orphan routes, `ai/` prototypes (AUDIT §7). Also: `portfolio_run_<slug>` storage, and prep telemetry (`zdm_prep_telemetry_*`, written but never read).
- P5 **Auth fixes** — **DONE as 3.4** (2026-10-02).
- P6 **Progression study design** for 5.4: participants, sessions, measure, comparison.
- P7 **V1 AI is likely down (your ORUS code):** 6 routes use `llama-3.1-8b-instant` and `/api/debrief` uses `llama-3.3-70b-versatile`; neither is available on your key (`404 model_not_found`, 2026-09-23). Lines: chat:83, copilot:45+97, debrief:160, feedback:57, portfolio-feedback:49, tutor:61, `lib/ai/groq-client.ts`:35. Suggested replacement: `openai/gpt-oss-20b`. Check the production key too.
- P9 **V1 prep-room indicators fabricate values (your UI):** `components/prep/tabs/tab-technicals.tsx` returns RSI = 50 when data is short, and `computeADX` returns `20 + Math.random() * 10` as a fallback, so a user can see a random ADX. Also its RSI uses simple averages, not Wilder's smoothing. `lib/indicators/` has tested replacements.
- P8 **ORUS API routes have no auth check (your code):** `/api/chat`, `/api/tutor`, `/api/debrief` (and the 4 unreachable ones) accept anonymous requests, so anyone can spend the Groq quota. `proxy.ts` deliberately skips `/api`; each route should call `supabase.auth.getUser()` and return 401. Pairs with 8.4.

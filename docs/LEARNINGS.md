# Learnings Log

Append-only. One entry per substantive task.

---

## [2026-09-23] 0.1 — Auditing V1 before building V2

**What we built:** `docs/AUDIT.md`, a map of the existing engine, scenario pipeline, all Groq call sites, browser storage and Supabase usage, with each roadmap task tagged PARTIAL or NOT STARTED. No code was changed.

**Why this approach:** We needed to know what V1 *actually does*, not what its docs say. The alternative, trusting `PROJECT_CONTEXT.txt`, would have been wrong in several places: it lists five ORUS calls where the code has seven routes and only three are reachable, it calls the data "real price data" when it's generated, and it describes features that are stored but never executed.

**How it actually works:**
- *Reachability analysis.* A file existing doesn't mean it runs. For each API route we traced its callers, then each caller's importers, up to a page in `app/`. If the chain never reaches a page, the code is dead. That's how portfolio mode (22 components) and 4 of 7 Groq routes turned out to be unreachable.
- *A reducer is a state machine.* `useReducer(reducer, init)` gives you `state' = f(state, action)`. The "states" are the values of `status`; the "transitions" are which actions change it. Drawing that table is how you check an FSM has no dead or unreachable states (`PRE_OPEN` lasts one render).
- *Event sourcing.* If a reducer is pure (same input, same output, no clock or randomness inside), then the list of actions *is* a complete record of the session: replaying them rebuilds every intermediate state. That's the cheapest possible decision-audit log. Our reducer is *almost* pure; `Date.now()`/`Math.random()` in `PLACE_ORDER` break it.
- *Derived vs emitted events.* The engine doesn't emit events; `TraceBridge` infers them by diffing state between renders. It works, but anything the state doesn't record can't be inferred, which is why `news_dropped` never fires (`firedNewsIds` is never written).

**Gotchas:**
- "Wired end-to-end" meant direct `COV20_*` imports in 5+ files, with the `[id]` route param ignored. Adding scenario 2 isn't adding data; it means changing the engine.
- A UI control can update state without changing behaviour: the stop-loss button sets `stopPrice`, which nothing ever reads during matching. Look for a *reader* of every field, not just a writer.
- Supabase `user_metadata` is writable by the user with the anon key, so it's no place for scores you want to trust.

**Open questions:**
- Where does trusted session state live once agents run server-side? (Input to 1.1.)
- Real OHLCV source for NSE scenarios, if Polygon doesn't cover them.
- Keep or delete portfolio mode and the orphaned routes?
- Are the COV-20 circuit-breaker events historically accurate?

---

## [2026-09-23] 1.1 — Choosing the agent execution model (hybrid)

**What we built:** A decision (ADR-001), not code. Monitor is deterministic rules. Research is a ReAct loop we write ourselves, using native function calling. Coach is one structured LLM call. A plain TypeScript orchestrator sits over all three.

**Why this approach:** We used an LLM only where there is a real choice to make: which data should Research look at? Chained prompts (A) were rejected as too close to V1 to defend. "Every agent loops" (B) pays latency and small-model unreliability where no choice exists. Groq-hosted MCP (C1) hands the loop to Groq, which breaks our per-step audit log and step limit. We rejected the SDK's built-in loop because it hides the mechanism we need to log and explain.

**How it actually works:**
- *Function calling.* The model never executes anything. We send tool definitions (name, description, JSON Schema). The model replies with a structured call, e.g. `{name, arguments}`. Our code validates the arguments, runs the function, appends the result as a `tool` message, and calls the model again.
- *ReAct* = that exchange in a loop (reason, act, observe), ended by us. It stops on a step limit, a timeout, or the model calling a designated "submit" tool.
- *MCP* sits one layer down. It standardises where tools live and how clients discover them across processes. The model still reaches them through function calling. MCP helps when many clients share tools; we have one client.
- *Why "submit" is a tool:* on Groq, schema-enforced output can't be combined with tool use in the same request. So a looping agent returns its final answer as the arguments of a `submit_findings` tool call, which we validate with Zod ourselves.

**Gotchas:**
- "Structured outputs" on Groq has two levels. `strict: true` means the decoder is constrained to the schema, and only some models support it. `strict: false` means best effort: the JSON may parse but not match the schema. Never trust model output without validating it.
- The 8B model supports tool calling, but "supported" ≠ "reliable". Which model each agent uses gets settled by the eval set, not by the docs.
- Latency multiplies: each loop step is a full round trip. Three agents × several steps is seconds, while the sim ticks every 150 ms at 10×.

**Open questions:**
- P1: where trusted session state comes from (client snapshot vs. replaying the reducer on the server).
- Whether the sim pauses on decision events (UX, 7.1).
- The model for Research (2.7).
- How the report defends a rule-based "Monitor Agent".

---

## [2026-09-23] 1.2 (part 1) — Agent contracts, tool schemas, and a test runner

**What we built:** In `frontend/lib/agents/`:
- `types.ts`: the contracts for tools, agents, runs and steps.
- `groq-tools.ts`: turns a Zod schema into a Groq tool definition.
- `registry.ts`: `createRegistry`, plus an `executeTool` stub with its spec.

Tests use vitest (`npm test`). Pending: `executeTool`, which Bhavya implements against 10 spec tests.

**Why this approach:** One Zod schema per tool is the single source of truth. It generates the JSON Schema the model sees *and* validates what the model sends back, so the two can't drift apart. Runs return a `status` instead of throwing, because the orchestrator needs to know *how* a run failed to choose a fallback, and the audit log must record failures too. `SessionSnapshot.source` records whether state came from the client (untrusted) or a server replay (trusted). That lets us ship M1 on client snapshots without hiding the weakness.

**How it actually works:**
- *Input vs output schemas.* A Zod schema describes two shapes. `z.number().default(3)` is optional in what the model *sends* (input) but always present after parsing (output). Tools are described to the model with `io: 'input'`, and run with the parsed data.
- *Tool-call arguments arrive as a JSON string*, not an object. Parsing can fail, which is a different failure from "parsed but wrong shape". `ToolErrorKind` separates the two so evals can count how often each model makes each mistake.
- *`server-only`* makes the build fail if a client component imports agent code, which would leak prompts and keys into the browser bundle. It throws outside Next's server build, so tests alias it to an empty module.

**Gotchas:**
- vitest 5 requires `@types/node` 22 or newer; we're on 20, so we used vitest 4.
- npm 10.9 crashed (`Cannot read properties of null (reading 'edgesOut')`) resolving vitest's optional peers. The obvious fix, `--legacy-peer-deps`, **silently broke the lockfile**: peers were left out, and `npm ci` in CI would have failed. We caught it by running `npm ci --dry-run`, and confirmed the committed lockfile was fine by testing it in a scratch directory. The fix: restore both files and install with npm 11 via `npx npm@11`. Lesson: after any dependency change, run `npm ci --dry-run` before pushing.
- `z.number().int()` puts ±9007199254740991 bounds into the JSON Schema. That's pure token noise on every request, so the converter strips it.

**Open questions:**
- Add `npm test` to CI now (it fails until `executeTool` exists) or after? (8.3)
- P1 is still on client snapshots. The switch to server replay waits on the P2 engine fixes.

---

## [2026-09-23] 1.3 (prep) — Model transport and a scripted fake model

**What we built:** `lib/agents/model.ts`:
- `ModelCaller`, a function type for one chat-completion call.
- `createGroqCaller`, the real implementation: request format, 429 key rotation, typed errors.
- `scriptedModel`, a fake that replays pre-written model turns and records every request.

There are 8 tests, none of which touch the network.

**Why this approach:** The ReAct loop depends on the *type* `ModelCaller`, not on Groq. This is dependency injection: the caller passes in the thing that talks to the model. Tests and evals can then script exact model behaviour, including the bad kind (broken JSON, unknown tools, never submitting), deterministically and for free. We rejected mocking `fetch` inside loop tests: that would tie the loop's tests to Groq's wire format, which is the transport's job and already has its own tests.

**How it actually works:**
- The transport makes *one* call and throws a typed `ModelCallError` (`rate_limited`, `tool_use_failed`, `http`, `network`, `aborted`, `bad_response`). Converting errors into a run `status` is the loop's job. The transport doesn't know what a "run" is.
- It returns the assistant message in two forms: *wire format*, to append to the conversation (tool results must follow the exact message that requested them, matched by `tool_call_id`), and *audit format* (`ModelStep`).
- Key rotation state is kept per caller, not in a module global as in V1's routes. That means tests don't leak state into each other.

**Gotchas:**
- Groq deprecated `max_tokens` in favour of `max_completion_tokens`. V1's routes still use the old name.
- `parallel_tool_calls` is only sent when explicitly set, because Groq lists the gpt-oss models as not supporting parallel calls.
- `tool_use_failed` (a 400 when the model emits a malformed tool call) is observed Groq behaviour, not in the API reference we read. It's classified by string match, which is fragile.
- The fake copies `messages` on each request, because the loop keeps appending to the same array after the call returns.

**Open questions:**
- Is the key rotation within Groq's terms? (8.4)

---

## [2026-09-23] 1.3 (spec) — Loop decisions, spec tests, and testing the tests

**What we built:** The 1.3 loop design was agreed as six decisions:
1. `tool_choice: required`, with a nudge on prose.
2. Submit wins within a turn.
3. One repair attempt for an invalid submit.
4. Submit is forced on the last step.
5. One run-wide timer.
6. Retry `tool_use_failed` once.

`react-loop.ts` holds the stub and spec; `react-loop.test.ts` has 16 tests against the fake model. `ToolChoice` now accepts a named tool.

**Why this approach:** Each decision closes one way the loop could end ambiguously, so "how does your agent terminate?" has an exact answer. The alternatives were: allowing prose answers (we'd have to parse free text), running every call in a turn even when one is a submit (wasted work and unclear ordering), and no forced final step (more `step_limit` failures that return nothing).

**How it actually works:**
- *Forced finalisation.* On the last allowed step, `tool_choice: {type:'function', function:{name:'submit_findings'}}` removes every option except answering. The model must turn whatever it has gathered into an answer. Graceful degradation: a partial answer we can validate beats no answer.
- *Racing a promise against a timer.* `AbortController.abort()` only *asks* code to stop; a promise that ignores the signal keeps running. So the loop races each await against a "timed out" promise. Whichever settles first wins, and the loser's result is ignored. Clearing the timer afterwards stops it firing later and keeping the process alive.
- *Testing the tests.* A spec test can be wrong: it can demand something impossible, or depend on an accident of one implementation. Before handing over the tests, we wrote throwaway reference implementations *outside the repo* and ran the real test files against them: 41/41 passed. So a failing test means a bug in the implementation, not in the test.

**Gotchas:**
- The run timer must reach tools as well as model calls. And because a tool can ignore its signal, the loop has to race tool execution too, not just pass the signal on.
- The submit call isn't a registry tool. It's validated against the agent's *output* schema, but recorded as a `ToolStep` so the audit trail shows every submit attempt, failed ones included.

**Open questions:**
- Do the nudge messages (prose reply, `tool_use_failed`) confuse the 8B model more than they help? Measure it in 2.7.
- Should a forced final step that still fails count as `step_limit` or `invalid_output` in the eval metrics? It's currently `invalid_output` if the submit was invalid, `step_limit` otherwise.

---

## [2026-09-23] 1.2 — executeTool: the trust boundary (1.2 complete)

**Authorship note:** Bhavya asked Claude to write this function, which waives the working agreement for this one piece. We designed rule 2 together (error kind, `args` handling, error message), and Bhavya chose the options. Claude wrote the rest. Bhavya should be able to answer the viva questions below before this counts as understood.

**What we built:** `executeTool` in `lib/agents/registry.ts`. It takes a raw tool call from the model and always returns a `ToolStep`, success or a classified failure, and never throws. All 10 spec tests pass.

**Why this approach:** It's a straight line of early returns, one per failure, in order of "biggest mistake first": wrong tool, then broken JSON, then wrong arguments, then the tool failing, then our own bad output. A small `fail(kind, message)` helper builds every failed step, so the six failure paths can't drift apart in shape. We rejected catching everything in one big `try` block because it would lose *which* thing failed, and that's exactly what the evals need to count.

**How it actually works:**
- *Success and failure kept apart.* `parseJson` returns `{ok: true, value}` or `{ok: false}`, not "the value or the raw string". `'"TCS"'` is valid JSON that parses to the string `"TCS"`, so checking `typeof x === 'string'` would call valid JSON broken.
- *Racing against a timer.* `Promise.race([tool.run(...), timedOut])` returns whichever finishes first. The timer also aborts the signal given to the tool (combined with the run's signal via `AbortSignal.any`), so a well-behaved tool can stop its work. The race is what guarantees we return on time even if the tool ignores the signal. `finally { clearTimeout }` stops the timer from firing later.
- *Sentinel values.* Timeout is signalled by a unique `Symbol`, not a string like `'timeout'`, so no genuine tool result can be mistaken for one.
- *Error messages are written for the model:* what went wrong, plus the valid options. For `invalid_output` (our bug), the message tells the model it isn't at fault, so it doesn't waste steps "fixing" arguments that were correct.

**Gotchas:**
- A tool that ignores its signal still keeps running in the background after we return. The race protects *our* latency, not the server's resources. It's fine for our in-memory tools; a real network or database tool must honour the signal.
- `args` is filled even for an unknown tool (we try parsing anyway), so the audit log always follows rule 9's single rule.

**Viva check (answer these without looking):**
1. Why look up the tool *before* checking the JSON?
2. Why does `Promise.race` still need `clearTimeout` afterwards?
3. What goes wrong if we run the tool with `parsed.value` instead of `input.data`?

**Open questions:** none new.

---

## [2026-09-23] 1.3 — The ReAct loop (1.3 complete)

**Authorship note:** Bhavya asked Claude to write this too. The six design decisions were agreed with Bhavya; the code is Claude's. Bhavya should be able to answer the viva questions below.

**What we built:** `runReactAgent` in `lib/agents/react-loop.ts`: the loop that calls the model, runs the tools it asks for, feeds the results back, and stops on a valid `submit_findings` call, the step limit, the run timeout, or an error. It never throws. 17 tests pass against the fake model. It has **not yet been run against the real Groq API**.

**Why this approach:** One `finish(status, output)` function is the only exit, so every ending clears the timer, sums the token usage, and returns the same `AgentRun` shape. The model call and each tool call race against one run-wide timer. We rejected a separate timeout per await, because separate budgets would add up past the run's limit.

**How it actually works:**
1. Build the registry and the tool list (every tool + `submit_findings`); start with `[system, user]` messages and start the timer.
2. Each step: call the model with `tool_choice: 'required'`. On the last step, force `submit_findings`.
3. Add the model's message to the conversation *unchanged*, then act on it:
   - no tool calls → nudge;
   - a submit → validate it: done, or one repair attempt;
   - otherwise → run each call with `executeTool` and add one `tool` message per call.
4. Out of steps → `step_limit`.

**Gotchas:**
- **Every tool call must be answered.** The OpenAI/Groq format rejects a request if any `tool_call_id` from the previous assistant message has no `tool` reply. So when a turn has an invalid submit *plus* other calls, the skipped calls still get an "ERROR (skipped)" reply. The first spec missed this; a fake model doesn't enforce the rule, so only a test written for it catches it. That test now exists.
- `continue` after a nudge still counts toward `maxSteps`, because the `for` loop's counter advances. That's intended: nudges cost a real model call.
- The `messages` array is mutated in place. That's fine for the real transport, which serialises it immediately, but it's why the fake model copies it on each request.
- Shell tip from this session: a `sed` replacement containing `/` fails with "unknown option to `s'", and `&&` then skips every later command in the chain. Check what actually changed before retrying.

**Viva check:**
1. Name the four ways the loop can end, and the `status` each one produces.
2. Why is `submit_findings` a tool rather than a normal text answer?
3. What would break if we didn't reply to the skipped tool calls?
4. Why force `submit_findings` on the last step, and what's the risk?

**Open questions:**
- First live run against Groq, with the 8B model vs `qwen/qwen3.8-27b`. How often do nudges, repairs and `tool_use_failed` actually happen? (2.7)
- The nudge wording is untested on real models.

---

## [2026-09-23] 1.3 (live) — First run against real models

**What we built:** A live smoke test, `lib/agents/research.live.test.ts`, run with `npm run test:live`; it's excluded from `npm test` and CI. It runs our loop on real COV-20 data with two throwaway tools and three models, and prints each trace plus a grounding check. `AgentRun` gained an `error` field. The trace is saved in `docs/evidence/`.

**Why this approach:** Everything before this was proven only against a fake model. A fake shows the loop handles the behaviours *we imagined*; a real model shows behaviours we didn't. This run found five problems that no offline test could have found.

**What the real models did:**

| Model | Status | Time | Tokens | Notes |
|---|---|---|---|---|
| `llama-3.1-8b-instant` | error | — | — | **404, not available on this key** |
| `qwen/qwen3.8-27b` | ok | 2.8 s | 4.0k + 0.7k | 2 tool calls in one turn; **read future prices**; one number bound to the wrong claim |
| `openai/gpt-oss-20b` | ok | 5.4 s | 2.1k + 0.7k | narrow, sensible windows; one approximation ("near 1150") flagged |

Both working models chose the same tool calls on both runs (temperature 0.2).

**How it actually works (what each finding teaches):**
- **Look-ahead leakage.** qwen asked for minutes 95→375 and reported the closing price, *after* the decision it was explaining. In a replay sim, any tool that can see beyond "now" leaks the outcome, which breaks the premise and makes feedback hindsight-biased. Fix belongs in the tools (2.4): every data tool caps its window at `session.simMinute`. The prompt can't enforce this; the tool can.
- **Grounded ≠ correct (binding errors).** qwen wrote "fell 7.91% vs previous close (from 1182.63 open to 1148.81)". Every number came from a tool, but 7.91% belongs to a different comparison than the two prices beside it (those give −2.86%). A per-number grounding check can't catch that. This is the *text* version of the cross-modal binding failure in the FinVQA-Chart motivation. Structured data removes misreading the chart, **not** mismatching facts. That's an honest limit for the M6 report.
- **Grounded ≠ true.** Both models repeated the "5% lower circuit" headline, which is faithful to our data, which may be historically wrong (AUDIT §1.4 #7). The check measures faithfulness to the tools, not truth.
- **Strict number matching flags approximations.** "near 1150" was flagged though it's a fair rounding of 1149.47–1152.21. The metric needs a tolerance, or the prompt must forbid rounding.
- **Test the checker too.** The first grounding check counted the model's own submitted answer as a source, so it could never fail. We caught it because `[]` for every model looked too good.

**Gotchas:**
- Provider docs go stale: the tool-use page listed `llama-3.1-8b-instant`, but the key can't use it. Check `GET /models` for the key you'll actually deploy with.
- Without `AgentRun.error`, the first failure showed only "error, 0 tokens". Always keep *why* a run failed.
- vitest's `mergeConfig` concatenates arrays, so a "live" config merged from the base inherited the rule excluding live tests. Override the fields instead.

**Open questions:**
- Research model: `gpt-oss-20b` (cheaper prompts, slower, narrower) or `qwen3.8-27b` (faster, broader, leaked the future)? Decide in 2.7 on the eval set, once tools clamp to `simMinute`.
- Should the grounding metric compare numbers with a tolerance, and can binding errors be checked at all without an LLM judge?
- V1 is likely broken in production (P7). Fixing it is your change to make in the ORUS routes.

---

## [2026-09-23] 1.4 — The orchestrator (1.4 complete)

**Authorship note:** Bhavya approved the design (five decisions); Claude wrote the code, as with 1.2 and 1.3.

**What we built:**
- `lib/agents/pipeline.ts`: `runPipeline(claimedEvent, snapshot, deps, budget)` runs Monitor → Research → Coach for one decision event and returns a `PipelineRun` recording the path taken (`full` / `monitor_only` / `template` / `rejected`), all runs, notes and timings.
- `lib/agents/coalesce.ts`: a browser-side helper that allows one pipeline at a time.

There are 15 tests, all with fake agents. ADR-002 records the decisions.

**Why this approach:** The pipeline is plain TypeScript with the agents *passed in*, so its control flow is testable without any LLM, the same dependency-injection idea as the fake model. The fallback ladder was chosen over "fail or retry" because a coaching product that sometimes shows nothing is worse than one that sometimes shows a simpler message.

**How it actually works:**
- *Graceful degradation.* Each rung needs less: `full` needs both agents; `monitor_only` needs only Coach; `template` needs nothing but the deterministic event. The run records which rung it landed on, so you can later *measure* how often each happens: a reliability metric for the report.
- *Re-checking the event.* The browser runs Monitor's rules to decide *when* to call the server. The server runs the same pure rules on its snapshot and uses its own result. Same code, run twice, is cheap insurance, but it's only as trustworthy as the snapshot. With `client_snapshot` it catches bugs and careless tampering, not a consistent liar.
- *Split budget.* Research's cut-off is `deadline − coachReserve`, not "whatever it needs", so a slow Research eats its own time, never Coach's.
- *Coalescing* (latest wins): while busy, a new event replaces any waiting one. Dropped events are still known to Monitor; they just get no AI feedback.

**Gotchas:**
- **Serverless has no shared memory.** Each request may hit a different short-lived instance, so "one pipeline per session" can't be a server variable. It lives in the browser (the one place a session persists), and server-side rate limiting is still needed (8.4).
- **Mutation testing.** Passing tests prove little if they'd also pass on broken code. We broke the pipeline three ways (ladder always `full`, no deadline race, no server re-check); each time 2–3 tests failed. Then we restored the file and checked it was byte-identical.
- Groq can't stream strict structured output, so Coach's feedback arrives whole. The UI needs a waiting state (7.5).

**Viva check:**
1. Walk through what the user sees when Research times out.
2. Why can't coalescing live on the server here?
3. What does the server re-check protect against today, and what doesn't it protect against?

**Open questions:**
- Real Monitor rules (2.1) and the Coach output schema (2.5) replace the fakes.
- Where the pipeline is exposed (an API route) and how the client sends snapshot + event is part of 2.x/3.x wiring.
- Values for `deadlineMs` and `coachReserveMs`: measure in 1.7. The live run suggests Research ~2–5 s.

---

## [2026-09-23] 1.5 — Structured output: constrained decoding + validation (1.5 complete)

**Authorship note:** written by Claude at Bhavya's request (same pattern as 1.2–1.4).

**What we built:**
- `lib/agents/single-shot.ts`: `runSingleShot`, one LLM call with no tools. The output is enforced twice: by Groq's strict `json_schema` mode, then by our Zod check, with one repair attempt.
- `zodToStrictSchema` in `groq-tools.ts`: rejects schemas strict mode can't express.
- `response_format` support in the transport.
- `run-support.ts`: shared deadline and usage helpers, now also used by the loop.

12 new tests; 69 in total. Checked live on two models.

**Why this approach:** Constrained decoding and validation catch *different* failures, so we use both. We rejected "strict mode alone": it doesn't enforce our Zod refinements (e.g. `min(10)` on a string is checked by Zod; whether Groq enforces `minLength` isn't documented) and can't prevent truncation. We rejected "Zod alone": without constraints, a small model's structure errors cost a repair round-trip every time.

**How it actually works:**
- **Constrained decoding.** When generating each token, the provider masks out every token that would make the output break the schema. The model *can't* produce a missing required field or a wrong enum value. Structure is guaranteed; content (is the message sensible? is it long enough?) isn't.
- **Why strict mode needs every field required.** The decoder must know at each point which keys may come next. "Maybe present" fields make that ambiguous, so strict mode bans them. The equivalent is `.nullable()`: the key is always there, and its value may be `null`. `zodToStrictSchema` throws on `.optional()` *when the agent is defined*, naming the field and the fix, instead of every live call failing with a 400.
- **Input vs output view, again.** Tool schemas use Zod's *input* view (what the model sends; defaulted fields are optional). Structured outputs use the *output* view (what we get back; defaulted fields are present). `default` keywords are dropped for strict schemas.
- **Truncation is named.** If `finish_reason` is `length`, the error says the reply was cut off by the token limit, so the audit log points straight at `maxTokens`.

**Live check:** `gpt-oss-20b` answered in 567 ms and `qwen3.8-27b` in 711 ms. Both were valid first time, and Groq accepted `enum`, `nullable`, `minLength` and `maxLength` in strict mode. Evidence is in `docs/evidence/2026-09-23-live-single-shot.txt`. What the answers *said* matters for 2.5:
- gpt-oss advised "consider using a stop-loss", but stop-losses don't execute in the engine (AUDIT §1.4 #1). The Coach would be recommending a broken feature.
- qwen stated unsourced market generalisations ("often locks in the worst price", "wait 5–10 minutes"). The Coach needs a rule: no market facts beyond its inputs.

**Gotchas:**
- vitest hides `console.log` from passing tests unless you use `--reporter=verbose`. One live run was wasted learning that.
- Refactoring the loop onto `run-support.ts` was safe *because* its 17 tests existed: change, run, all green.

**Viva check:**
1. What does constrained decoding guarantee, and what doesn't it?
2. Why does strict mode forbid optional fields, and what do you use instead?
3. Why validate with Zod when the decoder is already constrained?

**Open questions:** none new. The Coach's content rules belong to 2.5.

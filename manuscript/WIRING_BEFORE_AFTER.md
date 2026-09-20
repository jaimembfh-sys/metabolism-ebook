# Before / after — wiring the coach layer

**2026-09-20.** Commits `4df3151` (reconciliation), `9a7dc14` (wiring), `e441add` (rules promotion).

---

## The corpus

| | Before | After | Change |
|---|---|---|---|
| Chunks | 255 | 609 | +354 |
| Words | ~48,753 | ~107,879 | +59,126 |
| Bytes | 394,827 | 964,039 | +144% |
| Est. tokens | ~64,800 | ~143,500 | +121% |
| `safety_critical` chunks | 8 | 55 | +47 |
| `backend_reference` chunks | 0 | 354 | +354 |

Word retention through chunking was **100.00%** — 59,126 words in, 59,126 out.

## What became visible to the coach

Presence probes against `protocol-corpus.json`:

| Probe | Before | After |
|---|---|---|
| `prohibited` | absent | **PRESENT** |
| `coach rule` | absent | **PRESENT** |
| `course conflict` | absent | **PRESENT** |
| `disordered eating` | absent | **PRESENT** |
| `randle cycle explains a single-meal` | absent | **PRESENT** |
| `sglt2` | absent | **PRESENT** |
| `statin` | present¹ | PRESENT |

¹ "statin" matched before only because the word appears in lesson prose. The §10.4 *rule* about statins was absent.

All of **§10.1–10.7 survived intact**, including 10.3 (marked CRITICAL) and 10.4 (the statin and individualized-CV-risk prohibitions). This was the explicit hard requirement in `TASK_PROMOTE_PROHIBITED_CLAIMS.md`.

## Excluded, with reasons

| File | Reason |
|---|---|
| `Lesson_04_Coach_Depth.md` | Explicitly superseded by `Chapter_04_Complete.md:5`. Ingesting it would put retired mitochondria guidance back in front of the coach. |
| `Protein_Section_Course_Copy.md` | Reader copy misfiled into `coach-reference/`. Its own header says "Paste-ready course copy," primary home Lesson 9 — which already carries it. |
| `Chapter_15_Coach (1).md` | Byte-identical duplicate. Deleted. |

## The rules layer

`knowledge-base/coach-rules.json` — 46 prohibited claims, 5 conditional safety behaviours, 9 escalation triggers, 11 live course conflicts. **~1,531 tokens**, injected above the corpus in `callClaudeChat`/`callClaudeTool` for `chat`, `protocol` and `meal_plan`. Fails closed.

## Verification status

The four-part test from `CORPUS_WIRING_PLAN.md` §3:

| Step | Status |
|---|---|
| 1. Presence | **Done.** All 8 fixtures' guarded material confirmed in both corpus and rules. |
| 2. Elicitation | **Fixtures written** (`knowledge-base/coach-fixtures.json`), not executed. |
| 3. Adversarial | **Fixture written** (`adversarial-statin-pressure`), not executed. |
| 4. Regression | Not built. Needs 2–3 working first. |

Steps 2–4 make billable API calls against the live coach and have not been run.

---

# ⚠ Two things to decide

## 1. The corpus is now ~143K tokens per call

`buildProtocolCorpusText` maps **every** chunk into the prompt — there is no retrieval step. Three features send the whole thing: the Protocol Builder, the Meal Planner, and the Lab Markers tool. The general chat does **not**, which is what keeps this survivable.

On Haiku 4.5's 200K window that leaves roughly 57K for the user turn plus output. It works, but the headroom is thinner than it looks, and the plan's own §3 warning applies: *"A 100K undifferentiated block dilutes attention."* We are now 43% past that number.

Options, cheapest first:

- **Do nothing.** Prompt caching absorbs most of the cost while the block stays byte-identical across users. It currently does.
- **Filter by layer at the call site.** Give `buildProtocolCorpusText` an option to drop `backend_reference` chunks for features that don't need them — the Meal Planner arguably doesn't.
- **Add real retrieval.** Embed and select the top ~40 chunks per call. Biggest win, biggest job.

The rules layer is unaffected either way — 1,531 tokens is noise.

## 2. Cost per call roughly doubled

Haiku 4.5 input is $1.00/MTok, cache read $0.10, cache write $1.25.

| | Before | After |
|---|---|---|
| Cache hit | ~$0.0065 | ~$0.0143 |
| Cache miss | ~$0.065 | ~$0.143 |
| Cache write | ~$0.081 | ~$0.179 |

Cache writes happen on every corpus rebuild and after TTL expiry, so rebuilding frequently is now more expensive than it was.

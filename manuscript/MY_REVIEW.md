# MY_REVIEW — everything waiting on Jaime

Generated 2026-09-18 against commit `86cb2bd`.
**No suggested wording anywhere in this file, by instruction.**

Eleven items. Each gives the line number, what it says now, and what is wrong
with it. Nothing here has been changed and nothing will be until you write it.

---

# A. Reversion orphans (R-1 … R-7)

All Claude-authored prose was reverted to your original text. Seven of those
reversions restore a sentence that points at something a correction removed.
Reverted anyway, as instructed.

## R-1 — `index.html:1291`

**Now:** "The Randle Cycle explains more than just what happens inside a single meal. It also explains why the exact same diet can produce wildly different results in two different people."

**Wrong because:** the box directly above is now your A7 ("Why Pizza Is Different"), which never mentions the Randle Cycle. "Explains more than just" refers back to an explanation that is no longer on the page.

## R-2 — `index.html:1311`

**Now:** heading, "Exercise and the Randle Cycle"

**Wrong because:** same. Under A7, the Randle Cycle appears nowhere in Lesson 9's body.

## R-3 — `index.html:1312`

**Now:** "Exercise adds another layer to this same competition."

**Wrong because:** "this same competition" refers to the fat-versus-carbohydrate fuel competition the pre-A7 text described. A7 describes cells congesting when both fuels arrive at once — not a competition.

## R-4 — `index.html:1329` — Lesson 9 summary bullet

**Now:** "Combining high refined carbohydrates with high fat in the same meal creates a metabolic traffic jam that forces the body to lock fat into storage."

**Wrong because:** A7 removed the traffic-jam framing from Lesson 9's body, and your A3 moved that mechanism to Lesson 4 under the name metabolic gridlock. This bullet is now the only place in Lesson 9 that says "traffic jam."

## R-5 — `index.html:2076` — Lesson 17 summary bullet

**Now:** "HIIT triggers Excess Post-Exercise Oxygen Consumption (EPOC), keeping the metabolism significantly elevated for hours after the workout ends."

**Wrong because:** your REFINE 3 body copy is live two screens above and says the afterburn is "a modest bonus rather than the main event," buying "a small amount of extra energy expenditure afterward, not hundreds of calories." Body and bullet contradict each other.

## R-6 — `index.html:2077` — Lesson 17 summary bullet

**Now:** "Just 15 bodyweight squats immediately after meals forces the largest muscles in the body to rapidly absorb blood glucose — more effectively than 30 minutes of steady-state walking."

**Wrong because:** your REFINE 1 body copy is live and says "it isn't that squats beat walking — it's that frequent short bouts beat one long session." Body and bullet contradict each other.

## R-7 — `index.html:2236` — Dietary Non-Negotiables

**Now:** "**Avoid the Traffic Jam (Randle Cycle):** Never combine heavy, refined carbohydrates with heavy fats in the exact same meal."

**Wrong because:** same as R-4. The traffic jam is now Lesson 4's gridlock, and the Randle attribution is what correction #1 set out to remove.

---

# B. Emphasis elements a correction never reached

These were missed when the corrections were applied, because only `<p>` elements
were checked. All four carry a claim the body text has since corrected.

## P1-1 — `index.html:707` — Lesson 2 summary bullet

**Now:** "Even artificial sweeteners and the sight or smell of sweet foods can trigger an insulin response through the cephalic phase."

**Wrong because:** your §1.2 rewrite is live in the body and says the opposite — "most studies find no meaningful response" and "the simple version of the claim doesn't hold up." Lesson 2 contradicts itself between body and summary.

**The other two bullets in that block, for rhythm:**
- "Insulin acts as the master gatekeeper, determining whether incoming energy is burned for fuel or locked away in fat cells."
- "Chronically elevated insulin drives systemic inflammation, blocks leptin signaling, and increases risk of nearly every modern disease."

## `index.html:1747` — Lesson 15 pull quote

**Now:** "By deliberately restricting your salt on a healthy low-carb diet, you are biologically instructing your fat cells to grow larger — and can completely stall your metabolic progress."

**Wrong because:** your FIX 2 is live in the box and states the corrected mechanism — angiotensin II *blocks* new fat cell formation while aldosterone promotes expansion — and adds "the fat cell consequence is a well-supported inference rather than a proven human outcome." This pull quote states the retracted version with more certainty than the corrected box allows.

## `index.html:1871` — Lesson 15 summary bullet

**Now:** "Liberally salting food on a low-carb diet is essential — low insulin causes sodium loss, and the resulting hormonal response to replace it actively promotes fat cell growth."

**Wrong because:** same retracted mechanism, both hormones pushing the same direction. One screen from the corrected box.

## `index.html:2075` — Lesson 17 summary bullet

**Now:** "Resistance training is the single most important form of exercise for sustainable fat loss because muscle tissue drives your resting metabolic rate 24 hours a day."

**Wrong because:** your REFINE 2 is live in the body and replaced exactly this claim — the body now leads on muscle as a glucose sink, noting that carrying more muscle "does raise your resting energy needs" but that "the bigger reason is where your blood sugar goes."

---

# C. Still open from earlier, not yet decided

## P1-2 — `index.html:1291–1292`, Lesson 9 citations

Sentences 1, 2 and 3 and both blog citations were reverted to your original text at your instruction, so this is back to an open decision.

- **Source 1:** ScienceInsights, "What Fat Does Ketosis Burn First: Visceral vs. Stored"
- **Source 2:** incheckfit.com, "Does Keto Burn More Fat? What the Science Actually Says"

Sources 3, 4 and 5 are PMC papers and are fine. Three body sentences cite this
list at `1291`<sup>1</sup>, `1292`<sup>2</sup> and `1292`<sup>3</sup>, so removing
entries shifts every later superscript.

Research findings from the earlier session are in the transcript; §1.5 of
`Live_Course_Corrections.md` has your own note.

## P1-3 — resolved

Applied. Your ADD 5 box is live at `index.html:990` and the "bypass this system
almost entirely" sentence is deleted.

## The insulin absolutes — `INSULIN_ABSOLUTES_BRIEF.md`

Six instances at lines `660`, `662`, `665`, `830`, `1643`, `2233`. You said this
is a separate session. Full detail is in that brief; not repeated here.

## `#15` second instance — `index.html` Lesson 8

Both instances now read "stable." Your note in `Ch8_Additions_Consolidated.md:354`
says the claim also appeared "in a pull quote" — no pull quote carrying it was
found, so that part of your note may be stale.

---

# D. Everything else queued, unchanged

From the earlier queue, still open and not repeated in full here:

- **P1-4 follow-on** — "As advanced metabolic research extensively shows" at `index.html:1785`, flagged in §1.4 as overstated. Neither salt draft touches that paragraph.
- **Chapter 11** — `Chapter_11_Course.md` does not exist. `Ch11_Stomach_Acid_Revised.md` says it replaces "A5" in that file. Its own NOTE FOR YOU asks you two questions, one a safety decision about HCl titration.
- **Lesson 11 uric acid** — `Live_Course_Corrections.md:236` records it as absent from the fructose section. No drafted copy.
- **GLP-1 outcome data** — `Ch6_Additions.md` "STILL YOUR CALL" section: SELECT trial data, and "up to 9.09 times" / "up to 40%" at `index.html:1013`, which also breach your no-"up to" rule.
- **Pasture-raised beef** — "up to six times more nutrients," in your own verification backlog as a single-study claim to verify or soften.
- **`ABSOLUTES_SWEEP.md`** — 81 sentences, 11 of them in pulled-out elements.

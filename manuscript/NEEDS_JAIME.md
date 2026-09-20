# NEEDS JAIME — queued decisions

---

# QUEUED 2026-09-20 (overnight run 3)

## N-1 — The eating-disorder helpline number ⚠ SAFETY

**Found by running the fixtures for real.** The coach was handing a user reporting 700 kcal/day the **NEDA helpline, 1-800-931-2237** — the line your own coach corpus records as *permanently disconnected*.

Fixed in two layers (`6ca4224`), but **I deliberately did not supply a replacement number.** Your `AI_Coach_Knowledge_Corpus.md` §6.4 names the National Alliance for Eating Disorders without giving one, and inventing a number would repeat the original failure in a new form.

**What I need:** the verified current helpline number, or confirmation that you want the coach to name the organisation without a number and route to the user's own doctor. Right now it does the latter.

## N-2 — Lesson 2 summary bullet still asserts the sweetener claim

`index.html:757` reads *"Even artificial sweeteners and the sight or smell of sweet foods can trigger an insulin response through the cephalic phase."*

The body copy above it is now properly hedged (*"theorized… the research isn't settled"*). Body and bullet now contradict each other. This is why the Lesson 2 sweetener conflict flag is still live in the coach layer.

**Needs your words.** I have not touched it.

## N-3 — Three "up to" constructions, against your standing rule

- `index.html:1185` — *"up to 40% of the total weight lost is lean muscle mass"*
- `index.html:1269` — *"up to 9.09 times higher risk of pancreatitis"*, *"up to 40%"*
- `index.html:2880` — *"up to six times more key nutrients"*

**Needs your words.**

## N-4 — The paid tier can be unlocked from the URL ⚠ SECURITY

`index.html:5297`, the code's own comment says **"STOPGAP — NOT SECURE"**. `?metaburn_purchase_confirmed=1` grants permanent access on that device. Already live. Product decision, not a styling one, so I left it.

## N-5 — Both sales-page CTAs are still `mailto:`

Every buyer becomes a manual email thread. Needs the Shopify checkout URL.

## N-6 — Production model overrides

`.env` points protocol and meal_plan at Sonnet locally. **Production still runs Haiku.** Enabling them in the Netlify dashboard costs **10.8× per call** and, per the measured before/after, does not improve output. Your call.

## N-7 — Phase 1 colour convergence

`--ink` #1f2e35 (sales page) vs #2c3e50 (course body text). Still unpicked, so Phase 1 shipped pixel-neutral.

## N-8 — 65 inputs still need real `for` attributes

`scripts/a11y.js` wires them at runtime, which fails with JS disabled. The markup fix is mechanical but needs 65 individual edits under the Edit-only rule.

## N-9 — `manuscript/Chapter_15_Course (1).md`

Byte-identical duplicate, same as the coach one you had me delete. Left because you only named the coach file.

---

# REVERSION ORPHANS (2026-09-18)

All Claude-authored prose was reverted to Jaime's original text. Six of those
reversions restore a sentence that now points at something a correction removed.
**Reverted anyway, as instructed. Jaime writes these.**

## R-1 — `index.html:1291` — "The Randle Cycle explains more than just…"

**Now reads:** *"The Randle Cycle explains more than just what happens inside a single meal."*

**Incorrectly references:** the box above it is now your A7 ("Why Pizza Is Different"), which does not mention the Randle Cycle at all. The phrase "explains more than just" points back at an explanation that is no longer there.

## R-2 — `index.html:1311` — heading "Exercise and the Randle Cycle"

**Incorrectly references:** same. No Randle Cycle appears anywhere in Lesson 9's body under A7.

## R-3 — `index.html:1312` — "Exercise adds another layer to this same competition."

**Incorrectly references:** "this same competition" refers to the fat-vs-carbohydrate fuel competition that the pre-A7 text described. A7 describes cells congesting, not a competition.

## R-4 — `index.html:1329` — Lesson 9 summary bullet

**Now reads:** *"Combining high refined carbohydrates with high fat in the same meal creates a metabolic traffic jam that forces the body to lock fat into storage."*

**Incorrectly references:** A7 removed the traffic-jam framing from the body; `Chapter_04_Complete.md` A3 moved that mechanism to Lesson 4 and renamed it metabolic gridlock. The bullet is the only place in Lesson 9 that still says "traffic jam."

## R-5 — `index.html:2076` — Lesson 17 summary bullet (EPOC)

**Now reads:** *"…keeping the metabolism significantly elevated for hours after the workout ends."*

**Incorrectly references:** your REFINE 3 body copy now says the afterburn is *"a modest bonus rather than the main event"* and buys *"a small amount of extra energy expenditure afterward, not hundreds of calories."* Body and bullet now contradict.

## R-6 — `index.html:2077` — Lesson 17 summary bullet (squats)

**Now reads:** *"…more effectively than 30 minutes of steady-state walking."*

**Incorrectly references:** your REFINE 1 body copy now says *"it isn't that squats beat walking — it's that frequent short bouts beat one long session."* Body and bullet now contradict.

## R-7 — `index.html:2236` — Dietary Non-Negotiables label

**Now reads:** *"Avoid the Traffic Jam (Randle Cycle):"*

**Incorrectly references:** same as R-4 — the traffic jam is now Lesson 4's gridlock, and the Randle attribution is the thing correction #1 removed.

---


> **⚠️ 2026-09-18 13:17 — INCIDENT. `index.html` was destroyed by a bad command of mine
> and has NOT been restored.** The working copy is 207 MB of repeated garbage containing
> none of your content. Git's copy (commit `4b67ab9`) is intact at 817,682 bytes.
> Restoring it requires a permission I don't have — see `OVERNIGHT_REPORT.md` §0.
> **Every `index.html` line number below refers to the pre-damage file and will be
> valid again once it's restored.** No other file was affected.

---

## P1-5 — "Clinical biochemical data reveals" (queued at your instruction, not fixed)

**File:** `index.html:1785` (the salt box, second paragraph)

**Your live sentence:**

> **As advanced metabolic research extensively shows**, insulin causes the kidneys to retain sodium.

and, in the paragraph FIX 2 replaces:

> **Clinical biochemical data reveals** that elevated Angiotensin II and Aldosterone possess the direct, independent ability to stimulate fat cell growth.

**Why it's queued:** `Live_Course_Corrections.md` §1.4 says *"'clinical biochemical data reveals' overstates it. The direct sodium-restriction-to-adiposity evidence is in genetically modified mice. The adipose RAAS mechanism is well characterized, largely in cell and animal models."* `Chapter_15_Course.md:93` says the same.

FIX 2 replaces the sentence containing "Clinical biochemical data reveals", so **that instance goes away when FIX 2 is applied.** But *"As advanced metabolic research extensively shows"* is in an earlier paragraph that neither draft touches, and it's the same species of unsourced authority claim.

**What I need:** whether that phrase stays, and if not, your replacement wording. Not fixing it.

Overnight run of 2026-09-17 → 18. Each item is blocked because resolving it
would require writing words in your voice. Nothing below has been guessed at.

Priority order: P1 items leave a live contradiction on the page right now.
P2 items are inconsistencies a reader is unlikely to hit. P3 is housekeeping.

---

## P1-1 — Lesson 2 summary bullet now contradicts the corrected text

**File:** `index.html:707`
**Correction:** #3, Lesson 2 cephalic phase (applied)

**Your live bullet says:**

> Even artificial sweeteners and the sight or smell of sweet foods can trigger an insulin response through the cephalic phase.

**Why it's blocked:** the corrected section now says the opposite — *"most studies find no meaningful response"* and *"the simple version of the claim doesn't hold up."* The summary bullet still asserts the retracted claim, so Lesson 2 currently contradicts itself between body and summary.

`Live_Course_Corrections.md` §1.2 supplies replacement copy for the section but says nothing about the summary bullet.

**What I need:** one replacement bullet in your words, matching the style of the other two bullets in that block. I could stitch one from sentences already in your new copy ("The insulin worry is probably overblown", "Better than sugar. Not the same as water.") but choosing which sentence represents the lesson is an editorial call about your content, so I've left it.

---

## P1-2 — Lesson 9 weak citations: correction offers two options, supplies neither

**File:** `index.html:1330-1331` (sources list), body sentences at `1282` and `1283`
**Correction:** #4, `Live_Course_Corrections.md` §1.5 — **not applied**

**Your live sources 1 and 2:**

> 1. ScienceInsights, "What Fat Does Ketosis Burn First: Visceral vs. Stored"
> 2. incheckfit.com, "Does Keto Burn More Fat? What the Science Actually Says"

Sources 3, 4 and 5 are PMC papers and are fine.

**Why it's blocked:** §1.5 says *"replace 1 and 2 with primary sources, **or** cut the sentences they support."* Both branches need input I don't have — I can't invent citations, and cutting sentences is removing your copy.

**The renumbering trap.** These aren't decorative. Three body sentences carry superscripts tied to this list:

- `1282` — *"…prioritizes the fat sitting in your bloodstream from your last meal before it will touch what's stored on your hips, waist, or thighs."*<sup>1</sup>
- `1283` — *"This is why some people can eat generously on a ketogenic diet…and still lose weight steadily."*<sup>2</sup>
- `1283` — *"Their bodies are simply better at burning what's freshly eaten than what's already stored."*<sup>3</sup>

Deleting entries 1 and 2 shifts every later superscript, so <sup>3</sup>, <sup>4</sup> and <sup>5</sup> would all point at the wrong paper. Whatever you choose, the renumbering has to be done in the same pass.

**Also flagged in §1.5, not acted on:** you note the framing *"Research shows your body actually prioritizes the fat sitting in your bloodstream…"* is *"stated more definitively than the cited papers support"*, and that sources 3 and 5 are about fat oxidation rates and exercise rather than a strict storage hierarchy. That's a wording change to your sentence, so it needs your words.

**What I need:** either two replacement citations, or which sentences to cut — plus a yes on renumbering the remaining superscripts.

---

## P1-3 — Lesson 6 GLP-1 mechanism: no placement anchor, and the fix needs one of your sentences removed

**File:** `index.html:981`
**Correction:** #5, `Ch6_Additions.md` ADD 5 — **not applied**

**Your live sentence, inside a dark callout box:**

> Protein and healthy fats are the most potent natural stimulators of GLP-1. **Highly processed, rapidly digesting carbohydrates bypass this system almost entirely.** By prioritizing high-quality protein and natural fats at every meal…

Your own ADD 5 says this "runs backwards" — carbohydrate *is* a potent GLP-1 trigger, which is why the incretin effect exists — and supplies replacement copy ("Why Whole Food Does This Better", the far-down-the-tract mechanism). `Lesson_06_Coach_Depth.md:52` carries the matching correction.

**Two reasons it's blocked:**

1. **ADD 5 is the only addition in `Ch6_Additions.md` with no `Placement:` line.** ADD 1 through ADD 4 all have one; ADD 5 doesn't. I don't know where in Lesson 6 the box goes.
2. **Adding the box without removing the wrong sentence makes the lesson contradict itself** two paragraphs apart — the same failure mode as the Lesson 2 summary bullet above. Your new box literally says *"you'll see it stated backwards"*, which reads strangely if your own preceding paragraph states it backwards. But deleting that sentence means cutting your copy, and the surrounding sentences don't close cleanly without it.

**What I need:** where the box goes, and what happens to the "bypass this system almost entirely" sentence — cut it, or replace it with wording you supply.

**Related, and explicitly yours:** `Ch6_Additions.md` ends with a section headed **"STILL YOUR CALL — the outcome data"**, covering the SELECT trial outcome data and the relative-risk-without-absolute problem (live error #5's other half, `index.html` "up to 9.09 times higher risk of pancreatitis"). You marked that undecided, so I've left it entirely.

---

## P1-4 — Lesson 15 salt mechanism: two drafts, and they differ

**File:** `index.html:1785` (the dark "Surprising Truth About Salt" box)
**Correction:** #10 — **not applied.** Your rule: two differing drafts, don't pick.

Your live text says *"elevated Angiotensin II and Aldosterone possess the direct, independent ability to stimulate fat cell growth"* — both hormones in the same direction. Both drafts agree that's the error (angiotensin II *inhibits* adipocyte differentiation while aldosterone promotes adipogenesis) and both fix it. They differ in wording:

| | `Live_Course_Corrections.md` §1.4 | `Chapter_15_Course.md` FIX 2 |
|---|---|---|
| Cross-ref | "from **Lesson 9**" | "from **Chapter 9**" (I'd normalize) |
| Inflation clause | "the energy **goes into existing ones, which inflate**, become inflamed, and turn insulin resistant" | "the energy **has to go into the ones you already have. They inflate**, become inflamed, and turn insulin resistant" |
| Confidence note | "A note on how confident to be here**:**" | "A note on how confident to be here**.**" |
| Same note | "What's solid is that **sodium restriction** on a low-insulin diet…" | "What's solid is that **restricting sodium** on a low-insulin diet…" |
| Closing | "a well-supported inference**, not** a proven human outcome" | "a well-supported inference **rather than** a proven human outcome" |
| Bold emphasis | lighter | heavier throughout |

**And `Chapter_15_Course.md` carries a FIX 3 that `Live_Course_Corrections.md` doesn't have at all** — "ONE CAVEAT ON THE SALT ADVICE", placement *"immediately after the salt section."* If you pick the corrections-doc version, FIX 3 is orphaned; if you pick the chapter version, it presumably goes in too.

**What I need:** which draft, and whether FIX 3 goes in with it.

**Note:** your live box also contains "As advanced metabolic research extensively shows" and "Clinical biochemical data reveals" — §1.4 says the latter *"overstates it."* Neither draft's replacement copy covers the earlier paragraphs of that box, so those phrases survive whichever you choose. Flagging in case you want them addressed in the same pass.

---

## P2-1 — Lesson 5 "permanently": two drafts, and one asks you to choose

**File:** `index.html:878` (body) and `index.html:883` (Key Insight box)
**Correction:** #11 — **not applied**

Your live text says regular cold exposure can *"permanently* raise your resting metabolic rate."

| `Live_Course_Corrections.md` §1.6 | `Ch5_Additions.md` "ONE WORD" |
|---|---|
| Replace with: *"can increase brown fat activity and modestly raise resting energy expenditure, for as long as the exposure continues."* | *"**Progressively**" or just "**raise**" closes the only opening. **Your choice entirely**, and nothing else in that section needs touching.* |

Two different fixes, and the second explicitly defers the choice to you. The coach layer (`Lesson_05_Coach_Depth.md:151`) says the coach should say *"while the practice continues"* — closer to the corrections-doc version.

**What I need:** which wording, and confirmation it applies to both the body instance and the Key Insight box.

**Worth noting:** §1.6 adds that your *"A Note for Women"* section directly below is *"one of the best-calibrated passages in the course"* and should stay exactly as written. I haven't touched it.

---

## P2-2 — Lesson 17 squat claim: one draft defers to you, the other supplies full copy

**File:** `index.html:2024` (body), `index.html:2040` (summary bullet), `index.html:2211` (Dietary Non-Negotiables)
**Correction:** #12 — **not applied**

Your live Key Insight says 15 bodyweight squats after meals absorb glucose *"more effectively than 30 minutes of steady-state walking."*

- **`Live_Course_Corrections.md` §1.6:** *"that specific head-to-head comparison needs a citation. **Not verified in this session — flagged for you to source or soften.** If the source is a single small trial, say so."*
- **`Chapter_17_Course.md` REFINE 1:** supplies a complete replacement box ("The Squat Snack") with the refinement that *"it isn't that squats beat walking — it's that frequent short bouts beat one long session"*, plus the every-30-minutes dosing and a protein-utilisation bonus finding.

Not a wording difference — one document defers the decision to you, the other resolves it. `Chapter_17_Coach.md:73` carries the matching coach refinement, which suggests the chapter draft is the later thinking, but I'm not inferring that.

**What I need:** confirmation to use the `Chapter_17_Course.md` REFINE 1 copy. If yes, note it cross-references "Chapter 9" (I'd normalize to Lesson 9) and that `Chapter_17_Course.md` also contains REFINE 2 (muscle/metabolic-rate claim) and REFINE 3 (afterburn/EPOC) — both correcting live claims, neither yet applied or queued separately.

---

---

# CHAPTER RUN — QUEUED ITEMS (2026-09-19)

All 18 chapters applied. Two items could not be applied and are queued here.

## Q-1 — Chapter 6 ADD 3 contains an unfilled placeholder

**File:** `Ch6_Additions.md` ADD 3 — "Give the Absolute Numbers Too"
**Target:** `index.html`, Lesson 6 digestive-risk list (the 9.09x / 4.22x / 3.67x hazard ratios)

Your copy block reads:

> **And here's the context you need to interpret them.** These are large increases in risk for events that are **uncommon to begin with.** **[Insert absolute incidence rates.]** Both numbers matter.

**The absolute incidence rates were never supplied.** The whole point of the addition is to put the absolute numbers beside the relative ones, and the numbers aren't in the file. Not applied.

**Also relevant:** the Key Insight box in Lesson 6 still carries "up to 9.09 times" and "up to 40%", both of which breach your no-"up to" rule.

## Q-2 — Chapter 6 "STILL YOUR CALL" has no reader copy

**File:** `Ch6_Additions.md` — the SELECT outcome data

You asked to include the three items you'd marked undecided, and the other two (Ch3 OPTIONAL labs, Ch18 ONE OPTIONAL CLAUSE) both had copy blocks and were applied. **This one doesn't.** The section argues the case to yourself, lists the trial findings as notes, and offers one italicised sentence prefaced "Something like:". There is no finished passage to place.

Writing reader copy from those notes would be composing in your voice, so it's queued.

## Chapter 11 — skipped as instructed

`Chapter_11_Course.md` does not exist. `Ch11_Stomach_Acid_Revised.md` was not applied.

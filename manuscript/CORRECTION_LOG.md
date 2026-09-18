# Correction log — *How Your Body Burns*

> **⚠️ 2026-09-18 — corrections #1, #2 and #3 below were applied and verified, then LOST
> when `index.html` was destroyed by a bad command. They are fully re-appliable (all
> replacement text is in `manuscript/` or in the session transcript) but are NOT currently
> in the file. See `OVERNIGHT_REPORT.md` §0.**

---

## Live-error tracker

The tracker was `Live_Course_Corrections.md` §4 "Revised priority order." Three corrections
live in chapter files and were never on it — added here 2026-09-18 at Jaime's request.

| # | Lesson | Claim | Source | On original tracker? |
|---|---|---|---|---|
| 1 | 9 | "Cell cannot burn both fuels" + Randle misattribution | §1.1 | yes |
| 2 | 15 | 38% one-meal thermogenic claim | §1.3 | yes |
| 3 | 2 | Cephalic phase / diet soda | §1.2 | yes |
| 4 | 9 | Two blog citations among PMC papers | §1.5 | yes |
| 5 | 6 | GLP-1: "bypass this system almost entirely" | `Ch6_Additions.md` ADD 5 | **no** |
| 10 | 15 | Salt: both hormones same direction | §1.4 / FIX 2 | yes |
| 11 | 5 | Cold exposure "permanently" raises RMR | §1.6 / `Ch5_Additions.md` | yes |
| 12 | 17 | Squats beat 30 min walking | §1.6 / REFINE 1 | yes |
| **13** | **17** | **Muscle "largest source of your metabolism" / "dictates your RMR"** | **`Chapter_17_Course.md` REFINE 2** | **no** |
| **14** | **17** | **EPOC "significantly elevated for hours"** | **`Chapter_17_Course.md` REFINE 3** | **no** |
| **15** | **8** | **Energy "flat and stable throughout the entire day"** | **`Ch8_Additions_Consolidated.md` "ONE WORD"** | **no — newly found** |

**#15 was not previously known to either of us.** `Ch8_Additions_Consolidated.md:354` says your text claims energy stays *"flat* and stable throughout the entire day," in the body **and in a pull quote** — and notes there's a natural afternoon circadian dip that happens regardless of eating, which your own Lesson 15 covers. It offers *"Stable"* on its own or *"the rollercoaster stops"*, marked **"Your choice."** Two instances, like the Lesson 5 "permanently" fix. Queued by nature — it needs your pick.

Also worth noting: `Chapter_15_Course.md:93` and §1.4 both flag *"clinical biochemical data reveals"* as overstated — now queued as **P1-5**.

---

One entry per live-error correction applied. Source of truth for corrections is
`Live_Course_Corrections.md` unless a newer chapter draft is explicitly chosen.

---

## #1 — Lesson 9, the Randle Cycle (2026-09-17)

The published Randle Cycle section asserted that "the cell cannot burn both fuels simultaneously" and attributed a combination-meal storage emergency ("oxidative stress skyrockets") to the Randle cycle — the claim a knowledgeable reader was most likely to dismantle. Per Jaime's direction the fuel-partitioning mechanism was kept rather than dropped: the section now states that insulin raises malonyl-CoA, which inhibits CPT-1 and suppresses fat oxidation, while activating lipoprotein lipase to favour storage, so dietary fat arriving with a large refined-carb load is more likely stored than burned — with the explicit correction that "fat burning never stops completely." The supra-additive reward finding was added alongside as a separate answer to a separate question (why the food is hard to stop eating), not as a substitute. The gridlock mechanism moved to Lesson 4 as its own box, carrying a scope limit that gridlock is a chronic trait of insulin-resistant metabolism and that one mixed meal does not cause it. Three orphaned references created by the rename were repaired. Coach layer: the two Lesson 9 conflict-flag rows were retired to a dated Retired table in `Chapter_03_Backend_Coach.md`, the `Chapter_04_Backend_Coach.md` conflict block was rewritten as retired, and prohibited claim #32 was kept in force. Verified: "cannot burn both", "metabolic traffic jam", "oxidative stress skyrockets", and "Randle" all return 0 in `protocol-corpus.json` and in reader-facing `index.html`.

---

## #2 — Lesson 15, the 38% one-meal-a-day claim (2026-09-18)

The only genuine factual error in the course, and it appeared three times: the "One Meal a Day: The Thermogenic Advantage" box, the Lesson 15 Key Insight box, and the curriculum list on the `understanding-metabolism.html` marketing page. The figure traced to Tai, Castillo & Pi-Sunyer (*Am J Clin Nutr* 1991;54(5):783–787, PMID 1951147) — seven healthy young women, a 750 kcal load, thermic effect measured for five hours from meal start, with the final small portion eaten at 2.5 hours so roughly half its thermic response fell outside the window. A longer-window study found no difference in total 10-hour TEF, and whole-room calorimetry comparing 3 vs 6 meals/day found no difference in 24-hour energy expenditure, RQ, or fat oxidation. Applied the `Chapter_15_Course.md` FIX 1 draft at Jaime's direction, with "substantially" dropped in both places per his own coach-corpus caution against over-quantifying the circadian TEF effect (JCEM 2022;107(2):e708 confound). The box now leads on appetite rather than thermogenesis and closes on "Fewer meals, earlier in the day." Three items in this correction are Claude's wording, not Jaime's, and are flagged in `OVERNIGHT_REPORT.md`: the carried-forward caution sentence, the marketing bullet, and the coach-layer COURSE STATE stamps. Coach layer: Lesson 15 conflict-flag row retired, `Chapter_15_Coach.md` B1 rule re-stamped, corpus entry 3.5's false "removed from Lesson 9" note corrected. Verified: "38%", "Thermogenic Advantage", "One Meal a Day", "up to 38" all return 0 across `protocol-corpus.json`, `index.html`, and `understanding-metabolism.html`. PDFs and flyer confirmed clean via `pdftotext`.

---

## #3 — Lesson 2, the cephalic phase / diet soda claim (2026-09-18)

The published section stated that tasting a zero-calorie sweetener triggers an insulin spike, with diet soda as the worked example — the form and population where the evidence is most clearly negative. Jaime's §1.2 rewrite went in as written: the cephalic phase is retained as real (sham-feeding studies produce measurable insulin release), the overstatement is named directly, the negative findings for aspartame, saccharin and sucralose are stated, the one positive subset finding in people with overweight is retained as a hedge, and the section closes on the reward-system argument and a two-week self-test. Heading changed from "The Cephalic Phase: Why Tasting Sweetness Matters" to "The Cephalic Phase: When Anticipation Counts", both his wording. Coach layer: corpus entry 9.12 was already correct and now aligns with the lesson; prohibited claims 21, 22 and 23 from `Live_Course_Corrections.md` §5 were added to the 6.3 list verbatim, with a dated COURSE STATE stamp on #21 noting its embedded "the course needs updating" clause is now resolved; the Lesson 2 sweetener conflict-flag row was retired. One orphan could not be repaired from existing words and is queued as **P1-1**: the Lesson 2 summary bullet at `index.html:707` still asserts the retracted claim, so the lesson currently contradicts itself between body and summary. Verified: the old sentences return 0 in both `protocol-corpus.json` and `index.html`; the new text is present in the corpus. Claim does not appear in any other HTML page, PDF, or flyer.

---

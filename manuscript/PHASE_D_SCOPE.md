# Phase D — Adaptive protocol, with body fat and fat targets

**Status: scoped, not built. Nothing in this document has been implemented.**

Where this sits: the agreed build order is piece 0 (server-side identity) →
Phase F against existing data → Phase A (safety boundary) → Phase B (food
logging, text first) with Phase G groundwork → Phase C (photo logging) →
**Phase D** → Phase E (struggle check-in).

Phase D was already scoped as: notice when progress stalls, suggest a specific
adjustment, check carbs first and fat second, never lower fat for someone whose
carbs are not already genuinely low. This document adds the body-fat estimate
and the fat target to that scope, per Jaime on 2026-09-23.

---

## 1. Body fat estimate — tiered, best first

Record **which tier the number came from**, so the app knows how much confidence
to place in everything derived from it.

| Tier | Source | Confidence |
|---|---|---|
| 1 | DEXA scan result, if they have one | Highest |
| 2 | Smart scale that measures body fat | Good |
| 3 | Tape measure — US Navy method | Usable |
| 4 | Height and weight only | Fallback |

**Do not ask for BMI.** It cannot distinguish muscle from fat, and fat mass is
what this calculation needs.

### Open question — tier 3 is incomplete as specified

The US Navy formula differs by sex:

- Men: waist − neck, plus height
- **Women: waist + hip − neck, plus height**

Jaime's instruction listed waist, neck and height. That works for men and not
for women. Since the audience is predominantly women over 40, **tier 3 needs hip
circumference added** or it fails for most users.

### Open question — tier 4 is BMI under another name

Every height-and-weight-only body fat equation (Deurenberg is the standard) takes
BMI, age and sex as its inputs. There is no way to estimate fat mass from height
and weight that is not BMI underneath. Two honest options:

1. Keep tier 4, label it plainly as the low-confidence tier, and let the tier
   record carry the caveat.
2. Drop tier 4 and require a tape measure. A tape costs a few dollars and moves
   someone from "roughly wrong" to "usefully close."

Recommendation: option 2.

---

## 2. Fat target — the Alpert ceiling

Roughly **31 kcal per pound of fat mass per day** is the maximum rate at which
stored fat can supply energy. That sets how much room someone has to draw on
their own stores. It is why people with more fat mass can eat more fat and still
lose, while leaner people stall sooner.

### Caveats — these belong in the code comments, verbatim

```
Alpert's ceiling (~31 kcal/lb fat mass/day, from ~290 kJ/kg/day) is a
THEORETICAL model, not a measured constant.

 - Derived from the Minnesota Starvation Experiment: semi-starvation in
   lean young men, 1944-45. Applying it to a 52-year-old woman at 45%
   body fat is extrapolation well outside the source population.
 - Alpert later proposed a corrected figure nearer 22 kcal/lb. It was
   never republished, so it cannot be cited - but the gap between 31 and
   22 is the honest width of the uncertainty here.
 - Use 22 wherever the number protects the user (intake floors). Use 31
   only to describe a theoretical maximum.
 - It is a CEILING with real error bars, never a target and never a
   precise figure to show anyone.
```

---

## 3. Calories are internal, app-wide

Calories are used to derive the numbers. **The user never sees a calorie — only
grams of fat, carbs and protein.** This is app-wide, not conditional on the
disordered-eating flag.

Note for whoever writes the copy: fat grams × 9 plus protein × 4 plus carbs × 4
returns the calorie figure. Hiding it is correct; claiming it does not exist is
not. Do not write copy that makes that claim.

This interacts with the existing flag behaviour audited on 2026-09-24 — the app
currently suppresses calories and macros together in thirteen places, and has no
calorie-only suppression anywhere. Separating the two is prerequisite work.

---

## 4. Start generous

Higher fat at the beginning helps with hunger while someone shifts off carb
dependence. **Lowering fat is the lever pulled later**, only when someone stalls,
using the adaptive rule already scoped: check carbs first, fat second. Never
suggest lowering fat to someone whose carbs are not already genuinely low.

---

## 5. Worked examples

Assumptions used to produce these — **each needs Jaime's confirmation**:

- BMR via Katch-McArdle (`370 + 21.6 × lean kg`) for tiers 1–3, since it uses
  lean mass directly and is the right equation when body composition is known
- Activity multiplier 1.375 light / 1.55 moderate
- Protein at 0.9 g per lb of lean mass — **placeholder, no rule specified**
- Carbs at 35 g net baseline, raised for the training example
- Starting deficit = the lesser of half the conservative (22) ceiling, or 25% of
  daily need

| | A | B | C | D |
|---|---|---|---|---|
| | 52F, 5'4" | 45F, 5'6" | 40F, 5'5" | 38M, 5'10" |
| Weight | 210 lb | 165 lb | 135 lb | 175 lb |
| Body fat | 45% (tier 2) | 32% (tier 3) | 22% (tier 1) | 12% (tier 1) |
| Fat mass | 94.5 lb | 52.8 lb | 29.7 lb | 21 lb |
| Lean mass | 115.5 lb | 112.2 lb | 105.3 lb | 154 lb |
| Daily need | 2,065 | 2,020 | 1,928 | 2,914 |
| Alpert @31 | 2,930 | 1,637 | 921 | 651 |
| Alpert @22 | 2,079 | 1,162 | 653 | 462 |
| Ceiling binds? | No | No | Yes | Yes |

What the user would actually see — grams only:

| | A | B | C | D |
|---|---|---|---|---|
| **Fat** | 110 g | 108 g | **120 g** | **203 g** |
| **Net carbs** | 35 g | 35 g | 35 g | 75 g |
| **Protein** | 104 g | 101 g | 95 g | 139 g |

### What the examples show

**The leanest woman eats the most fat.** C is 75 lb lighter than A and gets 10 g
more fat. That is the Alpert logic working exactly as intended, and it is the
most persuasive output this feature produces.

**The ceiling does not bind for most of this audience.** At 45% body fat, A's
stores could theoretically supply 2,930 kcal/day — more than she burns. No
sane deficit exceeds it. The ceiling only governs below roughly 25% for women
and 15% for men. It is a safety rail that earns its keep as someone gets leaner,
not a driver of opening numbers for most users. The UI should not oversell it.

**The 31 vs 22 spread is wide.** For C it moves the intake floor from ~1,007 to
~1,275 kcal — a 27% swing on the number meant to protect her lean mass. Use 22
for floors. Erring conservative errs toward eating more, which is the safe
direction.

---

## 6. Open decisions — needed before building

1. **Add hip to tier 3**, or tier 3 fails for most users. (Section 1)
2. **Keep or drop tier 4**, knowing it is BMI-derived. (Section 1)
3. **Protein rule.** 0.9 g/lb lean mass is a placeholder. (Section 5)
4. **Activity level is not in the tiers.** Body fat gives BMR; daily need needs an
   activity input, whose error is probably larger than the body fat error. Needs
   its own intake question.
5. **Should a flagged user see a body fat estimate at all?** See below.

---

## 7. Disordered-eating interaction — unresolved, with the clinician

This feature computes, stores and displays a **body fat percentage** and an
intake target. For a user with the disordered-eating flag, a body composition
number is plausibly worse than a scale weight — the same measurement with a
sharper edge.

This lands on clinician question 6 in the review brief ("is *a flagged user is
never told to eat less of anything* correct, or too blunt?"). A sub-question
should be added to that brief before it is sent: **should a flagged user see a
body fat estimate at all?**

Until that comes back, Phase D's behaviour for flagged users is undecided, and
the safe default is that it does not run for them.

---

*Scoped 2026-09-23, written down 2026-09-24. Nothing built.*

# Phase D — Adaptive protocol, with body fat and fat targets

**Status: scoped, not built. Nothing in this document has been implemented.**

Where this sits: the agreed build order is piece 0 (server-side identity) →
Phase F against existing data → Phase A (safety boundary) → Phase B (food
logging, text first) → Phase C (photo logging) →
**Phase D** → Phase E (struggle check-in).

Phase F shipped early, on 2026-09-24 (commit `acb58b8`). Phase G, cross-user
learning, was **dropped from the roadmap entirely** on 2026-09-24 — that is where
the legal exposure sat, and no consent flow is being built. See
`CONSERVATIVE_DEFAULTS.md` section 4.

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
| 3 | Tape measure — US Navy method | Usable, and the minimum accepted |

**Do not ask for BMI.** It cannot distinguish muscle from fat, and fat mass is
what this calculation needs.

**A tape measure is the floor.** There is no height-and-weight-only tier. Every
such equation (Deurenberg is the standard) takes BMI, age and sex as its inputs,
so a fourth tier would be BMI under another name. Jaime dropped it on
2026-09-24. A user without a tape measure does not get a body fat estimate, and
Phase D's fat target does not run for them.

### Tier 3 — the US Navy formula differs by sex

Both forms are in inches, base-10 logs:

```
Men:    %BF = 86.010 × log10(waist − neck)
              − 70.041 × log10(height) + 36.76

Women:  %BF = 163.205 × log10(waist + hip − neck)
              − 97.684 × log10(height) − 78.387
```

**Women need hip circumference as well as waist and neck.** The first draft of
this scope listed waist, neck and height only, which works for men and fails for
women — most of this audience. Corrected by Jaime on 2026-09-24.

Measurement points matter more than the formula: waist at the navel, neck below
the larynx, hip at the widest point. The intake should say where to measure,
because a tape placed two inches off moves the result more than the choice
between tiers 2 and 3 does.

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
- **Protein at 0.9 g per lb of lean mass** — settled by Jaime 2026-09-24. On a
  low-carb protocol with a fat-mass-limited energy floor, protein is the lever
  protecting lean tissue; 0.9 sits where the preservation literature lands
  without crowding out the fat that "start generous" depends on
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

## 6. Activity level — new intake questions

Body fat gives BMR. Daily need needs an activity input, and its error is probably
larger than the body fat error, so the questions are designed to reduce
over-reporting rather than to be quick.

**Two principles.** First, ask about countable behaviour, never a self-label —
"moderately active" is the most over-selected option in every survey that offers
it. Second, separate daily life from planned exercise; people conflate the two,
and a nurse who never exercises outranks a desk worker who lifts twice a week.

### Q1 — daily life, outside exercise

> Outside of any exercise, how much are you on your feet on a typical day?

- Mostly seated — desk work, driving, not much walking
- A mix — on and off your feet through the day
- On your feet most of the day — teaching, nursing, retail, childcare
- Physical work — regular lifting, carrying or manual labour

### Q2 — planned exercise

> In a typical week, how many days do you set aside for exercise?

- None
- 1–2 days
- 3–4 days
- 5 or more days

### Q3 — kind of exercise (only if Q2 is not "None", multi-select)

> What does that usually involve?

- Walking
- Cardio — steady effort, breathing harder (running, cycling, classes)
- Intervals or HIIT — hard bursts with recovery between
- Weights or resistance training
- Something else

### Deriving the multiplier

The multiplier is composed from Q1 and Q2, never self-reported:

| Q1 base | | Q2 increment | |
|---|---|---|---|
| Mostly seated | 1.15 | None | +0.00 |
| A mix | 1.27 | 1–2 days | +0.06 |
| On feet most | 1.40 | 3–4 days | +0.11 |
| Physical work | 1.52 | 5+ days | +0.16 |

Range 1.15 to 1.68.

**Deliberately erring high rather than low.** An overestimate produces a more
generous fat target, which matches "start generous", and the stall detection
already scoped is the correction mechanism. An underestimate underfeeds someone
from day one, which the adaptive rule would not catch because they would appear
to be losing. Slow start is a better failure than under-eating.

Re-ask when Q1 or Q2 changes, and re-derive the targets. Activity is not a
one-time fact.

### Q3 does not match what the tracker records

The daily tracker's exercise categories are `resistance_training`, `cardio`,
`walking` and `other` ([index.html:4818](../index.html)). **There is no HIIT
category.** Phase D's carb rule distinguishes them — cardio burns more carbs
during, HIIT and weights burn more after, for recovery and repair — so the
tracker cannot currently supply the distinction the rule needs.

Adding `hiit` to the tracker select is a small change, but it is a change to a
live feature and needs Jaime's approval before it happens.

---

## 7. Open decisions — needed before building

1. **Should a flagged user see a body fat estimate at all?** With the clinician —
   added to the review brief as question 11 on 2026-09-24. (Section 8)
2. **Whether Phase D may tell a flagged user to lower anything.** Also with the
   clinician, as question 14. See `DE_FLAG_DECISIONS.md`.

Settled on 2026-09-24: tier 3 uses the correct women's formula, tier 4 is
dropped, the activity questions above are in scope, protein is 0.9 g/lb lean
mass, and `hiit` was added to the daily tracker (commit `09d398d`).

---

## 8. Disordered-eating interaction — unresolved, with the clinician

This feature computes, stores and displays a **body fat percentage** and an
intake target. For a user with the disordered-eating flag, a body composition
number is plausibly worse than a scale weight — the same measurement with a
sharper edge.

This lands on clinician question 6 in the review brief ("is *a flagged user is
never told to eat less of anything* correct, or too blunt?"). **A dedicated
question — should a flagged user see a body fat estimate at all? — was added to
that brief on 2026-09-24**, before it was sent.

Until that comes back, Phase D's behaviour for flagged users is undecided, and
the safe default is that it does not run for them.

---

*Scoped 2026-09-23, written down 2026-09-24. Nothing built.*

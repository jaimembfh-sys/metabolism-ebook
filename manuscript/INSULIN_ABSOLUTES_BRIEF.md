# Brief: the insulin absolutes

**Written 2026-09-18. Nothing here has been changed, and nothing should be changed
without a decision from Jaime.** This is core thesis framing, not a copy fix.

These six sentences make the same claim in different words: that insulin is not merely
the dominant regulator of fat storage and release, but an absolute gate — that storage
is impossible without it and release is impossible with it. Four of the six are already
covered by a live row on the conflict-flag table, which means the AI coach is currently
instructed to route around a claim the book states six times.

---

## The instances

### 1. `index.html:660` — body text, Lesson 2

> Yes, if we consistently take in excess energy, it can be stored as fat, but **ONLY if insulin is present.** At the same time, insulin does something equally important…

Capitalised "ONLY" in the source.

### 2. `index.html:662` — body text, Lesson 2

> Humans provide the most convincing evidence of all that **you cannot store fat unless insulin is elevated.** One of the more common eating disorders among…

This is the passage that continues into the diabulimia example — see the separate note below.

### 3. `index.html:665` — **PULL QUOTE**, Lesson 2

> **When insulin is elevated, your body is physically incapable of burning fat.** Fat burning is not a matter of willpower — it is a matter of hormonal chemistry.

### 4. `index.html:830` — **SUMMARY BULLET**, Lesson 4

> When mitochondrial function is impaired, the body shifts into conservation mode — **making fat loss physically impossible regardless of diet.**

Not strictly an insulin claim, but the same absolute-gate construction applied to
mitochondrial function, and it inherits the framing.

### 5. `index.html:1643` — **SUMMARY BULLET**, Lesson 13

> Nutrient deficiencies in magnesium, iodine, vitamin D, and selenium **can completely stall metabolism** despite eating a clean, whole-food diet.

Same construction again, applied to micronutrients.

### 6. `index.html:2233` — list item, Lesson 18 "Dietary Non-Negotiables"

> **Lower Insulin:** It is the master switch. **You are physically incapable of burning fat when insulin is high.**

Verbatim repeat of the pull quote at 665, in the book's summary recommendations.

---

## What the conflict-flag table says

`Chapter_03_Backend_Coach.md`, master table, active row:

| Lesson | Published claim | Corpus entry |
|---|---|---|
| 2 | Fat storage happens *only* with insulin; fat burning *physically impossible* at elevated insulin | Ch2 backend, Fix 1 |

That single row covers instances 1, 2, 3 and 6. Instances 4 and 5 are not on the table
at all — they are the same construction in different lessons and have never been flagged.

Related active row, same table:

| 2 | Insulin resistance develops first, hyperinsulinemia compensates | 9.7 |

Listed because it sits in the same passage and any rewrite of Lesson 2's insulin
section will run into it.

---

## What the coach is instructed to do instead

The table's standing instruction:

> Active conflicts between the published course and this corpus. **Until the course is
> revised, the coach answers from the corpus and does not cite the lesson on these points.**

So today, when a user asks whether they can burn fat while insulin is elevated, the
coach answers from the corpus and is specifically instructed **not to point them at
Lesson 2** — the lesson that makes the argument the whole course is built on.

The corpus position it answers from instead, in §6.3 prohibited claims:

> 1. "You can't burn fat and carbs at the same time" (1.2)

and §1.2, the entry that governs it:

> **It is reciprocal inhibition, not a binary switch.** Glucose and fatty acids
> reciprocally inhibit each other's oxidation… Original work in rat heart and
> diaphragm. Confirmed repeatedly since.

This is the same distinction that was applied to Lesson 9 in correction #1: fat
oxidation is *suppressed* at high insulin, continuously and substantially, but never
reaches zero. Respiratory quotient in a living human sits in the intermediate range,
which is direct evidence of mixed oxidation.

---

## Why this is a decision, not a fix

**The direction is right and the conclusion survives.** Insulin is the dominant
regulator of whether fat is stored or released, and lowering it is the lever the course
is built on. Nothing in the corpus disputes that.

**Only the absoluteness fails.** "Physically incapable" and "cannot" and "ONLY" are what
a knowledgeable reader can dismantle, and dismantling one of them is enough to make a
reader distrust the rest — which is the specific risk for a course positioned on
evidence over consensus.

**But it is load-bearing in a way the other corrections were not.** The Randle fix
changed a mechanism inside one section. This framing runs through Lesson 2's argument,
reappears as the first of the Dietary Non-Negotiables, and is the reason the course's
central instruction ("lower insulin") reads as non-negotiable rather than as a
strong default. Softening six sentences without weakening the thesis is a writing
problem, not a find-and-replace.

**One further item, flagged and not acted on.** `Live_Course_Corrections.md` §4, priority
item 9, raises the diabulimia passage at `index.html:662` separately:

> The physiology is correct and it's a genuinely compelling proof of concept. But it
> presents an eating disorder as a demonstration of a weight-loss mechanism, and some
> readers will take it as information rather than as illustration. **Worth a decision.**

That decision is still open, and it sits in the same paragraph as instance 2.

---

## Suggested order, if and when it is taken up

1. Decide the thesis sentence first — what replaces "physically incapable" as the
   one-line claim. Everything else follows from it.
2. Apply it to 665 (pull quote) and 2233 (Dietary Non-Negotiables) together; they are
   the same sentence in two places and a reader will see both.
3. Then 660 and 662, which are prose and can carry more nuance.
4. Retire the Lesson 2 conflict-flag row, keep the prohibited-claims entry.
5. Treat 830 and 1643 as a separate, smaller pass — same construction, different
   subject matter, not on any flag table.

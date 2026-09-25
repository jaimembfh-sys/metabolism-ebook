# Conservative defaults, pending professional review

**Decided 2026-09-24 by Jaime, without clinical or legal review, because neither
was affordable at the time.**

This document exists so that a clinician or a lawyer can pick it up later and see
exactly what was chosen and why. Every decision below was made in the direction
of *keeping* protections and *not* collecting data, on the reasoning that an
unreviewed loosening is worse than an unreviewed tightening.

Two companion documents hold the detail this one summarises:

- `DE_FLAG_DECISIONS.md` — all 26 disordered-eating flag behaviours, with code sites
- `PHASE_D_SCOPE.md` — the body fat and fat target work

The full clinical review brief was written and remains unsent. It contains 19
numbered questions and is the right starting point whenever a clinician becomes
available.

---

## 1. Screening — no scoring instrument at all

**Decision: do not implement SCOFF, adapted or otherwise.**

The earlier plan was to use SCOFF with an adapted threshold, because its
"one stone (14 lb) in three months" item fires on intentional weight loss and
would over-flag successful users of a weight-loss product.

**Reasoning for rejecting that:** an adapted instrument is not a validated
instrument. SCOFF's ≥2 threshold carries whatever sensitivity and specificity it
has *as published, administered by a clinician, in the populations it was
validated in*. Changing the item set or the threshold discards that without
producing anything defensible to put in its place. Choosing our own cut-off would
be inventing a screening tool, which is not a thing to do without a clinician.

**What is used instead — direct triggers, no arithmetic.** Any one of these stops
coaching outright:

| Trigger | Status |
|---|---|
| Any purging — self-induced vomiting, laxatives, diuretics, or exercise framed as compensation | **Added** 2026-09-24 |
| Loss of control described alongside large amounts | Already present as `escalation_triggers[6]` |
| Any self-harm or suicidal intent | **Added** 2026-09-24 |

On any trigger: stop coaching, give the paired eating-disorder resource in full,
do not problem-solve the eating. Self-harm routes to 988 instead, which can be
called or texted, 24/7.

Both new triggers live in `knowledge-base/coach-rules.json`, which is promoted
into the system prompt of every coach-facing call and fails closed if it cannot
be loaded.

### What a reviewer should know about the existing flag

The app already sets a `disordered_eating_signal` flag, and it predates this
decision. It is set by **any one** of three intake answers:

- a body image self-rating of 3 or below
- a declared history of an eating disorder
- "out of control eating" answered `often`

That is a set of direct disclosures rather than a scored instrument, so it is
consistent with the no-scoring decision above. **It is not a diagnosis and is
never shown or described to the user.** A reviewer may still want to rule on
whether those three are the right three, and whether a body image rating should
carry the same weight as a declared history.

---

## 2. Flag behaviours — groups B, C and D kept exactly as built

**Decision: change nothing. Do not unpick.**

The earlier proposal was that the flag should screen and refer and otherwise
leave the app alone. That would have meant restoring, for flagged users:

- the weight chart, the weight log, and rate-of-loss arithmetic (group B)
- progress photographs (group C)
- access to the core strict low-carb protocol and fasting patterns (group D)

**Reasoning for keeping them:** each of those removals was put there deliberately,
and the case for reversing them rests on a clinical judgement nobody qualified has
made. Restoring a weight chart to someone who disclosed a history of an eating
disorder is not a neutral act. The cost of leaving them in place is that some
users get a more cautious product than they needed; the cost of removing them
wrongly is borne by the most vulnerable users in the population. Those are not
comparable.

**Group D is the one most worth a reviewer's attention.** A flagged user
currently cannot be placed on the app's core protocol at all — `macro_approach`
is forced to `safe_starches` or `flexible` and `eating_pattern` to `rule_of_3s`.
That is either a serious safeguard or a serious product failure, and which it is
depends on an answer we do not have.

### Group C fixed as a defect — the only change made

Progress photos previously **vanished with no explanation**. The section removed
itself from the page entirely, so a flagged user had no way to know the feature
existed or why it had gone.

Whether photos should be withheld is open for review. That a silent
disappearance was the wrong way to withhold them is not. The section now keeps
its heading and shows an explanation in place of the body, mirroring the wording
already used for the weight chart.

`photoSurfacesHidden()` and `weightSurfacesHidden()` are deliberately separate
functions with identical current behaviour, because groups B and C are separate
questions and a reviewer may answer them differently.

---

## 3. Group A — macro and calorie suppression kept as built

**Decision: hold. Do not separate calories from macros yet.**

The earlier plan was to remove calorie figures for every user, app-wide, while
making grams of fat, protein and carbohydrate visible to everyone including
flagged users.

**Reasoning for holding:** the second half of that is a loosening, and the
question it turns on is genuinely open — if calories are removed because they
drive restraint scoring, it is not obvious that three other numbers in the same
place are safe. There is no calorie-only suppression anywhere in the app today;
all 13 sites suppress all four figures together. Separating them is new work, not
a toggle, so nothing is lost by waiting.

**Consequence worth recording:** `logged_macros` is never written for flagged
users, so a flagged user generates no carbohydrate data at all. Phase D's
adaptive protocol could therefore never run for them even if it were permitted
to. That follows from this decision rather than being a separate one.

---

## 4. Phase G — cross-user learning dropped from the roadmap

**Decision: removed entirely. Not deferred, removed.**

The plan was to analyse data across users to find what works, stratified by sex
and noting conditions, behind a separate opt-in consent.

**Reasoning:** that was where essentially all of the legal exposure sat. A
direct-to-consumer app holding self-reported medical history, body photographs
and free-text health conversations, then using them for secondary research, plausibly
engages the FTC Health Breach Notification Rule, Washington's My Health My Data
Act (which carries a private right of action), California's CMIA and CCPA, and
GDPR special-category rules for any EU user. Consent language for that is a
lawyer's work, and doing it from a template would be the worst of both worlds.

**What this means concretely:**

- No research consent flow is built
- No data is collected for it
- No de-identified event schema is written
- The existing data continues to serve only the individual user it came from

A later decision to pursue this would require the consent to be obtained
*before* the data is collected, so nothing is preserved in the meantime on the
assumption it might be usable later. That is the point: dropping it now avoids
accumulating data that could not lawfully be used.

---

## 5. What remains unreviewed

Anyone picking this up should treat the following as open, not settled:

1. Whether the three flag triggers are the right three, and whether a body image
   rating belongs among them
2. Whether the new purging and self-harm triggers are worded and scoped correctly
3. Group D — whether barring a flagged user from the core protocol is right
4. Group B — whether hiding the weight chart helps or merely withholds a tool
5. Group C — whether photos should be withheld at all, now that the silent
   disappearance is fixed
6. Group A — whether grams are safe to show once calories are gone
7. Whether a body fat estimate should be shown to a flagged user at all
   (`PHASE_D_SCOPE.md` section 8)
8. The course progress bar, which carries completion percentages and a
   celebration animation and is unaffected by the flag

The unsent clinical review brief covers 1 through 8 as numbered questions.

---

*Written 2026-09-24. Nothing here has been reviewed by a clinician or a lawyer,
and nothing here should be read as though it had been.*

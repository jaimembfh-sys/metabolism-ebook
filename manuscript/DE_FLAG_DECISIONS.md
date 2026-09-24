# Disordered-eating flag — what changes, and what Jaime decided

Audited 2026-09-24. The flag is set by any one of three intake answers: a body
image self-rating of 3 or below, a declared eating-disorder history, or
"out of control eating" answered `often`. Once set it is permanent on the
profile.

It currently does **two different jobs**: it routes a user toward help, and it
separately changes app behaviour in 26 places. Jaime's position is that it should
do the first job only. The clinician has been asked to rule on that
(review brief question 14).

---

## Group A — macro numbers (13 sites)

| # | Behaviour | Site |
|---|---|---|
| 1 | Meal plan `macros` **and** `macros_note` nulled, every meal | `coach-rules-lib.js:89`, mirrored `index.html:8378` |
| 2 | Meal-plan prompt instructs the model to null both | `index.html:6514` |
| 3 | Recipe nutrition hidden from the planner model itself | `index.html:6392` |
| 4 | Recipe-fit panel replaced with "deliberately withheld" | `index.html:11723` |
| 5 | Recipe `## Nutrition` section stripped from body text | `index.html:11729` |
| 6 | My Recipes review: calories, fat, carbs, fiber blanked | `index.html:10920` |
| 7 | My Recipes save drops macros from the payload | `index.html:11262` |
| 8 | Daily tracker macro entry row hidden | `index.html:7030` |
| 9 | Daily tracker macro inputs ignored even if submitted | `index.html:7174` |
| 10 | Daily totals replaced with a "focus on how meals feel" message | `index.html:7052` |
| 11 | `logged_macros` never written to the daily log | `index.html:6896` |
| 12 | Any sentence containing a gram figure dropped whole | `coach-rules-lib.js:40` |
| 13 | Five system prompts ban "macro gram targets" | `6499`, `7233`, `7396`, `8608`, `8904` |

**Decision: unpick.** Carbs, protein and fat visible to everyone; calories
removed app-wide. **Not built** — Jaime asked to hold until the clinician
answers, in case their answer changes it.

Note: there is no calorie-only suppression anywhere in the app. Every site
above suppresses all four figures together, so separating calories from macros
is new work, not a toggle.

---

## Group B — weight and body numbers (5 sites)

| # | Behaviour | Site |
|---|---|---|
| 14 | `target_weight` forced null | `7903`, `7913`, `10223`, `11990` |
| 15 | Coach never asks for or mentions a goal weight | `index.html:7840` |
| 16 | No lbs-per-week pace math | `index.html:7841` |
| 17 | Weight chart, log form and toggle hidden; safety note instead | `index.html:9202` |
| 18 | Fat-intake-vs-weight-trend chart hidden | `index.html:9202` |

**Decision: hold for the clinician.**

---

## Group C — a removed feature (1 site)

| # | Behaviour | Site |
|---|---|---|
| 19 | Progress photos section hidden entirely, nothing rendered in its place | `index.html:9664` |

**Decision: hold for the clinician on whether it stays hidden — but Jaime has
flagged the silent disappearance as a defect regardless.** Whichever way the
clinician rules, a section that vanishes with no explanation is confusing. If it
stays hidden it needs a note; if it becomes visible the defect disappears with
it. Cannot be fixed until that is known, so it is queued rather than open.

---

## Group D — the protocol itself (3 sites)

| # | Behaviour | Site |
|---|---|---|
| 20 | `macro_approach` **cannot be `strict_low_carb`** | `index.html:8608`, `8616` |
| 21 | `eating_pattern` **forced to `rule_of_3s`** | `index.html:8608` |
| 22 | `professional_guidance_note` always recommends a therapist or doctor | `index.html:8608` |

**Decision: hold for the clinician.** This is the highest-stakes group — a
flagged user currently cannot be placed on the app's core protocol at all.

---

## Group E — restraints on the AI, not the user (4 sites)

Jaime's decision: **apply all four to every user, not only flagged ones.** Two
were applied on 2026-09-24. Two could not be, for the reasons below.

| # | Behaviour | Status |
|---|---|---|
| 23 | Teaching mode: blood-sugar/whole-food framing, never weight-loss language, no body-focused pressure | **Split, applied** — see below |
| 24 | Never assert a psychological reason for someone's eating | **Applied universally** |
| 25 | *(as originally listed)* Troubleshooter may not suggest anything more aggressive | **Listed in error — left alone** |
| 25b | Never use restriction-flavored language | **Applied universally** |
| 26 | Stress check-in keeps food suggestions qualitative and non-restrictive | **Applied universally** |

All four decisions closed on 2026-09-24. Verified by rendering each prompt in
every state: teaching mode carries the body-pressure rule for both flagged and
unflagged users and the weight-loss-language rule only when flagged; the
troubleshooter carries the restriction-language rule in all three states, the
macro/weight rule only when flagged, and the staged-plan rule only on a staged
plan.

### 25 was an error in the original audit

The "never suggest something more aggressive than their current stage" rule is
gated on `hasStagedPlan`, **not** on the disordered-eating flag
(`index.html:7396`). It already applies to every user on a staged plan and has
nothing to do with the flag.

It matters that it was not universalised: applied to all users it would forbid
the troubleshooter from ever suggesting stricter carb reduction, which is
precisely what Phase D's adaptive rule exists to do.

The genuinely flag-gated tone rule at that site is *"never use
restriction-flavored language."* That one is safe to universalise and has not
been done yet, pending Jaime.

### 23 was split rather than universalised

The flag branch read: *keep teaching-mode content focused on blood sugar
regulation and whole-food eating, **never weight-loss language**, and avoid
body-focused pressure* (`index.html:7818`).

The "no body-focused pressure" half is safe for everyone. The "never weight-loss
language" half is not — applied universally it would strip weight-loss framing
from the educational content of a weight-loss product.

Jaime approved the split on 2026-09-24. Body-focused pressure is now barred for
every user; the weight-loss-language restriction stays flag-specific.

The old `else` branch was removed at the same time. It told the model what the
rules *would* be if this user were later flagged — a hypothetical instruction
that did nothing except cost tokens on every unflagged call.

---

## Open, pending the clinician

1. Groups B, C and D — which must stay flag-specific (brief question 14).
2. Group A — safe to show a flagged user grams of fat, protein and carbohydrate
   once calories are gone for everyone? (brief question 17).
3. Group C's silent disappearance — a defect either way, fix shape depends on 1.

Group E is closed. Nothing in it is waiting on anyone.

---

*Audited and recorded 2026-09-24. Group E fully applied; Groups A–D unchanged
and awaiting the clinician.*

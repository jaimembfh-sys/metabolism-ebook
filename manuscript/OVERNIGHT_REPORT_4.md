# Overnight report 4 — recipe / AI coach integration

**2026-09-22.** Thirteen commits, `ecb0b5b` through `8c9d05d`. All four phases complete. Nothing deployed. `ALLERGEN_TAGS_CONFIRMED` is still `false`.

**123 assertions, all green, no API calls.** Run `node tools/recipes/test-rules.js`.

---

## 1. Your five allergen decisions

All five applied, in `tools/allergens.js` and mirrored into `index.html`'s inline copy — so the live Protocol Builder gate changed too, as you said it should.

| # | Decision | Effect |
|---|---|---|
| 1 | tamari → soy, "tamari or coconut aminos" → soy-swappable | 7 recipes stay available to soy-allergic readers, carrying the swap |
| 2 | worcestershire → soy, brand-dependent | 2 recipes now say "check the label" |
| 3 | peanut → `PLANT_PREFIX` | 3 recipes stop reading as dairy |
| 4 | coconut/almond flour not gluten; almond flour still nuts | 4 recipes lose a wrong gluten tag |
| 5 | peanut stays under nuts | unchanged, now documented as deliberate |

### The full table — 13 of 43 changed (bold)

| Recipe | Was | Now |
|---|---|---|
| Avocado Egg Bake | — | (none) |
| **Beef and Broccoli** | (none) | (none) · soy-swappable |
| Big Mac Bowl | — | dairy |
| Cast Iron Ribeye with Garlic Mushrooms | — | dairy |
| Chicken or Beef Fajitas | — | (none) |
| Chickpea and Macadamia Hummus | — | nuts |
| Classic Chicken Salad | — | (none) |
| Classic Cobb Salad | — | dairy |
| Classic Deviled Eggs | — | (none) |
| Classic Mustard Egg Salad | — | (none) |
| Classic Tuna Salad | — | (none) |
| Coconut Chia Pudding | — | (none) |
| Dairy Free Avocado Chocolate Mousse | — | (none) |
| **Fluffy Coconut Keto Pancakes** | dairy, gluten | dairy |
| Grain-Free Cinnamon Coconut Granola | — | dairy |
| Greek Salad | — | dairy |
| **Grilled Chicken Kabobs** | (none) | (none) · soy-swappable |
| Homemade Avocado Oil Mayo | — | (none) |
| Homemade Greek Yogurt Ranch Dip | — | dairy |
| Homemade Spaghetti Sauce with Spaghetti Squash | — | (none) |
| **Keto Carolina Mustard BBQ Sauce** | (none) | (none) · soy? brand |
| Keto Cheesecake Fluff | — | dairy |
| **Keto Chicken Cordon Bleu** | dairy, gluten, nuts | dairy, nuts |
| **Keto Chicken Parmesan** | dairy, gluten, nuts | dairy, nuts |
| Keto Chili | — | (none) |
| **Keto Peanut Butter Balls** | dairy, gluten, nuts | nuts |
| **Make-Ahead Teriyaki Sauce** | (none) | (none) · soy-swappable |
| Marinara Sauce | — | (none) |
| Oven-Baked Bacon | — | (none) |
| **Pork Tenderloin Marinade** | (none) | (none) · soy-swappable · soy? brand |
| Roasted Garlic Parmesan Brussels Sprouts | — | dairy |
| Roasted Summer Vegetables | — | (none) |
| Salmon and Asparagus Bake | — | dairy |
| Sausage and Cabbage Skillet | — | (none) |
| Shrimp Scampi with Zucchini Noodles | — | dairy, shellfish |
| Slow Cooker White Chicken Chili | — | dairy |
| **Spicy Thai Basil Chicken (Pad Krapow Gai)** | shellfish | shellfish · soy-swappable |
| Stuffed Bell Peppers | — | dairy |
| Taco Salad | — | dairy |
| **Teriyaki Chicken** | (none) | (none) · soy-swappable |
| **Thai Panang Chicken Curry** | dairy, nuts | nuts |
| **Thai Slaw with Peanut Dressing** | dairy, nuts | nuts · soy-swappable |
| Traditional Guacamole with Veggies | — | (none) |

**Worcestershire and anchovies, as asked.** Two recipes use Worcestershire: **Keto Carolina Mustard BBQ Sauce** and **Pork Tenderloin Marinade**. Most brands contain anchovies. Three more carry fish or oyster sauce: **Spicy Thai Basil Chicken** (both), **Thai Panang Chicken Curry** (fish sauce). There is no fish category on the intake form, so this is queued as **N-12** rather than silently tagged.

### The Protocol Builder gate

Same vocabulary, same file, verified identical by test. **I did not run the live n=6 fixture** — it makes real API calls and measures *model* behaviour, while what changed is deterministic regex. The deterministic suite covers the change exactly: 33 strings testing every decision **and the behaviour it replaced** — "peanut butter" is not dairy but "1/4 cup butter" still is; "coconut flour" is not gluten but bare "flour" and "bread" still are. Queued as **N-11**.

---

## 2. What was built

**Phase 1.** `tools/allergens.js` as the single vocabulary. `recipes.json` gains `page`, `allergens`, `soy_swappable`, `brand_dependent`, `anchovy`, `nutrition`, `key_ingredients`. `recipes-html/` added to the publish allowlist (dist: 132 → 178 files).

**Phase 2.** `tools/recipes/coach-rules-lib.js` — the rules as pure functions, because they lived only inside `index.html` where nothing could test them, which is exactly how the allergen rule stayed unmeasured until it turned out to fail 2 of 6.

- **Unified DE scrub** — one choke point. Covers the meal planner, the recipe pool on the way *in* (Nutrition panels stripped), the fit feature, and the one My Recipes field that was prompt-guarded only.
- **Slot enum** — no snack, by any name; wrong slots rejected and regenerated.
- **Generalised violation check** — reads meal plans, covering invented meals.
- **Pool filter** — gated on `ALLERGEN_TAGS_CONFIRMED`.

**Phase 3.** "Does this recipe fit my plan?" on the Scale a Recipe picker. Allergen answers decided **in code, before any model call**, computed live from ingredient lines so it works today. Recipe links everywhere: the fit answer, every meal title in the weekly plan, and all 51 `recipes/*.pdf` links in `index.html`.

**Phase 4.** Four end-to-end scenarios, below.

---

## 3. Every fixture result

```
1. Allergen vocabulary ............................ 33 passed
2. index.html inline copy matches allergens.js .....  7 passed
3. Recipe tags .................................... 10 passed
4-6. Scrub / slots / pool filter .................. 31 passed
7. index.html mirror behaves like the library ..... 16 passed
8. "Does this recipe fit?" hard no ................ 16 passed
9. End-to-end, four profiles ...................... 10 passed
                                                   -----------
                                                   123 passed
                                                     0 failed
```

**The four end-to-end scenarios.** Each is a person, the worst thing the model could plausibly return for them, and the rule that has to hold anyway.

| Profile | Hostile response | Result |
|---|---|---|
| dairy + gluten | invented "Toast with butter" **and** a tagged dairy recipe | both caught |
| soy | Beef and Broccoli | allowed, swap instruction attached, no false violation |
| DE flag | "A 308-calorie start with 28g of fat", `macros`, "under 300 calories", "1,800 calories a day" | no digit in any visible field; prose survives |
| TRE + snack | "Afternoon Snack" | rejected; day trims clean |

The DE scenario asserts the **prose survives**, not only that the numbers left — a scrub that passes by emptying every field would pass a digit check and fail a person.

**Failures found and fixed during the run**, all caught by the suite rather than by reading:

1. My first scrub rewrote sentences around their numbers: *"Try cutting back to 200 calories"* → *"Try cutting back toa moderate amount"*, and *"A 308-calorie start with 28g of fat"* → *"A -calorie start with fat"*. Rewritten to drop whole sentences.
2. The mirror extractor swallowed the following function when a marker was a string constant with no braces.
3. `index.html` is CRLF, so a `;\n` terminator matched nothing and reported a false drift.
4. `shellfish` is the last entry in its object and has no trailing comma.
5. `key_ingredients` reduced "boneless, skinless chicken thighs" to **"boneless"** — the same catch-all that once cost a thigh at breast's fat.
6. The unit `g` in the quantity stripper ate the g of "garlic", giving **"arlic cloves"**.

---

## 4. Things I wrote myself — flagged for your eye

Your rule: presentational only on book and recipe content, never your voice. **No book or recipe prose was written or altered.** Link targets moved; link text did not. What follows is app copy, all of it strings the coach shows:

1. **The hard-no card** (`index.html`, `runRecipeFitCheck`) — *"No — this one is not for you. It contains dairy (cheese), and you have that listed as an allergy. Ask for something else and I will find you one that works."*
2. **Three verdict headings** — *"Yes — this fits your plan." / "Yes, with one change." / "Not as written."* and the label *"Try this:"*.
3. **The swap instruction** the coach must repeat — *"Use coconut aminos, not tamari — this recipe offers both and only one is soy-free."* and *"Check the label on the Worcestershire sauce: most Worcestershire brands contain soy, some do not."*
4. **The DE description fallback** — *"See the full recipe for [title]."* when every sentence carried a number.
5. **The DE reason fallback** — *"This one sits well with how you are eating right now."*
6. **Prompt instructions** in `buildRecipeFitInstruction` and the revised RECIPE POOL block.

Rewrite any of these in your own words and nothing else breaks.

---

## 5. Queued — see NEEDS_JAIME.md

- **N-10 ⚠ BLOCKING** — confirm the tags, then set `ALLERGEN_TAGS_CONFIRMED = true`. One line; everything behind it is built and tested.
- **N-11** — the live n=6 allergen fixture, not run (API cost).
- **N-12** — Worcestershire/fish sauce anchovies; no fish category on the intake form.
- **N-13** — the two course images still without a file.
- **N-14** — the pancakes bonus-recipe nutrition line, still "Estimated / per tablespoon".

---

## 6. Looked wrong, out of scope, not touched

1. **The live site serves a stale corpus.** `recipes.json` on `howyourbodyburns.netlify.app` predates every macro correction. None of this reaches a reader until you deploy.
2. **`server.js` and `package.json` are still publicly served** on the live site from past deploys. They contain no credentials — I checked — but they stop being reachable the moment the publish directory lands.
3. **`protocol-corpus.json` is your course text, publicly downloadable** by anyone who knows the path. The app fetches it at runtime, so it has to be public as currently built. Worth a think.
4. **`coach-fixtures.json` has 8 fixtures and no runner in the repo.** The runner was in a scratch directory — the same pattern as `weight-proposals.js` and `test-allergens.js`. Three tools now lost or nearly lost the same way.
5. **`index.html` is 1.1 MB and holds the whole app.** Every rule in it had to be mirrored to be testable. That is a workable arrangement, not a good one.
6. **`recipeViolates` has a vestigial branch** — a `return false` after a comment about brand-dependent tags. It is correct, but it reads like something was meant to go there. Left alone rather than changed at 3am on a safety path.

---

## 7. Verification

Every commit size-checked: **`index.html` 1,082,959 → 1,126,449 bytes, +4.0% across the run**, well inside the 20% stop. `<div>` balance 682→684 (the two added by the fit control), matched. All three inline script blocks parse after every edit. `dist/` rebuilds clean with every reference resolving.

**Not deployed.**

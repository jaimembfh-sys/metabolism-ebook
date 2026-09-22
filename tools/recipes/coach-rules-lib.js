/**
 * The binding rules, as pure functions.
 *
 * WHY A SEPARATE FILE. These rules live in index.html, which cannot be
 * required, imported or unit-tested — which is exactly why the allergen rule
 * went un-tested until it was measured failing 2 of 6. Everything here is
 * pure: data in, data out, no DOM, no fetch. index.html carries a mirrored
 * copy inside its script block, and tools/recipes/test-rules.js asserts the
 * two behave identically on the same inputs.
 *
 * Four rules:
 *   scrubNumbersIfFlagged     no number reaches a disordered-eating-flagged
 *                             user, in structured fields OR free text
 *   slotsFor / findSlotViolations
 *                             three meals, named ones, never a snack
 *   filterPoolByAllergies     a recipe containing a declared allergen never
 *                             reaches the model at all
 *   findMealPlanAllergenViolations
 *                             and if one gets invented anyway, catch it
 */

const A = require("../allergens.js");

/* =========================================================================
 * 1. DISORDERED-EATING SCRUB
 *
 * stripMealMacrosIfFlagged nulled macros and macros_note. That left every
 * free-text field untouched, and description is REQUIRED on every meal — so
 * "a 308-calorie start with 28g of fat" went straight through to a flagged
 * user while the structured fields sat dutifully null.
 *
 * This covers both, and the input side too: stripNutritionPanels takes the
 * numbers out of the recipe pool before the model ever sees them, so it
 * cannot restate what it was never given.
 * ========================================================================= */

/* Numbers that are not about the body. "Day 1" is a label, "350°F" is an
 * oven, "10 minutes" is a timer, "1/2 cup" is a measurement a cook needs.
 * Calories, grams and macros are the ones that hurt. */
const KEEP_NUMBER = [
  /\bday\s+\d+/i,
  /\d+\s*°/,
  /\d+\s*(?:degrees|deg)\b/i,
  /\d+\s*(?:minutes?|mins?|hours?|hrs?|seconds?|secs?)\b/i,
  /\d+\s*(?:\/\d+)?\s*(?:cups?|tsp|Tbsp|teaspoons?|tablespoons?|oz|ounces?|lbs?|pounds?|cloves?|slices?|cans?)\b/i,
  /\b\d+\s*(?:x|×)\s*\d+/,
];

/* Rewriting a sentence around its numbers produces broken English. The first
 * version of this turned "Try cutting back to 200 calories" into "Try cutting
 * back toa moderate amount" and "A 308-calorie start with 28g of fat" into
 * "A -calorie start with fat". Mangled copy aimed at someone with an eating
 * disorder is worse than no copy.
 *
 * So the unit is the SENTENCE. A sentence carrying a body-number is dropped
 * whole; the rest of the paragraph survives intact and still reads like
 * English. If nothing survives, the caller gets null and supplies its own
 * fallback rather than a stump.
 */
function sentenceIsSafe(sentence) {
  let rest = sentence;
  for (const re of KEEP_NUMBER) rest = rest.replace(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"), " ");
  return !/\d/.test(rest);
}

function scrubText(s) {
  if (typeof s !== "string" || !s) return s;
  const sentences = s.match(/[^.!?]+[.!?]*\s*/g) || [s];
  const kept = sentences.filter((x) => sentenceIsSafe(x));
  const out = kept.join("").replace(/\s{2,}/g, " ").trim();
  return out || null;
}

/** Remove the "## Nutrition" section from a recipe's markdown body. */
function stripNutritionPanels(fullText) {
  if (!fullText) return fullText;
  const lines = fullText.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((l) => /^## Nutrition\s*$/.test(l));
  if (start === -1) return fullText;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) if (/^## /.test(lines[i])) { end = i; break; }
  return lines.slice(0, start).concat(lines.slice(end)).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * One choke point. Every recipe-related surface routes through this before
 * anything is saved or shown.
 */
function scrubNumbersIfFlagged(plan, disorderedEatingSignal) {
  if (!disorderedEatingSignal || !plan) return plan;
  return Object.assign({}, plan, {
    rationale: scrubText(plan.rationale),
    allergy_note: scrubText(plan.allergy_note),
    days: (plan.days || []).map((day) => Object.assign({}, day, {
      // day_label is "Day 1" — a label, not a target. Left alone.
      meals: (day.meals || []).map((meal) => Object.assign({}, meal, {
        macros_note: null,
        macros: null,
        // description is REQUIRED by the schema and renders on the card, so a
        // null would leave a hole. When every sentence carried a number, fall
        // back to naming the dish rather than to a stump or a blank.
        description: scrubText(meal.description) || (meal.title ? "See the full recipe for " + meal.title + "." : null),
        coaching_note: scrubText(meal.coaching_note),
      })),
    })),
  });
}

/* =========================================================================
 * 2. MEAL SLOTS
 *
 * The course teaches no snacking, so the planner must not build one. slot was
 * a free-form string with the right values only in an example, which is a
 * suggestion, not a rule.
 * ========================================================================= */

const SLOTS_BY_PATTERN = {
  rule_of_3s: ["Breakfast", "Lunch", "Dinner"],
  carb_backloading: ["Breakfast", "Lunch", "Dinner"],
  time_restricted_eating: ["First Meal", "Last Meal"],
};

function slotsFor(eatingPattern) {
  return SLOTS_BY_PATTERN[eatingPattern] || SLOTS_BY_PATTERN.rule_of_3s;
}

/** Every way a plan's slots can be wrong: an unknown name, a snack by any
 *  name, too many meals, or the same slot twice in a day. */
function findSlotViolations(plan, eatingPattern) {
  const allowed = slotsFor(eatingPattern);
  const out = [];
  (plan && plan.days ? plan.days : []).forEach((day) => {
    const meals = day.meals || [];
    if (meals.length > allowed.length) {
      out.push({ day: day.day_label, problem: meals.length + " meals, pattern allows " + allowed.length });
    }
    const seen = new Set();
    meals.forEach((m) => {
      const slot = (m && m.slot) || "";
      if (/snack|nibble|bite|grazing/i.test(slot)) {
        out.push({ day: day.day_label, slot: slot, problem: "snack slot — the course teaches no snacking" });
        return;
      }
      if (!allowed.includes(slot)) {
        out.push({ day: day.day_label, slot: slot, problem: "not one of " + allowed.join(" / ") });
        return;
      }
      if (seen.has(slot)) out.push({ day: day.day_label, slot: slot, problem: "duplicate slot" });
      seen.add(slot);
    });
  });
  return out;
}

/* =========================================================================
 * 3. ALLERGEN POOL FILTER
 *
 * The model cannot suggest a recipe it was never shown. This is strictly
 * stronger than telling it not to, which was measured failing 1 in 3.
 *
 * Soy is the exception Jaime carved out: a recipe whose only soy is
 * "tamari or coconut aminos" stays in the pool, carrying the swap, because
 * removing it would shrink a soy-allergic reader's week for no reason.
 * ========================================================================= */

function recipeViolates(recipe, allergy) {
  const tags = recipe.allergens || [];
  if (tags.includes(allergy)) return true;
  // Brand-dependent is a "check the label", not a violation — but only when
  // the recipe is not already hard-tagged for that allergen.
  return false;
}

function filterPoolByAllergies(pool, allergies) {
  const list = (allergies || []).map((a) => String(a).toLowerCase()).filter((a) => a !== "other");
  if (!list.length) return pool.slice();
  return pool.filter((r) => !list.some((a) => recipeViolates(r, a)));
}

/** What the coach must say alongside a recipe it kept for a soy-allergic
 *  reader, or for one where a brand might carry the allergen. */
function swapInstructionsFor(recipe, allergies) {
  const list = (allergies || []).map((a) => String(a).toLowerCase());
  const out = [];
  if (list.includes("soy") && recipe.soy_swappable) {
    out.push("Use " + recipe.soy_swappable.swap + ", not " + recipe.soy_swappable.instead_of + " — this recipe offers both and only one is soy-free.");
  }
  if (list.includes("soy") && recipe.brand_dependent) {
    recipe.brand_dependent.forEach((b) => out.push("Check the label on the " + b.term + ": " + b.why + "."));
  }
  return out;
}

/* =========================================================================
 * 4. MEAL-PLAN VIOLATION CHECK
 *
 * findAllergenViolations reads a protocol — starter_habits, rationale,
 * staged_plan. A meal plan has none of those fields, so the gate could not
 * see it even if it were called. This reads a plan, covering ai_generated
 * meals, whose ingredients the model invents freely.
 * ========================================================================= */

function findMealPlanAllergenViolations(plan, allergies, pool) {
  const list = (allergies || []).map((a) => String(a).toLowerCase()).filter((a) => a !== "other");
  if (!list.length || !plan) return [];
  const bySlug = {};
  const byTitle = {};
  (pool || []).forEach((r) => { bySlug[r.slug] = r; byTitle[String(r.title).toLowerCase()] = r; });

  const out = [];
  (plan.days || []).forEach((day) => {
    (day.meals || []).forEach((meal) => {
      const known = byTitle[String(meal.title || "").toLowerCase()];
      list.forEach((a) => {
        // A pool recipe is judged on its tag, which was computed from its real
        // ingredient list — better evidence than scanning a 2-sentence summary.
        if (known) {
          if ((known.allergens || []).includes(a)) {
            out.push({ day: day.day_label, slot: meal.slot, title: meal.title, allergen: a, why: "recipe is tagged " + a });
          }
          return;
        }
        // An invented meal has only its own words to go on.
        const re = A.ALLERGEN_TERMS[a];
        if (!re) return;
        const haystack = [meal.title, meal.description, (meal.ingredients || []).join(" ")].filter(Boolean).join(" \n ");
        const m = haystack.match(re);
        if (m) out.push({ day: day.day_label, slot: meal.slot, title: meal.title, allergen: a, term: m[0], why: "invented meal mentions " + m[0] });
      });
    });
  });
  return out;
}

module.exports = {
  scrubText, stripNutritionPanels, scrubNumbersIfFlagged,
  SLOTS_BY_PATTERN, slotsFor, findSlotViolations,
  filterPoolByAllergies, swapInstructionsFor, recipeViolates,
  findMealPlanAllergenViolations,
};

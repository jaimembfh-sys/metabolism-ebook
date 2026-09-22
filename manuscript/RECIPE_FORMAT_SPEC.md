# Recipe format spec

Jaime's standard for every recipe, in the markdown source and on the built
pages. Stated 2026-09-21 and written down here because it had never been in the
repo — a previous pass went looking for it, found nothing, and had to ask.

Source of truth for recipe content is `knowledge-base/recipes/markdown/*.md`.
`knowledge-base/recipes.json` is built from those by
`knowledge-base/build-recipes-corpus.js`, and the HTML pages are built from
that JSON by `tools/recipes/build-pages.js`. Edit the markdown, never the JSON
or the HTML.

---

## The rules

**1. Hero photo at 2.5:1, 4 inches wide.**
Each page opens with a photograph in a 2.5:1 box, 4 inches across in print
(384 px at 96 dpi). The box holds that aspect ratio whether or not a photo
exists yet, so nothing reflows when the photographs land.

**2. No cholesterol, sodium or saturated fat in the nutrition facts.**
The panel carries six figures and no others:

```
- Calories: <n>
- Total Fat: <n>g
- Total Carbs: <n>g
- Fiber: <n>g
- Net Carbs: <n>g
- Protein: <n>g
```

In that order. Four recipes used to carry saturated fat, cholesterol and
sodium; they were stripped on 2026-09-21.

**3. Serving sizes are measurable quantities, not counts.**
"Per 3/4 cup serving", "Per Tbsp", "Per 1 cup serving" — an amount the reader
can measure. Not "per serving" where the serving is undefined, and not a count
that leaves the size open. Where a recipe genuinely divides into discrete
things, the thing itself is the measure: "Per deviled egg", "Per stuffed
pepper", "Per ball", "Per pancake".

**4. "Tbsp" is capitalised.**
Always `Tbsp`, never `tbsp` or `tablespoon` in an amount. `tsp` stays
lowercase, which is the convention that makes the two hard to confuse at a
glance.

**5. Oils default to beef tallow or avocado oil.**
Where a recipe needs a neutral cooking fat, it calls for beef tallow or avocado
oil. Not seed oils, not "vegetable oil". Olive oil is fine where the dish wants
its flavour.

**6. Per-step ingredient lists.**
Ingredients are grouped under the step that uses them, with the group heading
matching the instruction heading:

```
## Ingredients

### Sauté the Vegetables
- 1 Tbsp beef tallow
- 1 small onion (about 2 oz), chopped

## Instructions

### 1. Sauté the Vegetables
...
```

A reader working through the recipe sees only what the step in front of them
needs. This is already how all 43 are written.

**7. QR code footer pinned to the final page.**
Every printed recipe ends with a QR footer, pinned to the bottom of the last
sheet rather than floating after the last line. On screen it sits at the foot
of the page.

---

## Visual

Match the existing recipe PDFs (`recipes/*.pdf`). The built pages are not a new
design — they are those PDFs in HTML, so a reader cannot tell which one they
were handed.

## Print

Each recipe prints cleanly on its own sheet or sheets: no orphaned headings, no
nutrition panel split across a page break, no navigation or interface furniture
on paper. The QR footer lands at the bottom of the last page.

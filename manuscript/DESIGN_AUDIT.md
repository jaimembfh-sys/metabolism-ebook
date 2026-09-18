# Front-end audit — the course and the MetaBurn app

**Report only. Nothing has been changed.** Written 2026-09-18.

*(Task 5 asked for this at `manoscript/DESIGN_AUDIT.md` — assumed typo for `manuscript/`.)*

---

## The headline

Almost everything below traces to one root cause, so it's worth stating before the detail:

**`index.html` has a design system. The other seven pages have never heard of it.**

| Page | Loads Tailwind | `brand-*` uses | Own `<style>` | Distinct hex colors |
|---|---|---|---|---|
| `index.html` | ✅ | 257 | 1 | **31** |
| `account-info.html` | ❌ | 3 | 1 | 16 |
| `order-history.html` | ❌ | 1 | 1 | 20 |
| `contact-us.html` | ❌ | 0 | 1 | 18 |
| `understanding-metabolism.html` | ❌ | 0 | 1 | 14 |
| `beauty-basics.html` | ❌ | 0 | 1 | 15 |
| `metaburn-ai-coach.html` | ❌ | 0 | 1 | 13 |
| `create-new-password.html` | ❌ | 0 | 1 | 10 |

Seven pages each hand-roll their own CSS, their own colors, and their own components. **Across the site there are 137 distinct hex color declarations** where the brand palette is five values: `#34657a` (dark), `#c19a6b` (accent), `#a68256` (accent hover), `#eef3f5` (light), `#2c3e50` (text).

A user moving from the course to their account page crosses into what is visually a different product. **Nothing else in this document matters as much as this.**

---

## Worst offenders, in order

### 1. No shared stylesheet — every page is an island

**Where:** all eight `.html` files, one `<style>` block each.

There is no `styles.css`. The Tailwind config with the brand palette lives inline in `index.html` and nowhere else, so `bg-brand-accent` renders correctly on the course and silently does nothing on `account-info.html` — which is exactly why that page uses `brand-*` three times and gets three no-ops.

**Fix:** extract one stylesheet plus one shared Tailwind config, link it from all eight pages. This is the single highest-leverage change available and it is mostly mechanical.

---

### 2. Type scale: 11 Tailwind sizes plus 16 hand-written ones

`index.html` uses **11 distinct Tailwind text sizes**:

```
text-sm   357    text-4xl   43    text-5xl    4
text-xs   164    text-3xl   40    text-6xl    2
text-2xl   86    text-xl    39    text-7xl    1
text-lg    66    text-base   7
```

…and then **16 more distinct arbitrary `font-size:` declarations** on top: `0.6rem`, `0.7rem`, `0.72rem`, `0.75rem`, `0.8rem` (×8), `0.85rem`, `0.95rem`, `1.15rem` (twice, written two different ways), `1.2rem`, `1.3rem`, `1.4rem`, `1.55rem`, `3.5rem`, `5rem`.

**27 type sizes in one document.** `0.8rem` (12.8px) and `text-xs` (12px) are 0.8px apart and used interchangeably — a difference nobody can perceive but which guarantees text never quite lines up.

**Fix:** collapse to six roles — caption, body-sm, body, lead, h4/h3, h2/h1 — and delete every arbitrary `font-size`. The `1.15rem`-written-two-ways pair is the tell that these accrued by hand.

---

### 3. Brand color used as surface, not accent

| Token | as `bg-` | as `text-` | as `border-` |
|---|---|---|---|
| `brand-accent` | **51** | 140 | 63 |
| `brand-dark` | **46** | 384 | 67 |
| `brand-light` | **70** | 24 | 0 |

`brand-dark` (`#34657a`, a saturated teal) fills **46 surfaces**. Every large filled panel competes with every other for the same visual weight, and by the time a reader reaches the third dark teal box in Lesson 15 the emphasis has stopped meaning anything.

Worth noting: Lesson 15 stacks a `pro-tip-box`, a full-bleed `bg-brand-dark` salt box, and a `key-insight` box within about 20 lines — three different emphasis treatments back to back.

**Fix:** cap filled brand surfaces at one per screenful. Move the rest to `brand-light` with a `brand-accent` left border — a treatment already in use and the most successful pattern on the page.

---

### 4. Spacing: no scale, just habits

**10 padding steps** (`p-0` … `p-12`) and **11 margin-bottom steps** (`mb-0` … `mb-16`) in use, plus **12 distinct arbitrary `padding:` declarations**. `p-6` and `p-8` are both used for the same kind of callout box in the same lesson.

**Fix:** a 4-step scale (`2/4/6/8`) for component padding and a 3-step scale (`4/8/12`) for block rhythm covers everything here.

---

### 5. Buttons: 48 distinct class signatures in one file

`index.html` contains **48 unique `<button class="...">` combinations.** Not 48 buttons — 48 *different ways of styling* a button. Corner radius alone runs four ways: `rounded-lg` (173), `rounded-xl` (132), `rounded-full` (55), `rounded-2xl` (1).

That single `rounded-2xl` is the signature of styling by copy-paste-and-tweak.

**Fix:** three variants — primary, secondary, ghost — plus one size modifier. Every current button maps onto one of them.

---

### 6. Inputs: 22 distinct signatures, and no shared focus state

**22 distinct `<input class="...">` signatures.** Forms are where users judge whether software is trustworthy, and the Health History intake is the most consequential form in the product.

**Fix:** one input component. Give it a real focus ring — `brand-accent` at 2px — which also fixes keyboard accessibility.

---

### 7. Error and loading states are present but uneven

Better than expected, and the pieces exist:

- 22 references to loading elements, 18 spinner/pulse animations
- `buildAiErrorHtml` — a shared styled error helper
- `appendRetryMessage` — a retry affordance with a working callback
- 47 `catch` blocks

The problem is coverage. **17 AI call sites, but `buildAiErrorHtml` is used at 9 and `appendRetryMessage` at only 2.** So roughly half of AI failures surface through something other than the shared helper, and only two failures anywhere in the product offer the user a retry. The rest dead-end.

Empty states appear about 11 times against a much larger number of list-rendering sites — a new user with no logged meals, no photos, and no recipes sees several blank panels rather than guidance.

**`aria-live` and `role="alert"` appear zero times.** Every async status change — protocol generated, plan saved, error thrown — is silent to a screen reader.

**Fix, in order:** route all 17 AI call sites through `buildAiErrorHtml`; extend `appendRetryMessage` to every one of them; add `aria-live="polite"` to the loading and result containers.

---

### 8. Heading hierarchy

`Lesson 18` uses `<h3>` for "Progress Takes Time" where every other lesson uses `<h4>` for a subsection. This has a second-order effect: `extract-lessons.js` splits chunks on `<h4>` only, so that section never becomes its own chunk and gets absorbed into whatever precedes it — a retrieval consequence from a formatting inconsistency.

*(Found during the Task 1 extractor work; left unchanged because Lesson 18 isn't part of a decided correction.)*

---

## shadcn/ui: reasonable, or too disruptive?

**Too disruptive as a drop-in. The honest answer is no — and the reason is structural, not aesthetic.**

shadcn/ui requires React, a build step, and a component directory. This project is:

- Eight standalone HTML files with inline `<style>` and inline `<script>`
- Tailwind via CDN (`cdn.tailwindcss.com`) — no build pipeline
- ~9,000 lines of vanilla JS in `index.html` driving state directly through `document.getElementById`
- Deployed to Netlify as static files with three serverless functions

Adopting shadcn means introducing React, a bundler, and a component build, then rewriting the entire application layer. That is a rewrite with the design system as its pretext. The risk is not the components — it is that ~9,000 lines of working, subtle logic (the intake flow, the safety gates, the protocol builder, the live-search budget) would have to be ported, and every safety behavior re-verified.

**What shadcn is actually offering you is not React.** It is: one token layer, a small set of variant-driven primitives, and consistent focus/disabled/error states. **All three are achievable here without React.**

### Phased alternative

**Phase 1 — tokens (half a day, near-zero risk).** Create `styles.css`: the five brand colors as CSS custom properties, a six-step type scale, a four-step spacing scale. Link from all eight pages. Move the Tailwind config out of `index.html` into a shared file. Change no markup. *Outcome: the seven orphan pages inherit the brand for the first time.*

**Phase 2 — component classes (1–2 days, low risk).** Define `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.input`, `.card`, `.callout`, `.callout-tip`, `.callout-insight` as plain CSS classes borrowing shadcn's *variant vocabulary* without its runtime. Migrate page by page, starting with `account-info.html` (4 button signatures) rather than `index.html` (48). *Outcome: one focus ring, one disabled state, one radius.*

**Phase 3 — consolidate the type and spacing sprawl (1–2 days, low risk, tedious).** Delete all 16 arbitrary `font-size` declarations and all 12 arbitrary `padding` declarations, mapping each to the scale. Purely mechanical once Phase 1 exists.

**Phase 4 — states (1 day, medium value).** Route all 17 AI call sites through the shared error helper, extend retry to all of them, add `aria-live`, write empty states for the main lists.

**Phase 5 — revisit React (only if ever needed).** If the app grows past what vanilla JS comfortably holds, reconsider then, with a token layer and component vocabulary already in place — which makes an eventual shadcn migration *easier*, not harder.

**Phases 1 and 2 capture most of the visible gain for roughly two days of work and no architectural risk.** Phase 1 alone — one stylesheet, eight `<link>` tags — closes the largest single gap in the product.

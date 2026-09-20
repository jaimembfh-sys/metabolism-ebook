# Deploy checklist

**Written 2026-09-20. Nothing has been deployed.**

The live site has not been updated since **2026-07-25**. Since then: **58 commits, 160 files, +24,215 / −583 lines.** Everything below goes live in one shot the moment you deploy.

**The site is not Git-linked.** All 46 Netlify deploys show `branch=- commit=-`. Pushing to GitHub does nothing. Deploying means `npx netlify deploy --prod`, or connecting the repo first.

---

# ⛔ BLOCKERS — do not ship until these are decided

## 1. The paid AI Coach can be unlocked by editing the URL

`index.html:5297` — the code's own comment says **"STOPGAP — NOT SECURE"**.

```js
if (earlyParams.get('metaburn_purchase_confirmed') === '1') {
    localStorage.setItem('metaburnPurchased', 'true');
}
```

Anyone who appends `?metaburn_purchase_confirmed=1` gets permanent access to the paid tier on that device. No server check, no receipt validation. This is already live, so deploying does not introduce it — but it is the single most consequential thing in the codebase and it should not still be true when you start driving traffic to the sales page.

**You asked me to flag Stripe being in test mode.** There is no Stripe integration in this codebase at all — payments run through Shopify redirect plus Memberstack (`app_cmpaq9ev900520sz36ulugs78`). If Stripe test mode is a concern, it lives somewhere outside this repo. Worth confirming before launch.

## 2. The model overrides are local-only

`ANTHROPIC_PROTOCOL_MODEL` and `ANTHROPIC_MEAL_PLAN_MODEL` are set to `claude-sonnet-5` in `.env`, which is gitignored. **Production still runs Haiku.** Deliberate — setting them in the Netlify dashboard changes live behaviour immediately, without a deploy, and at **10.8× the per-call cost**. See `OVERNIGHT_REPORT_3.md` §1 before enabling.

## 3. The corpus is now ~286K tokens per Protocol Builder call

Measured, not estimated. Three features send the whole corpus: Protocol Builder, Meal Planner, Lab Markers. General chat does not. This ships whether or not you switch models, because it is the corpus, not the model. Cost on Haiku goes from ~$0.081 to ~$0.20 per uncached call.

**The before/after showed output getting thinner, not richer.** Retrieval plan is in `OVERNIGHT_REPORT_3.md` §1. Nothing in it is implemented.

---

# What ships

## Book content — the largest change

| | |
|---|---|
| 97 of 109 chapter items | applied across 18 chapters |
| Corpus | 177 → 609 chunks; ~22,000 → ~107,879 words |
| Lesson 7 | retitled to *Other Key Metabolic Hormones: Leptin, Ghrelin, and Adiponectin* |
| Chapter → Lesson | normalised throughout |
| 54 mojibake em dashes | fixed and made ASCII-safe |

**Chapter 11 was skipped entirely** — no course file exists for it.

Still carrying your words unchanged, awaiting you: **R-1, R-2, R-7** (Randle orphans), **Q-1, Q-2** (Chapter 6), **P1-5** (*"As advanced metabolic research extensively shows"*, `index.html:834`). All in `NEEDS_JAIME.md`.

## Sales page — fully rewritten

New copy top to bottom, Google Fonts wired, author photo beside the credentials paragraph, book-plus-phone hero, value stack, gold BONUS labels, pricing product shot.

**Both CTAs are still `mailto:` links.** There is no checkout. Every buyer becomes a manual email thread:

```
mailto:hello@mindbodyfunctionalhealth.com?subject=Understanding%20Metabolism%20Order
```

That is the thing most likely to cost you money on launch day.

## AI coach

- `coach-reference/` wired into the corpus — 354 chunks that previously had **zero** runtime presence
- `coach-rules.json` promoted into the system prompt of every coach-facing call (46 prohibited claims, 6 safety behaviours, 9 escalation triggers, 11 course conflicts), fails closed
- **Two real safety failures found and fixed** — see `OVERNIGHT_REPORT_3.md` §2
- `scrubDisconnectedHelpline()` — post-response enforcement, not just instruction
- `MAX_TOKENS.protocol` 1024 → 4096; Sonnet pricing added so cost logging keeps working

## Site-wide

- `styles/brand.css` — shared palette, adopted by all 8 pages
- `scripts/a11y.js` — live regions, label association, skip links, icon-button names
- Component classes: buttons −34% utility tokens, inputs −40%
- `:focus-visible` everywhere (there was none), touch targets at 44px on coarse pointers, reduced-motion guard

---

# Pre-deploy verification

- [ ] `node knowledge-base/extract-lessons.js && node "Functional medicine content/processed/chunk_markdown.js" --markdown-dir knowledge-base/markdown --out-dir knowledge-base/chunks && node knowledge-base/chunk-coach-reference.js && node knowledge-base/build-corpus.js` — expect **609 chunks**
- [ ] `protocol-corpus.json` is committed and current
- [ ] `coach-rules.json` and `coach-fixtures.json` are present — the coach **fails closed** without the first
- [ ] `styles/brand.css` and `scripts/a11y.js` deploy (new directories — confirm they are not gitignored)
- [ ] Netlify env: `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- [ ] Decide on the two model override vars — **currently absent in production, which is the safe default**
- [ ] Spot-check the sales page hero and pricing shot on a real phone
- [ ] Run the statin and SGLT2 fixtures against production once it is up

# Deploy

```bash
npx netlify deploy --prod
```

# Immediately after

- [ ] Confirm `/knowledge-base/coach-rules.json` returns 200 — if it 404s, **every coach feature throws**
- [ ] Confirm `/knowledge-base/protocol-corpus.json` returns 200 and is ~964 KB
- [ ] Generate one protocol and read it end to end
- [ ] Watch the cost log on the first few Protocol Builder calls

---

# Deliberately NOT shipped

| Held | Why |
|---|---|
| Netlify model override env vars | 10.8× cost; your call |
| Corpus retrieval | Written as a plan, not implemented, per your instruction |
| Phase 1 colour convergence | `--ink` #1f2e35 vs #2c3e50 is your decision |
| `coach-reference/` reconciliation of the 11 live conflicts | Those flags are accurate; the book still makes those claims |
| Markup-level label fixes | Runtime fix shipped instead; 65 inputs still need real `for` attributes |

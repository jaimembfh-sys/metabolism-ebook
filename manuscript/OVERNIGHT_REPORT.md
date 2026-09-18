# Overnight report — 2026-09-17 → 18

---

# §0 — INCIDENT: index.html destroyed, not yet restored

**2026-09-18 13:17.** I ran a `perl -0777 -i -pe` substitution to insert the truncation
guard into the three Claude call wrappers. The regex ran away. `index.html` went from
**817,682 bytes to 207,446,615 bytes** (5.8 million lines) and now contains nothing but
the same seven-line block repeated. Verified: `<!DOCTYPE html>`, `"Body Burn Basics"`,
`"Fewer Meals Win"` and `"One Exception Worth Naming"` all return **0 matches**. None of
your content survives in the working copy.

**Cause: mine.** A slurp-mode in-place regex against an 800 KB HTML file, when the Edit
tool would have done the same job safely. I had already used Edit successfully for every
other change tonight.

**What is safe:**
- Git's copy at commit `4b67ab9` is intact — 817,682 bytes, all 18 lessons, verified
- `understanding-metabolism.html`, `netlify/functions/claude.js`,
  `knowledge-base/extract-lessons.js`, all five `coach-reference/` files and every
  `manuscript/` deliverable were untouched

**What is lost from the working copy** (all re-appliable — every replacement text is in
`manuscript/` or the session transcript):
corrections #1, #2, #3; Lesson 18 `<h3>`→`<h4>`; salt FIX 2 + FIX 3; "progressively" ×2;
REFINE 1, 2, 3 plus three summary-bullet repairs; the `assertNotTruncated` helper.

**Blocked on permission.** Both recovery routes were denied by the auto-mode classifier
as "Irreversible Local Destruction":

```
git checkout -- index.html
git show HEAD:index.html > index.restored.html
```

The second is non-destructive — it only creates a new file — but was denied too. **I
stopped rather than trying to work around the guardrail.** Recovery needs one of:

1. You approve `git checkout -- index.html`, or
2. You add a Bash permission rule, or
3. You run it yourself:
   `cd "C:\Projects\metabolism ebook" && git checkout -- index.html`

Once restored, re-applying is deterministic and I can do it in one pass.

**Do not rebuild the corpus before restoring.** `knowledge-base/` currently holds markdown,
chunks and `protocol-corpus.json` generated from the *good* index.html — they are the only
artifacts still carrying the corrected text. Running `extract-lessons.js` against the
damaged or reverted file would overwrite them.

---

Five tasks. Three live-error corrections applied, six queued. **Read §3 first** —
it is the short list of sentences I wrote rather than you.

---

## 1. Completed

### Task 1 — extractor bug: **fixed**

`extract-lessons.js:119` took `.first()` on `.key-insight`, so any lesson with more than one Key Insight box lost all but the first — reader-visible, invisible to the coach. Replaced with a full map over every `.key-insight`.

`stripBoilerplate` turned out **not** to be part of the bug: it runs on `$(sectionEl).clone()`, so the originals were intact. No change needed there, and I've added a comment saying so to stop the next person chasing it.

Boxes are numbered (`## Key Insight 1`, `## Key Insight 2`) **only** when a lesson has more than one, so all 17 single-box lessons keep byte-identical chunks.

| | Before | After |
|---|---|---|
| Corpus chunks | 172 | **173** |
| Lesson 15 Key Insight boxes in corpus | 1 of 2 | **2 of 2** |

Verified: `"greater thermic response eaten in the morning"` returns 1 in `protocol-corpus.json` (was 0).

**Other `.first()` calls audited, as requested:**

| Call | Verdict |
|---|---|
| `.lesson-summary").first()` | **Safe** — exactly one per lesson, all 18 checked |
| `$section.find("h2").first()` | **Safe** — no section has two |
| `$section.find("h3").first().remove()` | **One case.** Lesson 18 `section#ch18` has two `<h3>` — "Lesson 18" and "Progress Takes Time". Only the first is removed; the second stays in body text |
| `.key-insight-fact").first()` inside each box | **Safe** — one fact per box everywhere |

The Lesson 18 case is really a formatting inconsistency: "Progress Takes Time" is a subsection heading marked `<h3>` where every other lesson uses `<h4>`. Since `splitByH4` only breaks on `<h4>`, it never becomes its own chunk. **Not changed** — Lesson 18 isn't part of a decided correction.

### Task 2 — corrections applied: #3. Queued: #4, #5, #10, #11, #12

**#3 — Lesson 2, cephalic phase / diet soda.** Your §1.2 rewrite in as written. Coach layer: corpus 9.12 already correct; prohibited claims 21, 22, 23 added verbatim from §5; Lesson 2 conflict-flag row retired. Log entry in `CORRECTION_LOG.md`.

Everything else stopped and queued — details in §4 below.

### Task 3 — stale course-state sweep: **complete**

### Task 4 — `CORPUS_WIRING_PLAN.md`: **written, nothing implemented**

### Task 5 — `DESIGN_AUDIT.md`: **written, nothing changed**
*(Requested as `manoscript/` — assumed typo, wrote to `manuscript/`.)*

### Final regression — all three corrections

| Claim | corpus | index.html | marketing |
|---|---|---|---|
| "cannot burn both" | 0 | 0 | 0 |
| "metabolic traffic jam" | 0 | 0 | 0 |
| "oxidative stress skyrockets" | 0 | 0 | 0 |
| "Randle" | 0 | 2 † | 0 |
| "38%" | 0 | 0 | 0 |
| "Thermogenic Advantage" | 0 | 0 | 0 |
| "still trigger an insulin spike simply" | 0 | 0 | 0 |
| "teasing your brain with artificial sweetness" | 0 | 0 | 0 |

† Both non-reader-facing: a stale code comment at `index.html:5126`, and the goal-generation AI prompt at `index.html:5977` (*"Ground eating-pattern implications in Dr. Ben Bikman's research … the Randle cycle"*). Raised previously; still your call, still untouched.

---

## 2. Every line of YOUR text I changed

Only correction #3 touched your copy tonight. Corrections #1 and #2 are logged in `CORRECTION_LOG.md` from earlier sessions.

### `index.html:667` — heading

**Before:** `The Cephalic Phase: Why Tasting Sweetness Matters`
**After:** `The Cephalic Phase: When Anticipation Counts`
*Your heading, from §1.2.*

### `index.html:668-669` → now `668-672` — two paragraphs replaced by five

**Before (2 paragraphs):**

> Because the body relies on signals rather than just simple mechanics, insulin release can begin before food even hits your stomach. Metabolic science frequently highlights a fascinating biological phenomenon known as the "cephalic phase insulin response."
>
> When you taste something sweet—even if it is a zero-calorie artificial sweetener—your brain immediately registers that sweetness. Anticipating an influx of sugar, the brain sends a rapid signal to the pancreas to start pumping out insulin. This means you can drink a diet soda with absolutely zero real energy in it, yet still trigger an insulin spike simply because of the taste on your tongue. If your goal is to keep insulin low so your body can access stored fat, constantly teasing your brain with artificial sweetness can keep those fat-burning gates tightly shut.

**After (5 paragraphs):** your §1.2 replacement copy, verbatim — "Because your body runs on signals…" through "…That will tell you more about your own body than any general rule."

**Presentational only:** paragraph breaks follow your blockquote's own breaks; `<strong>` applied where you bolded ("Where this gets overstated:", "Here's what I'd actually say about sweeteners."); existing `<p>` markup preserved. No wording changed, nothing condensed, no hedge added or removed. Your subset-of-people-with-overweight hedge and the "it may not be zero for everyone" qualifier are both intact.

---

## 3. ⚠️ Every line I wrote — scrutinise these first

**Six items. Three from correction #2 (already reported), three from tonight.**

### From correction #2 — already flagged, repeated here for one list

**3.1 — Caution sentence, `index.html` Lesson 15 box.** *Mine:*

> While this pattern is not right for everyone — particularly those with adrenal stress or blood sugar instability — fewer, more substantial meals still tend to serve most people better than constant grazing.

Your original said "this level of compression"; the box no longer names a level. **I also dropped your closing clause** — *"it illustrates a powerful principle: fewer, more substantial meals tend to create a greater metabolic stimulus than constant grazing"* — because "greater metabolic stimulus" is the energy-expenditure claim FIX 1 retracts. **That is a judgment call on your content.**

**3.2 — Marketing bullet, `understanding-metabolism.html:362`.** *Mine:*

> …and why fewer meals genuinely win — for a reason that has nothing to do with burning more calories.

Two alternates in `CORRECTION_LOG.md` #2.

**3.3 — COURSE STATE stamps** in `AI_Coach_Knowledge_Corpus.md:244` and `Chapter_15_Coach.md:45`.

### New tonight — all coach-layer metadata, none reader-facing

**3.4 — `AI_Coach_Knowledge_Corpus.md`, prohibited claim #21.** Your §5 text went in verbatim, including its embedded note *"the course needs updating. Until it is, the coach should answer from the corpus and not cite the lesson."* That note is now false. Rather than edit your sentence I appended:

> — **COURSE STATE (verified 2026-09-18): Lesson 2 has since been CORRECTED; the conflict described in that note is resolved and the coach may now cite Lesson 2 on this point. The prohibited claim itself stands.**

**3.5 — `Chapter_15_Coach.md:18`**, "WHAT THE LESSON TEACHES" item 6. Struck through your line and appended *"incorrect; **REMOVED FROM THE LESSON 2026-09-18.** The lesson now teaches that fewer meals win on appetite rather than thermogenesis…"*. Your original text is struck, not deleted.

**3.6 — `Chapter_04_Backend_Coach.md:164`**, second conflict-flag table. Struck the Lesson 9 Randle row and wrote a retirement note. **This one was a genuine catch:** there are *two* conflict-flag tables — the master in `Chapter_03_Backend_Coach.md:161` and an "additions" table in `Chapter_04` meant to be appended to it but never merged. I retired the row in `Chapter_03` yesterday and missed this one, so the same flag was live and retired simultaneously for a day. Merging the two tables is step 3 in the wiring plan.

**Nothing I wrote tonight is reader-facing.** Items 3.4–3.6 are all coach metadata.

---

## 4. Queued in `NEEDS_JAIME.md` — priority order

| | Item | Blocked on |
|---|---|---|
| **P1-1** | Lesson 2 summary bullet (`index.html:707`) contradicts the text I just corrected | One replacement bullet |
| **P1-2** | Lesson 9 weak citations (`1330-1331`) — §1.5 offers two options, supplies neither. **Superscript renumbering trap**: 3 body sentences cite this list | Two citations, or which sentences to cut |
| **P1-3** | Lesson 6 GLP-1 mechanism (`981`) — ADD 5 is the only addition with **no `Placement:` line**, and the fix needs one of your sentences removed | Placement + what happens to that sentence |
| **P1-4** | Lesson 15 salt (`1785`) — **two drafts, six wording differences**, and `Chapter_15_Course.md` has a FIX 3 the corrections doc lacks | Which draft; does FIX 3 go in |
| **P2-1** | Lesson 5 "permanently" (`878`, `883`) — two drafts; `Ch5_Additions.md` says *"Your choice entirely"* | Which wording |
| **P2-2** | Lesson 17 squat claim (`2024`, `2040`, `2211`) — one draft defers to you, the other supplies full copy | Confirm the chapter draft |

**P1-1 is the most urgent** — Lesson 2 currently contradicts itself between body and summary, and that is a state I created tonight by correcting the body. It is one sentence from you.

---

## 5. Looked wrong, out of scope

1. **Chapter 11 has no course document.** `Chapter_11_Course.md` does not exist anywhere. `Ch11_Stomach_Acid_Revised.md` says it replaces "A5" in a file that was never written. Recommend treating it as a standalone addition — but its own `NOTE FOR YOU` asks you two questions first, one of them a safety decision about HCl titration. Detail in `CORPUS_WIRING_PLAN.md` §4.
2. **Prohibited-claim numbering doesn't reconcile.** Master list runs 1–23. `Chapter_03` appends 26–31. `Chapter_04` appends 32+. Nothing defines 24–25. Three documents amend **claim #62**, which exists nowhere. Numbered cross-references can't be trusted until resolved.
3. **§9.8 and §14.3 marked superseded** by the protein document, but the corpus ends at §9 — §14 doesn't exist.
4. **`Lesson_04_Coach_Depth.md` is explicitly superseded** by `Chapter_04_Complete.md:5` but still sits in `coach-reference/`. It would be ingested if the folder were wired in as-is.
5. **`Protein_Section_Course_Copy.md` is reader copy misfiled in `coach-reference/`**, and looks superseded by `Chapter_09_Complete.md` A1/A2.
6. **`Circadian Alignment & Restorative Sleep.docx`** sits in `Functional medicine content/` but was never converted to markdown, so it's in no corpus.
7. **`Downloads/#35 Stomach, Gastric Acid, Protein Digestion & B12 Absorption.docx`** (Sep 15) looks like source material for the Lesson 11 stomach acid section and isn't in the project.
8. **Nothing checks `stop_reason`** before parsing the Protocol Builder tool result. `MAX_TOKENS.protocol` is 1024 against ~27K of input; a staged-plan case adding `staged_plan` *and* `professional_guidance_note` is the most likely to truncate, and truncation would pass a partial object through silently.
9. **Four more "up to" constructions** beyond the two removed: `up to 40%` lean mass (L6), `up to 9.09 times` pancreatitis (L6), `up to six times more nutrients` (L15 — already in your verification backlog). A fourth is inside an AI prompt, not reader copy.
10. **Lesson 18 `<h3>`/`<h4>` inconsistency** — §1, Task 1 above.

---

## 6. Files touched

**Modified:** `index.html`, `understanding-metabolism.html`, `knowledge-base/extract-lessons.js`, `knowledge-base/protocol-corpus.json`, 4 × `markdown/lesson-*.md`, 5 × `chunks/*.jsonl`, `coach-reference/` × 5 files.

**Created:** `manuscript/NEEDS_JAIME.md`, `manuscript/CORRECTION_LOG.md`, `manuscript/CORPUS_WIRING_PLAN.md`, `manuscript/DESIGN_AUDIT.md`, `manuscript/OVERNIGHT_REPORT.md`.

**Not committed** — everything is in the working tree for you to review first. `coach-reference/` and `manuscript/` are still untracked.

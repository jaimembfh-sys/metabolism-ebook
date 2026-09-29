# Protein, Lean Mass, and Body Composition
## BACKEND COACH DOCUMENT

**MetaBurn AI Coach — knowledge entries**
Merge into `AI_Coach_Knowledge_Corpus.md` as Section 17. **Supersedes 9.8 entirely.** Not user-facing.
Companion: `Protein_Section_Course_Copy.md`

> **This section governs all protein recommendations and all lean-mass conversations, including GLP-1 body composition.** Read 17.1 before providing any numeric target.

---

# SECTION 17 — PROTEIN REQUIREMENTS AND LEAN MASS

`topic: protein, protein target, grams per kg, leucine, anabolic resistance, muscle loss, lean mass, fat free mass, DXA, BIA, sarcopenia, carnivore, gluconeogenesis, resistance training`

## 17.1 >>> SAFETY GATE — READ BEFORE ANY NUMERIC PROTEIN OUTPUT

**Provide no gram targets, no g/kg figures, no goal-weight calculation, and no food-quantity examples if any of the following is present:**

- **Personal health situation flag active** (corpus 6.4)
- **Any disordered eating signal** (corpus 11.3) — distress around eating, forbidden-food framing, compensatory exercise, requests for progressively lower intake, food described as frightening, stated ED history
- **Reported kidney disease, reduced eGFR, single kidney, or dialysis** → route to clinician. Higher protein has not been shown to harm healthy kidneys, but in established CKD protein intake is a prescribing decision.
- **Pregnancy or lactation** → requirements differ; route to clinician.
- **Hepatic encephalopathy or urea cycle disorder** → absolute; protein restriction may be therapeutic.

In gated cases the coach may discuss protein qualitatively — "a substantial portion of each meal" — and nothing further.

**Additional caution:** a user requesting exact macros while also tracking weight, glucose, ketones, and steps may be in a quantification spiral (corpus 13.6, 16.10). Consider reducing rather than adding numbers.

## 17.2 Protein dose-response and the per-meal threshold

**[ESTABLISHED]** Muscle protein synthesis responds to per-meal protein dose in a saturable, threshold-like manner rather than to daily total alone. The stimulus is driven substantially by **leucine** content, acting via mTORC1 signalling. Below the threshold dose, the anabolic response is blunted regardless of daily intake.

Consequence: distributing a sub-threshold quantity across meals can fail to trigger synthesis at any meal.

**[CONTESTED]** Even distribution of adequate protein may support muscle protein synthesis better than skewing protein toward dinner, though trials measuring muscle and body composition haven't confirmed an advantage.

**Commonly cited per-meal thresholds:** ~25–30 g high-quality protein for younger adults, ~35–40 g for older adults.

**>>> VERIFY:** these figures were stated from general knowledge. Anchor against Moore's dose-response work, Paddon-Jones, and Volpi before the coach quotes them.

## 17.3 Anabolic resistance

**[ESTABLISHED]** Older adults exhibit reduced muscle protein synthetic response to a given protein dose compared with younger adults. Contributors include reduced postprandial muscle perfusion, impaired amino acid transport, blunted mTORC1 activation, and reduced physical activity.

**Clinical consequence:** per-meal protein requirement **rises** with age. The RDA of 0.8 g/kg represents nitrogen-balance minimum, not a functional target, and is widely considered inadequate for older adults.

**>>> COACH USE — HIGHEST-VALUE FRAMING FOR THIS AUDIENCE:** protein requirement increases at precisely the age at which appetite, cooking frequency, and meat tolerance typically decline. This is a mechanistic explanation for age-related muscle loss that most users have never encountered.

**>>> VERIFY:** PROT-AGE consensus (Bauer et al. 2013) recommends 1.0–1.2 g/kg/day for healthy older adults and 1.2–1.5 g/kg/day with acute or chronic illness. Confirm before quoting the course's 1.2–1.6 range as consensus-derived.

## 17.4 Krieger meta-regression — the protein and carbohydrate coefficients

**[SUPPORTED — with quality caveats]** Krieger JW, Sitren HS, Daniels MJ, Langkamp-Henken B. *Am J Clin Nutr*. 2006;83(2):260–274. PMID 16469983.

**Protein coefficient, after controlling for energy intake:**
- Intake >1.05 g/kg → **+0.60 kg fat-free mass retention** vs ≤1.05 g/kg
- In studies >12 weeks → **+1.21 kg**
- **No significant effect of protein on body mass or fat mass loss**

**Carbohydrate coefficient, after controlling for energy intake:** diets at ≤35–41.4% energy from carbohydrate were associated with:
- 1.74 kg greater body mass loss
- 2.05 kg greater fat mass loss
- **0.69 kg greater fat-free mass loss**
- In studies >12 weeks: 6.56 kg, 5.57 kg, and **1.74 kg** respectively

**Authors' conclusion:** low-carbohydrate, high-protein diets favorably affect body mass and composition independent of energy intake, "which in part supports the proposed metabolic advantage of these diets."

**>>> METHODOLOGICAL LIMITS — the coach must not over-read this paper:**
- DARE quality assessment flagged: limited literature search, no study-quality weighting, insufficient study detail, exploratory nature of meta-regression
- **These are separate regression coefficients estimated across different study subsets, not components of a single decomposition.** They cannot be arithmetically combined to derive proportional composition of loss. Note that at >12 weeks the fat and FFM coefficients (5.57 + 1.74 = 7.31 kg) exceed the total mass coefficient (6.56 kg), which demonstrates the overlap.
- Published 2006; predates most modern body composition methodology

**>>> COACH FRAMING:** protein is a lean-mass lever with no fat-loss effect. Carbohydrate restriction is a fat-loss lever with a modest lean-mass cost. **The two roughly offset**, which is why low-carbohydrate eating at adequate protein performs well on both and low-carbohydrate eating at inadequate protein does not.

## 17.5 >>> THE KETO MUSCLE QUESTION — how the coach handles it

**[CONTESTED — genuinely, and the coach must represent both sides]**

**Evidence supporting preservation:**
- BHB has plausible anabolic and anti-catabolic actions; reduces leucine oxidation and protein breakdown in laboratory settings
- Individual trials show striking results: a 2025 RCT of a very-low-calorie *low-fat* ketogenic diet vs standard hypocaloric diet found fat mass accounted for **82.1% vs 38.4%** of weight loss, with lean mass loss **11.9% vs 51.0%**
- Multiple VLCKD trials report predominant fat-mass loss with preserved fat-free mass

**Evidence against a carbohydrate-independent effect:**
- Krieger's carbohydrate coefficient runs the other way (17.4)
- National Lipid Association scientific statement: low-carbohydrate-high-fat vs hypocaloric low-fat achieved equivalent or greater fat loss **but higher lean body mass loss, unless accompanied by higher protein intake**
- A 2026 narrative review (MEDLINE searched to 14 Aug 2026) states that comparative meta-analyses report **small but larger** reductions in FFM on ketogenic than non-ketogenic regimens, and that protein intake and resistance exercise are the best-supported strategies "irrespective of the dietary model used"

**>>> THE RESOLUTION — the coach's position:**

The trials showing strong preservation are **high-protein ketogenic protocols** (the low-fat VLCKD design is high-protein by construction — protein-sparing modified fast tradition). The pooled analyses average across protocols including moderate-protein designs.

**Additionally, and importantly: real-world ketogenic eating is typically high in protein by default.** Eliminating grains, sugar, and most processed food leaves protein and fat as the practical satiety sources. So the preservation observed in practice is likely genuine — but attributable to the protein intake that ketogenic eating produces, not to ketosis as an independent mechanism.

**Coach output:** attribute lean-mass protection to **protein intake and resistance training**, note that ketogenic eating tends to deliver adequate protein spontaneously, and do not claim that ketosis independently preserves muscle. **Do not dismiss a user who cites preservation studies — those studies are real.** Explain the protein confound.

**>>> This supersedes prohibited claim #62.** The prohibited claim is now specifically: *that ketosis itself, independent of protein intake, preserves lean mass better than other diets at equivalent weight loss.*

## 17.6 Ideal body weight as the protein denominator

**[ESTABLISHED clinical practice]** In individuals with obesity, protein requirements scale with metabolically active tissue rather than total body mass. Adipose tissue has low protein turnover. Using actual body weight substantially overestimates requirement.

Standard approaches: ideal body weight, adjusted body weight (IBW + 0.25 × [actual − IBW]), or fat-free mass directly.

**>>> COACH RULE:** compute from goal or ideal body weight for users with obesity; actual weight is appropriate for users at or near a healthy weight, and for users with high muscle mass.

**>>> The course's goal-weight table uses BMI 23**, which is reasonable but arbitrary. Present as a starting point, never as a prescription. **Never tell a user what she should weigh.** If she has a goal weight, use hers.

## 17.7 The physiological protein ceiling

**[ESTABLISHED]** Hepatic urea synthesis capacity limits tolerable nitrogen load. Exceeding it produces hyperammonemia, hyperaminoacidemia, nausea, weakness, and in extremes death — historically described as "rabbit starvation" or protein poisoning, characteristically when very lean protein is consumed without adequate fat or carbohydrate.

The ceiling is commonly cited around **35–40% of total energy intake**, or roughly 3.5–4.5 g/kg/day.

**Practical plateau:** benefit to lean mass retention plateaus around **~2 g/kg/day** in non-athletes. Intake above this has not demonstrated additional lean-mass benefit.

**>>> VERIFY:** Bilsborough & Mann's review on maximum protein intake is the standard reference. Pin before quoting the percentage.

## 17.8 Very high protein plus very low carbohydrate — the carnivore pattern

**[SUPPORTED mechanism]**

Protein is a potent **glucagon** secretagogue. Glucagon stimulates hepatic glycogenolysis and gluconeogenesis. Under near-zero carbohydrate intake, the insulin:glucagon ratio (corpus 9.6) shifts markedly toward glucagon dominance, raising hepatic glucose output.

Compounding inputs: cortisol (also gluconeogenic — corpus 5.4c, 8.7), and reduced peripheral glucose disposal.

**Result:** fasting glucose commonly 100–110 mg/dL in long-term carnivore or strict ketogenic eaters, frequently with low fasting insulin and normal or excellent HbA1c.

**[ESTABLISHED] Adaptive glucose sparing / physiological insulin resistance.** Skeletal muscle downregulates insulin-stimulated glucose uptake under sustained carbohydrate restriction, preserving glucose availability for obligate glucose-utilizing tissue. Distinct in mechanism and prognosis from pathological insulin resistance.

**[ESTABLISHED] Impaired oral glucose tolerance after prolonged carbohydrate restriction**, reversing within days of carbohydrate reintroduction. A frequent cause of alarm and occasional misdiagnosis.

**>>> COACH RULE — CRITICAL ASYMMETRY.** The "it's just adaptive" reassurance is correct in the right context and harmful in the wrong one.

**Do NOT reassure** a user about elevated fasting glucose unless **all** of the following are known and favourable:
- Fasting insulin low
- HbA1c normal and not trending upward
- No diabetes diagnosis

**Route to a physician** if fasting insulin is elevated or unknown, HbA1c is rising, there is any diabetes diagnosis or strong family history, or the user reports polyuria, polydipsia, unexplained weight loss, or visual change.

**>>> VERIFY both the adaptive glucose sparing and OGTT reversal claims before this content reaches course copy.** Mis-stating this could talk someone out of investigating genuine dysglycemia.

**Secondary concern — energy displacement.** Protein's high satiety can crowd out total energy intake on a low-carbohydrate diet, producing inadvertent deficit. Connects to corpus 16.7 (unintentional under-eating as the primary keto failure mode) and 5.4c.

**Ketone suppression:** very high protein modestly reduces circulating ketones. **Not a reason to restrict protein** — lean mass preservation outweighs ketone concentration.

## 17.9 >>> FAT-FREE MASS IS NOT MUSCLE — measurement limits

**[ESTABLISHED]** Fat-free mass comprises total body water, glycogen, bone mineral, visceral organs, connective tissue, and skeletal muscle protein. Water is the largest component.

**Glycogen and water:** total body glycogen ~400–500 g, each gram associated with roughly 3 g of bound water. Depletion under carbohydrate restriction therefore produces **1.2–1.5 kg of "fat-free mass" loss containing no muscle protein.** Insulin-driven natriuresis adds further fluid loss (corpus 4.3, 16.13).

**Method-specific error:**
- **DXA** — estimates lean soft tissue partly from assumed hydration constants; altered hydration biases the estimate
- **BIA** — infers composition from impedance, which is directly hydration-driven. **Systematically overstates lean tissue loss under carbohydrate restriction or acute fluid shift.**
- **Obligatory fat-free mass:** adipose tissue itself contains water and connective tissue, so some FFM loss is inseparable from fat loss

**>>> COACH RULE — APPLY SYMMETRICALLY. This is non-negotiable.**

This correction reduces apparent lean loss on **both** ketogenic diets **and** GLP-1 agonists. The correction that brought STEP 1's 39% to 30% operated by exactly this mechanism (subtracting obligatory FFM). **The coach must not apply the water and measurement argument to defend low-carbohydrate diets while withholding it from the medications.** Asymmetric application is the single most credibility-damaging error available in this topic area.

**>>> Note that the routine-care GLP-1 study (17.10) used BIA for ~85% of measurements** — the same caveat applies to its figures.

**>>> The defensible position:** DXA and BIA lean mass overstate muscle loss in any rapid weight loss, particularly under carbohydrate restriction. **Function is the superior endpoint.**

## 17.10 GLP-1 agonists and lean mass — current data

**Supersedes corpus 14.3.**

**Trial averages [ESTABLISHED]:** across GLP-1 studies with ≥15% weight loss, lean mass contribution to total loss ranged ~25% (tirzepatide) to ~39% (semaglutide) — within the range observed for weight loss by any method. Correction for obligatory FFM reduced STEP 1's 39% to **30%** (6.9 → 5.1 kg).

**Function [SUPPORTED]:** SEMALEAN (PMC12673431) — semaglutide 2.4 mg: fat mass −14% at M7, −18% at M12; lean mass −3 kg at M7 then stabilized; **handgrip strength +4.5 kg at M12**; sarcopenic obesity prevalence 49% → 33%; REE normalized to lean mass increased M7→M12. Langer et al., *Cell Rep Med* 2026;7:102665 concluded GLP-1 weight loss does not produce disproportionate muscle or function loss.

**Routine care [SUPPORTED — the substantive concern]:** 670,422 first-episode GLP-1 users; 7,965 with paired pre/post body composition over 12 months.
- "Depletive" pattern (>20% total weight loss with >5% LBM loss): **10.3% tirzepatide vs 6.7% semaglutide** (p<0.001)
- LBM loss >15%: **8.0% semaglutide, 9.5% tirzepatide**
- **Dose-dependent:** higher dose and longer exposure associated with progressively greater LBM decline in both drugs (both p<0.001)
- **Tirzepatide consistently worse:** excess LBM loss 1.1%, 1.5%, 1.3%, 2.0% at 3/6/9/12 months
- ~85% of measurements by BIA — see 17.9

**[CONTESTED]** Formally debated at ADA 2026 Scientific Sessions (Klein: no significant concern; Ravussin: opposing). A recent narrative review cites 20–40% of weight loss as lean mass while noting that reduced lean mass alone does not establish sarcopenia, which requires mass, strength, and function criteria together.

**>>> COACH POSITION — the defensible argument, in this order:**
1. Trial averages do **not** support the claim that these drugs are uniquely destructive. Do not make it.
2. A real subgroup — roughly 1 in 10 on tirzepatide — shows genuinely depletive body composition change in routine practice.
3. It is **dose-dependent**, which is actionable.
4. Tirzepatide differs from semaglutide.
5. **Monitoring is nearly absent** — ~8,000 of 670,000 patients had body composition measured. Protein targets and resistance training are rarely prescribed alongside.
6. Scientists are actively debating it; anyone claiming certainty is overstating.

**>>> Corpus 14.1 governs throughout.** Never advise stopping, tapering, or altering dose. Never tell a user she has damaged her metabolism.

## 17.11 Muscle loss and metabolic rate — be accurate about magnitude

**[ESTABLISHED]** Skeletal muscle resting metabolic rate is approximately **13 kcal/kg/day.** Losing 5 kg of muscle therefore reduces RMR directly by roughly **65 kcal/day** — real but modest.

**>>> COACH RULE — DO NOT OVERSTATE THE CALORIC EFFECT.** Claims that muscle loss dramatically lowers metabolic rate through resting expenditure alone are not supported by the arithmetic. A user who checks will find this.

**The larger and better-supported consequences are not caloric:**
- **Reduced glucose disposal capacity.** Skeletal muscle is the primary site of insulin-stimulated glucose disposal (corpus 9.9). Less muscle means the same glucose load requires more insulin — the user finishes weight loss **more insulin resistant than she began.** This is the strongest argument and should lead.
- **Reduced NEAT and functional capacity** (corpus 13.5) — a substantially larger expenditure effect than muscle's direct RMR contribution.
- **Adaptive thermogenesis** (corpus 11.1) — largely independent of muscle mass.
- **Regain risk** compounding with post-weight-loss appetite hormone adaptation (corpus 15.3).

**>>> COACH FRAMING:** lead with the glucose sink, not the calorie count. "Losing muscle shrinks the container your blood sugar goes into" is accurate and more consequential than a metabolic-rate argument.

## 17.12 Resistance training

**[SUPPORTED — strongest available intervention]** Resistance exercise during energy restriction attenuates lean mass loss and supports strength, **independent of dietary model.** Combined with adequate protein it is the best-evidenced strategy for preserving lean tissue during weight loss by any method — dietary, pharmacological, or surgical.

Aerobic exercise does not confer equivalent lean-mass protection.

**>>> COACH USE:** the single highest-yield recommendation for any user losing weight, and particularly for users on GLP-1 agonists (corpus 14.7).

**>>> VERIFY:** the actionable core of this section requires solid primary sourcing before it appears in course copy.

## 17.13 Function as the endpoint

**[ESTABLISHED]** Sarcopenia requires reduced muscle mass **and** diminished strength **and** impaired physical function. Reduced lean mass on imaging alone does not establish it.

Given the measurement limitations in 17.9, **functional measures are more informative than body composition estimates.** Grip strength is well-validated, inexpensive, and measurable at home with a dynamometer. Progressive load in resistance training is equally informative.

**>>> COACH USE:** when a user reports concern about lean mass loss — from any cause — redirect to function. If strength is stable or improving, meaningful muscle loss is unlikely regardless of scan output. This is accurate and reassuring without dismissing the concern.

**>>> Subject to 17.1** — do not suggest tracking tools to a user in a quantification spiral or with disordered eating signals.

---

# ADDITIONS AND AMENDMENTS TO PROHIBITED CLAIMS

**Amend #62** to read: *that ketosis itself, independent of protein intake, preserves lean mass better than other diets at equivalent weight loss* (17.5)

**New:**

71. Any numeric protein target where the personal health situation flag, a disordered eating signal, or reported kidney disease is present (17.1)
72. A protein target computed from actual body weight in a user with obesity (17.6)
73. That muscle loss substantially lowers resting metabolic rate through resting expenditure alone (17.11)
74. That GLP-1 agonists uniquely or catastrophically destroy muscle relative to other weight-loss methods (17.10)
75. Applying the water/glycogen/measurement correction to ketogenic diets without applying it equally to GLP-1 data (17.9)
76. Reassuring a user that elevated fasting glucose is "adaptive" without fasting insulin and HbA1c both known and favourable (17.8)
77. That protein intake increases fat loss (17.4 — no significant effect found)
78. That protein should be limited to protect ketone levels (17.8)
79. Any statement of what a user should weigh (17.6)

---

# COURSE CONFLICT FLAGS — MERGED AWAY 2026-09-18

**This table no longer exists here.** Its six rows were merged into the single master table in `Chapter_03_Backend_Coach.md`.

**Do not re-create a table in this file.** Parallel tables are how the Lesson 9 Randle row came to be retired in one place and left active in another on 2026-09-17, leaving the coach with contradictory standing instructions about the same claim for a day. Add new flags to the master table only.

Note that two of the merged rows (Lesson 6: keto vs GLP-1 lean mass) overlap with the pre-existing master row *"Keto loses proportionally less lean mass than GLP-1s"* — kept as separate rows because they cite different corpus entries (9.1 vs 17.5/17.10). Worth collapsing when the numbering question is resolved.

---

# VERIFICATION BACKLOG — this section

**Highest priority:**
- **17.3** — PROT-AGE (Bauer 2013) for the 1.2–1.6 g/kg range; the course will publish this as a target
- **17.2** — per-meal thresholds (25–30 g / 35–40 g); Moore, Paddon-Jones, Volpi
- **17.8** — adaptive glucose sparing and OGTT reversal; **mis-stating this has clinical consequences**
- **17.12** — resistance training for lean mass preservation; the actionable core

**Secondary:**
- 17.7 — Bilsborough & Mann for the urea cycle ceiling percentage
- 17.11 — the 13 kcal/kg/day figure for skeletal muscle RMR
- 17.6 — ideal/adjusted body weight as protein denominator; standard clinical nutrition sources
- 17.5 — the 2025 VLCLFKD RCT full text; confirm protein intake in both arms, which is the crux
- 17.10 — Karakasis et al., *Metabolism* 2025;164:156113, network meta-analysis of GLP-1 effects on body composition. **Not yet read — likely the single most relevant paper for 17.10 and should be obtained.**
- 17.13 — grip strength normative data and dynamometer validity

---

*Mind Body Functional Health — MetaBurn AI Coach backend. Not for direct user display.*

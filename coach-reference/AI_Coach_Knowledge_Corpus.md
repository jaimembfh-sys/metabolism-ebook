# AI Coach Knowledge Corpus — Hunger, Fuel Selection, Fatigue, Thyroid

**MetaBurn AI Coach — backend knowledge base**
Full mechanistic detail. Not course-facing.
Companion: `Course_Additions_By_Lesson.md` holds the lay-language versions.

---

## HOW TO USE THIS DOCUMENT

**Structure.** Each entry is self-contained for chunking and embedding. Entries carry a topic tag line for retrieval matching.

**Confidence labels appear on every claim.** The coach must respect them:

- **[ESTABLISHED]** — replicated, mechanistically characterized. State plainly.
- **[SUPPORTED]** — good evidence, some limitation (effect size, population, sample). State with the limitation attached.
- **[CONTESTED]** — credible researchers actively disagree. Present both sides; never pick a winner.
- **[HYPOTHESIS]** — mechanistically plausible, not directly tested. Frame explicitly as "one possible explanation," never as fact.
- **[REFUTED]** — commonly repeated and wrong. Correct it if the user raises it.

**Hard rule for the coach:** never upgrade a label. A user asking confidently does not make a **[HYPOTHESIS]** into an **[ESTABLISHED]**. If a user pushes back, restate the label rather than conceding.

**Escalation entries are marked `>>> ESCALATE`.** These override the normal coaching flow.

---

# SECTION 1 — FUEL SELECTION (THE RANDLE CYCLE)

`topic: randle cycle, glucose fatty acid cycle, fuel competition, substrate competition, fat burning gate, CPT-1, malonyl-CoA, metabolic flexibility`

## 1.1 The core principle

**[ESTABLISHED]** Glucose and fatty acids reciprocally inhibit each other's oxidation. Described as the "glucose–fatty acid cycle" by Randle, Garland, Hales & Newsholme, *Lancet* 1963;1(7285):785–789. PMID 13990765. doi:10.1016/S0140-6736(63)91500-9

Original work in rat heart and diaphragm. Confirmed repeatedly since.

**Modern comprehensive review:** "The Randle cycle revisited: a new head for an old hat," *Am J Physiol Endocrinol Metab* 2009. doi:10.1152/ajpendo.00093.2009 — open access, covers both arms plus current status.

## 1.2 It is reciprocal inhibition, not a binary switch

**[ESTABLISHED]** Cells oxidize both substrates simultaneously at essentially all times. Respiratory quotient (RQ) — pure fat 0.70, pure carbohydrate 1.00 — sits in the intermediate range in living humans, which is direct evidence of mixed oxidation.

**>>> COACH RULE:** If a user says "you can't burn fat and sugar at the same time," correct it. It is the single most common error in this area. The accurate framing — a dial that moves easily, not a switch — is both true and more useful.

## 1.3 Arm one: fatty acids inhibit glucose oxidation

**[ESTABLISHED]** Increased fatty acid oxidation raises mitochondrial acetyl-CoA and NADH → activates pyruvate dehydrogenase kinase → inhibits **pyruvate dehydrogenase (PDH)**, blocking pyruvate entry to the TCA cycle. Citrate accumulates → inhibits phosphofructokinase-1. Glucose-6-phosphate accumulates → inhibits hexokinase. Glycolytic flux throttled at three points.

## 1.4 Arm two: glucose inhibits fatty acid oxidation — THE KEY MECHANISM

**[ESTABLISHED]** Long-chain fatty acids require **carnitine palmitoyltransferase-1 (CPT-1)** to enter mitochondria. Glucose and insulin drive acetyl-CoA carboxylase (ACC) to produce **malonyl-CoA**, which inhibits CPT-1.

Malonyl-CoA is the committed precursor for de novo lipogenesis, so its presence is a lipogenic/storage signal. Fatty acids can be abundant in the cytosol and still be unable to enter the mitochondria for β-oxidation.

**Primary sources:**
- McGarry JD, Mannaerts GP, Foster DW. *J Clin Invest* 1977;60(1):265–270. PMID 874089. doi:10.1172/JCI108764
- McGarry JD, Leatherman GF, Foster DW. *J Biol Chem* 1978;253:4128–4136
- McGarry JD, Foster DW. *J Biol Chem* 1979;254(17):8163–8168
- McGarry JD, Foster DW. *Annu Rev Biochem* 1980;49:395–420. doi:10.1146/annurev.bi.49.070180.002143

**Same node controls hepatic ketogenesis.** McGarry & Foster 1979 established that the fasting-induced increase in fatty acid oxidation and ketogenesis can be entirely accounted for by removal of malonyl-CoA inhibition of CPT-1 plus rising hepatic carnitine.

**>>> COACH USE:** This is the mechanism behind every carbohydrate-restriction recommendation in the course. Insulin → malonyl-CoA → CPT-1 closed → fat cannot be oxidized regardless of availability. Explain it as a gate when a user asks why carbohydrate restriction matters, or why "a little bit" of carbohydrate stalls them.

## 1.5 Medium-chain fatty acids bypass CPT-1

**[ESTABLISHED]** In McGarry 1977, malonyl-CoA inhibited ketogenesis from oleate (long-chain, C18) but **not** from octanoate (medium-chain, C8).

Mechanistic basis for MCT/coconut-derived fats behaving differently: medium-chain fatty acids do not require CPT-1 for mitochondrial entry and therefore remain oxidizable under insulin-driven CPT-1 inhibition.

**>>> COACH USE:** Legitimate rationale for MCT during keto-adaptation, and for testing the fuel-gap hypothesis (see 4.4).

## 1.6 AMPK opens the gate

**[ESTABLISHED]** AMPK phosphorylates and inactivates ACC, reducing malonyl-CoA synthesis, and activates malonyl-CoA decarboxylase, accelerating its degradation. Net effect: CPT-1 disinhibition, increased fatty acid oxidation.

Muscle contraction activates AMPK.

**References:** Ruderman NB, Saha AK, Kraegen EW. *Endocrinology* 2003;144:5166–5171. Saha AK, Ruderman NB. *Mol Cell Biochem* 2003;253:65–70. *(Citations pulled from reference lists — confirm page numbers before publishing.)*

**>>> COACH USE:** Direct mechanistic justification for post-meal walking and pre-meal squats. Movement hits the same regulatory node as insulin, from the opposite direction. High-value explanation — users find it motivating.

## 1.7 Acute regulation vs. adaptive capacity

**[ESTABLISHED]** Two distinct timescales:
- **Allosteric/covalent regulation** (minutes to hours) — malonyl-CoA levels, PDH phosphorylation state. Fully reversible.
- **Enzyme expression and mitochondrial biogenesis** (weeks) — CPT-1 expression, β-oxidation enzyme content, mitochondrial density.

Explains why permission to oxidize fat is immediate but competence at it takes weeks.

## 1.8 Where Randle was revised — IMPORTANT FOR CREDIBILITY

**[ESTABLISHED that Randle's insulin-resistance claim did not hold]**

Randle proposed that substrate competition *causes* insulin resistance. The model predicted lipid-induced insulin resistance would raise intramuscular glucose-6-phosphate.

Shulman's group tested it with ¹³C/³¹P MRS in humans. G6P **fell**, and glucose transport decreased — the opposite of Randle's prediction. Attributed to DAG accumulation → novel PKC activation → impaired insulin receptor signaling → reduced GLUT4 translocation.

- Roden M, et al. *J Clin Invest* 1996;97(12):2859–2865
- Dresner A, et al. *J Clin Invest* 1999;103(2):253–259
- Shulman GI. *J Clin Invest* 2000;106(2):171–176
- Samuel VT, Petersen KF, Shulman GI. *Lancet* 2010;375(9733):2267–2277
- Samuel VT, Shulman GI. *Cell* 2012;148(5):852–871

**Critical nuance:** in acute rodent lipid infusions under 2 hours, G6P *did* rise as Randle predicted (Jucker et al. 1997, cited in Samuel & Shulman 2012). Randle effects are valid acute substrate regulation; they are not the explanation for insulin resistance in chronic disease.

**>>> COACH RULE:** Do not cite the Randle cycle as the cause of insulin resistance. It is commonly misused this way in low-carb content. Two distinct mechanisms: (a) acute fuel selection = Randle, (b) chronic insulin resistance = lipid-mediated signaling interference. Connects to the course's ceramide material (Lesson 10), since DAG and ceramide are the same family.

## 1.9 Metabolic flexibility — formal definition and caveat

**[SUPPORTED]** Kelley & Mandarino defined metabolic flexibility as the acute switch from fasting fat oxidation to insulin-stimulated carbohydrate oxidation, measured as ΔRQ. Insulin resistance and T2D show "metabolic inflexibility." *Diabetes* 2000;49(5):677–683. PMID 10905472. doi:10.2337/diabetes.49.5.677

**Review:** Goodpaster BH, Sparks LM. *Cell Metab* 2017;25(5):1027–1036. PMID 28467922

**[CONTESTED] — the causal direction.** Galgani JE, et al. *Diabetes* 2008;57:841–845 found metabolic inflexibility to glucose in T2D was mostly attributable to defective glucose transport; flexibility improvements after weight loss disappeared after adjusting for insulin-stimulated glucose disposal rate.

**>>> COACH RULE:** Use metabolic flexibility as a descriptive concept. Do not assert it as an independent defect or an independent treatment target.

---

# SECTION 2 — HUNGER AND SATIETY SIGNALING

`topic: hunger cues, satiety, snacking, cravings, full but still hungry, appetite hormones, ghrelin, GLP-1, CCK, PYY, leptin`

## 2.1 Gastric distension vs. nutrient sensing

**[ESTABLISHED]** Two dissociable systems.

**Mechanical:** vagal afferent mechanoreceptors in the gastric muscularis → nucleus tractus solitarius. Volume-dependent, nutrient-blind (water produces it). Dissipates in roughly 30–90 minutes with gastric emptying.

**Nutrient-sensing:** enteroendocrine cells.
- **CCK** — I cells, duodenum/jejunum. Fatty acids and peptides. CCK-A receptors on vagal afferents. Short half-life.
- **GLP-1, PYY** — L cells, distal ileum and colon. Longer-acting. PYY3-36 acts on Y2 autoreceptors inhibiting NPY/AgRP. GLP-1 slows gastric emptying and acts centrally at the arcuate nucleus and area postrema.
- **SCFAs** from colonic fermentation stimulate L-cell secretion hours post-meal.

**Clinical consequence:** high-volume, low-protein/fat/fiber meals produce strong distension and weak nutrient signaling → "full but snacky within the hour."

## 2.2 Ghrelin is schedule-entrained

**[ESTABLISHED]** Ghrelin from X/A-like cells of the gastric fundus is the only well-characterized orexigenic gut hormone. Pre-prandial rise is **anticipatory and conditioned to habitual meal timing** — it tracks imposed meal schedules rather than energy status.

Same pattern centrally: AgRP neurons fire in anticipation of food and are rapidly silenced by the *sight* of food before absorption.

**>>> COACH USE:** Validates the user's experience — scheduled hunger is a real hormonal signal, not imagination. Also grounds the argument against grazing: frequent eating entrains more frequent ghrelin peaks. Adaptation to a changed schedule takes days, not weeks.

## 2.3 Sensory-specific satiety

**[ESTABLISHED]** Repeated exposure to one food's sensory profile devalues that food — measurable as declining orbitofrontal cortex response — while responsiveness to a different taste/texture profile is preserved. Fully dissociable from gastric volume.

## 2.4 Dopamine: wanting, not liking

**[ESTABLISHED]** Phasic dopamine in the nucleus accumbens encodes reward prediction error (Schultz) and assigns **incentive salience** (Berridge & Robinson). Dopamine depletion or antagonism abolishes *seeking* while leaving hedonic orofacial "liking" reactions intact.

Liking is generated separately — μ-opioid and endocannabinoid signaling in hedonic hotspots of the NAc shell and ventral pallidum.

**Cue transfer:** once a cue reliably predicts food, the dopamine response shifts forward onto the cue.

**>>> COACH USE:** Highest-value reframe available for craving conversations. The pull is not the pleasure. It is cue-triggered and does not consult satiety state. Changes the intervention from "resist harder" to "change the cue and the routine."

## 2.5 Post-ingestive reward independent of taste

**[ESTABLISHED]** Sweet-blind (Trpm5-knockout) mice develop preference for glucose over non-caloric sweetener — gut glucose sensing drives striatal dopamine without taste input (de Araujo). Human PET shows two-phase dopamine release: one at taste, one after nutrients reach the gut (Thanarajah et al., *Cell Metab* 2019).

**>>> COACH RULE:** Reward cannot be fully decoupled from calories by changing flavor alone. Relevant when users ask about non-caloric sweeteners — the picture is more complicated than "no calories, no response."

## 2.6 Fat + refined carbohydrate: supra-additive reward

**[SUPPORTED]** DiFeliceantonio et al., *Cell Metab* 2018: foods combining fat and refined carbohydrate are valued supra-additively in human striatal reward circuitry. Participants paid more for them, and the reward signal exceeded what either macronutrient produced alone.

**Not explained by** caloric content, subjective liking, or familiarity.

No single whole food has this profile.

**>>> COACH USE:** Best available mechanistic explanation for specific trigger foods. Supersedes exorphin explanations (see 2.9). When a user reports losing control around bread-and-butter, cheese-and-crackers, pastry, chips, or ice cream — this is why, and it's the composition rather than a personal failing.

## 2.7 Glucose dips predict hunger

**[SUPPORTED]** Wyatt et al., *Nature Metabolism* 2021 (PREDICT): in ~1,000 participants, the magnitude of the **post-meal glucose dip at 2–3 hours** predicted greater subjective hunger, shorter time to next meal, and higher subsequent intake. Peak glucose did not predict well.

Mechanistically consistent with carbohydrate-insulin framing, but stands independently of that debate.

## 2.8 Modulatory inputs

**[ESTABLISHED]**
- **Leptin** — adipose-derived, signals long-term energy availability to POMC/AgRP. Reduced central leptin signaling raises AgRP drive and increases food reward salience. *Note: "leptin resistance" is partly a descriptive label; the molecular account is incomplete.*
- **Insulin** — centrally anorexigenic via hypothalamic receptors. Peripheral insulin resistance appears to blunt this arm while peripheral hyperinsulinemia continues driving substrate storage.
- **Sleep restriction** — raises ghrelin, lowers leptin, increases appetite ratings with disproportionate pull toward energy-dense food (Spiegel et al. and replications). Effect sizes vary; direction is consistent.
- **Glucocorticoids** — potentiate NPY signaling, increase palatable food intake. Dallman's work established that glucocorticoids increase the reinforcing value of comfort foods, with resulting intake blunting HPA reactivity — a genuine feedback loop. Acute stress can suppress appetite via CRH; sustained elevation does the opposite.
- **Luteal phase** — progesterone/estradiol shifts raise intake, roughly 100–300 kcal/day in controlled studies.
- **Protein leverage** (Simpson & Raubenheimer) — appetite appears to defend absolute protein intake; protein-sparse meals can leave residual drive regardless of total energy.

## 2.9 Exorphins — gluten and casein peptides

**[HYPOTHESIS — do not present as established]**

**Real chemistry:** Zioudrou, Streaty & Klee, *J Biol Chem* 1979 identified opioid-receptor-active peptides in peptic digests of wheat gluten and casein. Gluten exorphins A5/B5/C5 and β-casomorphin-7 are μ-opioid agonists *in vitro*. The A1/A2 β-casein distinction is real — A1 has histidine at position 67 permitting cleavage yielding BCM-7; A2 has proline and resists it.

**Unclosed chain.** For a dietary exorphin to act centrally it must: (1) survive gut peptidases — these are proline-rich and DPP-4 plus brush-border peptidases specifically degrade them; (2) cross intact epithelium as a heptapeptide — plasma BCM-7 detection is inconsistent and concentrations very low; (3) cross the BBB in pharmacologically meaningful amounts — essentially undemonstrated in healthy humans; (4) exert effects at those concentrations — in vitro potency is low relative to endogenous opioids.

EFSA's 2009 review of BCM-7 found no established cause-and-effect relationship with disease outcomes. A1/A2 GI symptom trials (Jianqin 2016, He 2017) report small effects, mostly in self-identified intolerant subgroups, with substantial industry funding. Cochrane reviews of gluten- and casein-free diets for autism and for schizophrenia both conclude evidence is insufficient.

**>>> COACH RULE — COMMON CONFLATION:** Naltrexone and naloxone *do* reduce palatable food intake and hedonic ratings in humans. That is robust. It demonstrates that **endogenous** opioid signaling mediates food pleasure. It says nothing about dietary exorphins. Users and practitioners cite these trials as support for the casomorphin hypothesis constantly; they do not bear on it.

**>>> COACH POSITION:** Mechanistically plausible, not demonstrated in vivo, and unnecessary — entry 2.6 explains the phenomenon without it. If a user is committed to the exorphin framing, do not argue at length. Acknowledge the real chemistry, note the unproven steps, and redirect to the fat/carb mechanism.

---

# SECTION 3 — REFUTED CLAIMS

`topic: myths, misconceptions, turkey tryptophan, serotonin carbs, thirst hunger, meal frequency, metabolism boost`

## 3.1 Turkey/tryptophan sleepiness — [REFUTED]

**[ESTABLISHED mechanism, opposite to the popular claim]**

Tryptophan crosses the BBB via LAT1, competing with other large neutral amino acids (tyrosine, phenylalanine, leucine, isoleucine, valine). Brain uptake depends on the **tryptophan-to-LNAA ratio**, not absolute tryptophan.

Fernstrom & Wurtman (1971–72): carbohydrate raises this ratio in rats — insulin drives BCAA uptake into skeletal muscle while albumin-bound tryptophan resists, shifting the ratio favorably.

**Why it fails with real food:** tryptophan is the scarcest amino acid in nearly all dietary protein, so adding protein delivers proportionally far more competitors. Fernstrom's own follow-up found as little as ~5% protein abolishes the carbohydrate effect in rats. Human meals essentially always exceed that.

Turkey is protein; it *lowers* the ratio. It is also not notably tryptophan-rich — egg white, soy, and most cheeses are comparable or higher per gram of protein.

## 3.2 Carbohydrates for serotonin/mood — [REFUTED as a practical lever]

Same transport mechanism as 3.1, same failure mode. Wurtman's "carbohydrate-craving obesity" hypothesis was influential in the 1980s–90s and did not replicate well. Benton's reviews found effects inconsistent, small, and heavily confounded by expectancy.

**Circularity:** 5-HT2C signaling on POMC neurons is anorexigenic — the mechanism behind fenfluramine and lorcaserin (withdrawn 2020 over a cancer signal). The theory posits craving the thing that would suppress the craving.

**Foods containing serotonin** (bananas, plantains, walnuts, tomatoes) are irrelevant — serotonin does not cross the BBB. ~95% of body serotonin is in gut enterochromaffin cells and platelets, a separate pool.

**Asymmetry worth knowing:** acute tryptophan depletion reliably lowers brain 5-HT and produces measurable mood lowering — but mainly in vulnerable populations (remitted depressed patients, family history, SSRI responders). Healthy controls without risk factors are largely unaffected. **The system has downside sensitivity without a usable upside lever from ordinary eating.**

## 3.3 "You're not hungry, you're thirsty" — [REFUTED]

Thirst and hunger use distinguishable circuits (subfornical organ/OVLT and vasopressin signaling for thirst). Controlled studies of water preload on subsequent intake show small, inconsistent effects. Water may briefly reduce intake via gastric distension, but the signal-misinterpretation story is not well evidenced.

## 3.4 "Eat every 2–3 hours to boost metabolism" — [REFUTED]

Meal frequency has no meaningful effect on 24-hour energy expenditure when total intake is matched; tested repeatedly. Frequent eating actively entrains more frequent ghrelin peaks (see 2.2), working against the intended goal.

## 3.5 "One big meal burns 38% more" — [REFUTED]

**This claim appeared in the course (Lesson 9) and has been removed. The coach must not reproduce it.**

**Source:** Tai MM, Castillo P, Pi-Sunyer FX. *Am J Clin Nutr* 1991;54(5):783–787. PMID 1951147. Seven healthy normal-weight young women; identical 750 kcal meal taken over 10 min vs. six 125-kcal portions at 30-min intervals over 3 h; metabolic rate measured for 5 h from meal start. TEF significantly higher on the large-meal day (P<0.05).

**Why it doesn't support the claim:**
1. n=7, single crossover, one population.
2. **Measurement window artifact.** Measurement ran 5 h from start; the final small meal was consumed at 2.5 h, so roughly half its thermic response fell outside the window. A later study with a longer window found total 10-hour TEF did not differ between 2 large and 4 small meals (43.43 ± 5.01 vs. 43.42 ± 4.72 L O₂) and explicitly attributed the null to the more complete measurement period.
3. **Whole-room calorimetry contradicts it.** A crossover comparing 3 vs. 6 meals/day found no differences in 24-hour energy expenditure, RQ, or fat oxidation. Review-level assessment: some short-term studies suggest TEF is higher when a load is *divided*, others refute this, most are neutral — the instability of these short-window findings is itself informative.
4. **Internal inconsistency** with 3.4. Same claim, sign flipped.

**[SUPPORTED — the finding that does hold]** In the 3-vs-6 meal comparison, participants eating 6 meals reported greater hunger and desire to eat. **Fewer meals win on appetite, not thermogenesis.**

**[SUPPORTED] Circadian TEF.** Identical meals produce substantially higher thermogenic responses in the morning than the evening. *Caveat:* Some of the apparent daily TEF rhythm is attributable to the circadian rhythm in resting metabolic rate depending on how TEF is calculated (*JCEM* 2022;107(2):e708). Directionally sound; don't over-quantify.

---

# SECTION 4 — POST-MEAL FATIGUE AND COGNITIVE FOG

`topic: tired after eating, postprandial fatigue, brain fog, food coma, energy crash, cognitive symptoms after meals`

## 4.1 Within-person variability is the framing

**[ESTABLISHED]** Zeevi et al., *Cell* 2015; PREDICT studies: within-person coefficient of variation of roughly 25–30% for glycemic response to an *identical* standardized meal on different days.

**>>> COACH RULE — DEFAULT OPENING for inconsistent-energy reports:** When a user reports variable energy on a consistent diet, the food is the constant and the variance is elsewhere. Redirect to timing, sleep, portion, prior hunger, and movement rather than meal composition. This is also reassuring — it counters "my body is broken."

## 4.2 Peripheral mechanisms (physical tiredness)

**[ESTABLISHED]**
- **Circadian insulin sensitivity** — peaks in the morning; identical evening meals produce larger excursions and slower clearance.
- **Endogenous post-lunch alertness dip** — occurs in forced-desynchrony protocols even in fasted subjects. The afternoon slump is partly circadian, not caused by the meal.
- **Sleep** — duration and quality predict next-day postprandial glycemic response (PREDICT). Sleep debt also raises adenosine tone.
- **Pre-meal drive state** — high AgRP drive/longer fast → eating feels activating. Scheduled eating without drive → parasympathetic shift dominates → reads as sedation.
- **Post-meal movement** — light walking markedly changes glucose handling via insulin-independent GLUT4 translocation (see 1.6).
- **Meal volume** — independent of composition; larger meals cause greater splanchnic blood flow diversion and postprandial hypotension.
- **CCK somnogenesis** — fat is the strongest CCK stimulus; CCK has direct sleep-promoting effects via vagal afferents and slows gastric emptying. **Nut portions are the most common unrecognized driver.** Typical self-reported "handful" is 45–60 g vs. an assumed 28 g.
- **Protein TEF** — roughly 20–30% vs. 5–10% for fat. Real thermogenesis for hours; experienced variably as warmth/alertness or as a drain.

**[SUPPORTED] Dark chocolate as a stimulant.** 30 g of 70–85% dark chocolate contains roughly 200–400 mg theobromine plus 15–25 mg caffeine. Theobromine is a weaker but longer-acting adenosine antagonist, half-life ~6–8 h. Cocoa flavanols increase NO-mediated vasodilation with some evidence for increased cerebral blood flow and acute cognitive effects (Scholey and Owen). *Effect sizes modest; field has funding-source issues.*

**[HYPOTHESIS] Amine content.** Histamine accumulates in meat and fish with storage time; dark chocolate contains tyramine and phenylethylamine. Individual sensitivity varies with DAO activity. *The histamine intolerance literature is weak and largely uncontrolled.* Fresh vs. day-three leftover is worth noticing if the pattern tracks; don't build a protocol on it.

## 4.3 Cerebral perfusion

**[ESTABLISHED mechanism]** Eating triggers splanchnic vasodilation — roughly 20–25% of cardiac output redirects to the gut. Baroreflex-mediated vasoconstriction and heart rate normally compensate. If plasma volume is low, compensation is incomplete and cerebral perfusion pressure drops. Brain is perfusion-sensitive in a way muscle is not → presents as cognitive shutdown rather than tiredness.

**Low-carb relevance:** low insulin increases renal sodium excretion; sodium loss drives water loss. Well-documented; mechanism behind early rapid weight loss on carbohydrate restriction.

**>>> IMPORTANT CALIBRATION:** The natriuresis of carbohydrate restriction is **mostly front-loaded to the first 1–2 weeks**; renal adaptation follows. In a long-term low-carb eater who salts to taste, this is unlikely to be a persisting deficit. Do not assume sodium depletion in anyone eating this way for months.

**Discriminating features:** worse on standing; worse with larger meals; lightheadedness. If none present, deprioritize this branch.

**Objective test rather than intake estimation:** basic metabolic panel plus seated vs. standing blood pressure. Standing systolic drop under 10 mmHg closes the question.

## 4.4 Brain substrate switching — the fuel gap

**[HYPOTHESIS — mechanistically sound, not studied as a fatigue cause]**

On a low-carbohydrate diet the brain runs on a glucose/ketone mix. A large protein load raises insulin modestly (via gluconeogenic amino acids and glucagon–insulin dynamics), which suppresses lipolysis and ketogenesis via the CPT-1 mechanism in 1.4. With little dietary carbohydrate arriving, hepatic gluconeogenesis compensates but with a lag. Transient window — perhaps 30–90 minutes — of reduced availability of both fuels. Peripheral tissues have alternatives; the brain has fewer.

**>>> COACH RULE:** Present explicitly as "one possible explanation worth testing," never as established. It is reasoning from physiology, not from trial data.

**Testable predictions:**
- Should be worse after highest-protein, lowest-fat meals; better after higher-fat, moderate-protein meals.
- Should be blunted by MCT or coconut oil with the meal (see 1.5 — MCTs are rapidly ketogenic and bypass CPT-1 inhibition).

## 4.5 Postprandial endotoxemia and central cytokine signaling

**[SUPPORTED for the mechanism; effect sizes on cognition small]**

High-fat meals transiently increase circulating LPS via chylomicron-associated translocation, with modest IL-6 and TNF-α rise. Peripheral cytokines signal centrally via vagal afferents and the area postrema, producing sickness behavior — reduced motivation, impaired concentration, mental heaviness.

IL-6 and IFN-γ also induce IDO1, shunting tryptophan toward kynurenine (see 4.7).

**Best-supported mechanism for cognitive rather than physical post-meal fatigue.** Caveat: studies use high-fat challenges considerably larger than a normal meal.

Also **[SUPPORTED]** postprandial lipemia: large fat loads produce a chylomicron surge; some studies show transient endothelial dysfunction and reduced cognitive performance. Evidence mixed, effect sizes small.

## 4.6 Neuroglycopenia precedes physical symptoms

**[ESTABLISHED]** Low blood glucose impairs cognition before producing autonomic symptoms. Fog precedes shakiness.

**Relevant even on low-carb** — protein and fat are not glycemically inert. Shakiness, palpitations, or sweating alongside fog raises the probability substantially. CGM over two weeks resolves it directly; excursions should be small on a low-carb diet, so the data reads cleanly.

## 4.7 The kynurenine shunt

**[ESTABLISHED biochemistry; [CONTESTED] causal role in depression]**

Over 90–95% of dietary tryptophan goes down the kynurenine pathway, not to serotonin. Gating enzymes: TDO (hepatic, cortisol-induced) and IDO1 (extrahepatic, induced by IFN-γ, IL-6, TNF-α).

Inflammation and sustained cortisol divert tryptophan toward kynurenine metabolites — quinolinic acid (NMDA agonist) versus neuroprotective kynurenic acid. The IFN-α treatment literature is the clean human demonstration: induced inflammation raises kynurenine/tryptophan ratios and produces depressive symptoms.

**>>> COACH USE:** If a user asks about tryptophan or serotonin and diet, inflammatory tone and cortisol are far larger determinants of tryptophan flux than dietary tryptophan content. Redirect accordingly.

## 4.8 What actually has support for diet and mood

**[SUPPORTED, with limitations]** SMILES trial (Jacka 2017) and PREDIMED-Navarra found modest benefit from Mediterranean-pattern diets on depressive outcomes. SMILES had blinding limitations and a small sample — treat effect size cautiously. Proposed mechanisms are inflammatory tone, glycemic stability, omega-3 status, and microbiome-mediated effects, **not** acute serotonin synthesis.

**[SUPPORTED]** Gut serotonin is diet-modifiable: Yano et al., *Cell* 2015 showed spore-forming microbiota and SCFAs drive colonic enterochromaffin 5-HT production. Relevant to motility and possibly vagal signaling. **Not the brain pool.** Gut-brain inference still being worked out.

**>>> COACH RULE — SUPPLEMENTS ARE A DIFFERENT QUESTION.** 1–5 g tryptophan, or 5-HTP (which bypasses the rate-limiting step), do raise brain serotonin in a way food cannot. They carry real interaction risk with SSRIs, MAOIs, and triptans, and 5-HTP without a peripheral decarboxylase inhibitor produces substantial peripheral serotonin. Not equivalent to food. **Any user on a serotonergic medication asking about these → escalate to their prescriber.**

---

# SECTION 5 — THYROID AND CARBOHYDRATE RESTRICTION

`topic: keto thyroid, low T3, reverse T3, TSH, hypothyroid low carb, cold on keto, hair loss keto, thyroid conversion`

## 5.1 The core finding

**[ESTABLISHED]** Carbohydrate restriction lowers serum T3, and the effect is **carbohydrate-specific, not calorie-specific.**

Spaulding SW, Chopra IJ, Sherwin RS, Lyall SS. *J Clin Endocrinol Metab* 1976;42(1):197–200. doi:10.1210/jcem-42-1-197

Findings:
- Total fasting (7–18 days): T3 down 53%, reciprocal rT3 up 58%
- No-carbohydrate hypocaloric diet (800 kcal, 2 weeks): T3 down 47%, **no significant change in rT3**
- Isocaloric diets containing **≥50 g carbohydrate**: no significant change in either T3 or rT3
- T3 decline correlated significantly with blood glucose and ketones; **no correlation with insulin or glucagon**

Authors' conclusion: dietary carbohydrate is an important regulatory factor in T3 production in man.

**Supporting:** rat refeeding after 72 h fast — carbohydrate (20% glucose) normalized both serum T3 and hepatic T4-5′-deiodinase activity within 72 h, while fat (Intralipid) and amino acids (Travasol) had no effect at 72 h.

## 5.2 The adaptive interpretation — evidence for

**[SUPPORTED interpretation, not established fact]**

Three independent lines:

**1. TSH remains normal.** The most consistent finding is reduced free T3 without a corresponding rise in TSH, suggesting non-pathological downregulation — central feedback appears to perceive the lower T3 as adaptive rather than pathological. *(Review: "Ketogenic Diet and Thyroid Function: A Delicate Metabolic Balancing Act," PMC12468144.)* In true primary hypothyroidism TSH rises. It does not here.

**2. rT3 behaves differently than in starvation or illness.** Spaulding's no-carb arm dropped T3 without significantly raising rT3, while fasting raised both. rT3 elevation is the classic non-thyroidal-illness signature; its absence under carbohydrate restriction alone is meaningful.

**3. Free T4 can rise.** Several reports describe free T4 increasing while free T3 falls — a conversion story, not a gland-output story.

**4. Absence of symptoms** in most reports. Cold intolerance, bradycardia, and constipation are cardinal hypothyroid features. Their absence argues against tissue-level hypothyroidism.

**>>> NOTE ON USER-REPORTED WARMTH:** A user reporting feeling *warmer* on keto is reporting evidence against functional hypothyroidism, since cold intolerance is cardinal. Plausible mechanisms: sympathetic/norepinephrine activation during keto-adaptation (Phinney), and elevated protein TEF (4.2). Acknowledge it as meaningful. Do not generalize from it — n=1, and the comparison state matters.

## 5.3 The adaptive interpretation — limits

**[CONTESTED]**

**Mechanism is unsettled.** The PMC12468144 review attributes the effect to low carbohydrate availability decreasing insulin secretion, which suppresses deiodinase activity. But Spaulding found the T3 decline correlated with glucose and ketones and **not** with insulin. These disagree.

**>>> COACH RULE:** Do not assert a mechanism for the T3 drop. State the finding; note the mechanism is unresolved.

**"Adaptive" is an interpretation.** The data show low T3, normal TSH, usually no symptoms. "Therefore less is needed" is a reasonable inference — but it is the same reasoning structure used to dismiss low T3 in chronic illness, where it is not benign. What would settle it is tissue-level thyroid action, which is hard to measure.

**Contradicting data on rT3 and fat.** A 1980 study (*Metabolism*) found an all-fat isocaloric 1500-kcal diet dropped T3 by 50% and raised rT3 by 123% — equal to total starvation. A 50/50 fat-carbohydrate arm still raised rT3 34% despite 750 kcal of carbohydrate. Authors concluded high-concentration fat itself may actively induce these changes. **This directly complicates the rT3 discriminator in 5.5.**

**Population caveat.** Women appear more vulnerable to HPT and HPG axis suppression under carbohydrate restriction, particularly with concurrent energy deficit. Relevant to the course's primary audience.

## 5.4 Contributing factors when keto affects thyroid negatively

### 5.4a Liver — strongest link

**[ESTABLISHED]** D1 is concentrated in the liver and is a principal site of T4→T3 conversion. Reduced hepatic D1 activity directly decreases T4-to-T3 conversion while D3 increases rT3 production.

Three ways this stacks under carbohydrate restriction:
1. Hepatic deiodinase activity is carbohydrate-responsive (5.1, rat refeeding data).
2. Hepatic gluconeogenic workload rises substantially.
3. A 70–80% fat diet requires substantial bile. Compromised hepatobiliary function or cholecystectomy makes the diet poorly tolerated independent of thyroid status.

**>>> COACH USE:** Connects to course Lesson 11. If a user reports poor keto tolerance plus GI symptoms (nausea, steatorrhea, loose stools on high fat), address bile and hepatobiliary function before concluding the diet is wrong in principle.

### 5.4b Inflammation and chronic infection

**[ESTABLISHED]** Cytokine exposure suppresses D1 and D2 while inducing D3, shifting peripheral conversion toward inactivation. IL-6 and TNF-α are the principal mediators.

Wajner SM, et al. *J Clin Invest* 2011;121(5):1834–1841 (PMID 21540553): IL-6 at concentrations seen in critical illness inhibited D1- and D2-mediated T3 production in intact cells despite increased deiodinase mRNA. **N-acetylcysteine, which restores intracellular glutathione, prevented the inhibition** — suggesting IL-6 acts by depleting a thiol cofactor, probably GSH. IL-6 simultaneously stimulated D3-mediated T3 inactivation.

Central effects: cytokine signaling at the hypothalamus reduces TRH expression, blunting TSH. NF-κB implicated in deiodinase regulation and HPT suppression.

Elevated D3 activity has been identified in liver and skeletal muscle of sick patients, positively correlated with rT3 levels.

**>>> KEY CONVERGENCE:** Glutathione synthesis is largely hepatic. Liver function and inflammation are not independent hypotheses here — they meet at the same cofactor. This unifies 5.4a and 5.4b.

**Note:** D2 in brain remains active during illness, maintaining local brain T3 despite systemic reduction. Consistent with a prioritization rather than failure model.

### 5.4c Stress and under-eating — reframe the "adrenal" hypothesis

**[ESTABLISHED mechanism]** Elevated cortisol at the hypothalamus suppresses TRH gene expression, contributing to central suppression. Cortisol therefore pushes the same direction as inflammation and carbohydrate restriction.

**>>> COACH RULE — TERMINOLOGY:** Do not use "adrenal fatigue." A systematic review (Cadegiani & Kater, *BMC Endocr Disord* 2016) found no substantiation for it as a clinical entity. HPA axis dysregulation is real; the fatigue model is not. Use "stress physiology" or "HPA dysregulation."

**[SUPPORTED — and the more likely mechanism in practice] Low energy availability.** Carbohydrate restriction suppresses appetite, so unintentional under-eating is common. Sustained energy deficit suppresses both HPT and HPG axes — well documented in the athlete/RED-S literature.

**>>> COACH USE — HIGH VALUE:** For a long-term low-carb user reporting cold intolerance, fatigue, hair thinning, or cycle disruption, **increasing intake is frequently the correction, not further restriction.** Counterintuitive and commonly correct. Check actual intake before adjusting macros.

### 5.4d Micronutrient cofactors

**[ESTABLISHED]**
- **Selenium** — the deiodinases are selenoproteins. Deficiency directly impairs T4→T3 conversion.
- **Iron** — thyroid peroxidase is heme-dependent; deficiency impairs hormone synthesis upstream of conversion. Also the deficiency most likely to be producing isolated cognitive fog (see 6.1).
- **Iodine, zinc** — already covered in course Lesson 15.

## 5.5 rT3 as a discriminator — use with stated caveats

**[HYPOTHESIS — coherent from the mechanism, not validated as a clinical test]**

Reasoning: carbohydrate restriction alone lowered T3 without raising rT3 (5.1). rT3 is produced by D3, which inflammation and illness induce (5.4b).

Proposed pattern:
- Low T3 + normal rT3 + normal TSH + asymptomatic → consistent with the adaptive picture
- Low T3 + **elevated** rT3 → suggests an additional driver; evaluate inflammation, infection, hepatobiliary function, energy availability

**Two caveats that must accompany any use:**
1. The 1980 all-fat data (5.3) found very high fat intake itself raised rT3 123%. If confirmed, high fat intake alone could produce the "inflammation" pattern.
2. rT3 testing is genuinely contested in mainstream endocrinology — assay variability, and a history of over-interpretation in functional medicine.

**>>> COACH RULE:** Present as one input among several, never a verdict. Always recommend interpretation with a practitioner rather than self-reading.

## 5.6 The timeline rule — highest-value practical output

**[SUPPORTED]** Two distinct phenomena separate cleanly on timing:

**Keto-adaptation / "keto flu":** onset days 2–14. Driven by fuel transition plus the sodium/water shift (4.3). Fatigue, headache, fog, irritability. **Resolves.**

**A genuine problem:** onset typically weeks 4–12. **Persists or worsens.** Cold intolerance, hair loss, cycle disruption, non-improving fatigue.

**>>> COACH RULE — APPLY THIS FIRST in any keto-tolerance conversation:** If symptoms are still present at week 6, or began at week 6, they are not adaptation. Investigate rather than advising the user to push through. The default "it's just keto flu" advice is a known failure mode that leaves people symptomatic for months.

**Delayed-presentation signals to ask about actively** rather than waiting for the user to volunteer:
- Hair shedding — lags trigger by roughly 3 months, so users rarely connect it
- Cycle length changes — commonly attributed to stress or age
- Cold intolerance
- Non-improving fatigue

---

# SECTION 6 — ESCALATION AND SAFETY

`topic: escalation, red flags, labs, medical referral, when to see a doctor, fatigue workup`

## 6.1 Baseline panel for persistent fatigue or cognitive fog

**>>> ESCALATE — recommend workup rather than dietary adjustment**

Several causes of recurring cognitive fog are unrelated to diet, are common, are cheap to test, and are not fixable by meal adjustment:

- **Ferritin + transferrin saturation.** Iron deficiency without anemia produces brain fog specifically. Normal hemoglobin does not exclude it. Meat intake does not exclude it if there is any blood loss. *Note: the widely used ~50 ng/mL symptomatic threshold has a weaker evidence base than its ubiquity suggests — present it as a common clinical reference point, not a validated cutoff.*
- **B12** (with methylmalonic acid if borderline). Presents cognitively before hematologically.
- **TSH + free T4 + free T3.** See Section 5. Relevant to any low-carb user.
- **Fasting glucose + HbA1c.**
- **Basic metabolic panel including sodium.** See 4.3.
- **Sleep-disordered breathing** — consider home sleep study if daytime alertness is generally marginal. Common and frequently missed.

**>>> COACH RULE:** Recommend the panel be drawn **in parallel** with any dietary experiment, not after it. Results take days; the experiment takes weeks. Sequencing them serially wastes a month.

## 6.2 Urgent escalation triggers

**>>> ESCALATE IMMEDIATELY — do not offer dietary guidance as the primary response**

- Cognitive fog severe enough to impair driving
- Genuinely involuntary sleep onset (consider idiopathic hypersomnia, narcolepsy)
- Post-meal fog with palpitations, sweating, tremor (reactive hypoglycemia; rarely insulinoma)
- Symptomatic orthostatic intolerance
- Any new neurological symptom

## 6.3 Claims the coach must not make

1. "You can't burn fat and carbs at the same time" (1.2)
2. "The Randle cycle causes insulin resistance" (1.8)
3. "One big meal burns 38% more energy" — removed from the course (3.5)
4. Any framing of the keto metabolic advantage as large or as the primary mechanism (7.1)
5. "Adrenal fatigue" as a diagnosis (5.4c)
6. Any assertion of the mechanism behind the low-carb T3 drop (5.3)
7. Gluten/casein exorphins as an established cause of food cravings (2.9)
8. Any interpretation of rT3 as a standalone verdict (5.5)
9. Turkey/tryptophan, carbs-for-serotonin, thirst-not-hunger, eat-every-3-hours (Section 3)
10. "Fasting lowers cortisol" or any "cortisol reset" framing built on fasting (8.3)
11. Any personalized clock-time eating window, or that being off by a set number of minutes changes fat storage (8.6)
12. "Menopausal belly fat is a cortisol problem" as the primary framing (8.2)
13. A normal serum cortisol as proof cortisol *is* involved — the local-regeneration mechanism cuts both ways (8.1)
14. That low-carb or ketogenic diets lose proportionally less lean mass than GLP-1 agonists — not supported (9.1)
15. Any GLP-1 adverse-event hazard ratio without the absolute incidence alongside it (9.3)
16. That a user on a GLP-1 has damaged their metabolism (9.5)
17. Any advice to stop, taper, or change the dose of a prescribed medication (9.5, 9.13)
18. Specific hour thresholds for autophagy onset (9.11)
19. A numeric insulin-to-glucagon ratio target (9.6)
20. Any recommendation for or against menopausal hormone therapy (9.13)
21. That non-nutritive sweeteners trigger a meaningful insulin response, or that diet soda breaks a fast via insulin (1.2). **Note: this conflicts with published course content in Lesson 2. The corpus is correct; the course needs updating. Until it is, the coach should answer from the corpus and not cite the lesson.**
22. That cold exposure permanently raises resting metabolic rate (1.6)
23. That angiotensin II and aldosterone act in the same direction on fat cell formation — angiotensin II inhibits adipocyte differentiation while aldosterone promotes adipogenesis (1.4)

## 6.4 Existing safety interactions

- **Personal health situation flag active** → suppress numeric targets and weight-focused language throughout, including in any of the above.
- **Disordered eating signals** → do not provide numeric nutrition, diet, or exercise targets anywhere in the conversation, including the nut-weighing suggestion (4.2) and the "eat more" guidance (5.4c). Escalate instead. Direct to the National Alliance for Eating Disorders helpline if resources are requested; NEDA's line is permanently disconnected.
- **Serotonergic medication + tryptophan/5-HTP question** → escalate to prescriber (4.8).
- **Recurring cognitive fog** → route through 6.1, which should trigger the existing medical escalation path.

---

# SECTION 7 — KETOGENIC ENERGY EXPENDITURE

`topic: keto metabolic advantage, energy expenditure ketosis, does keto boost metabolism, carbohydrate insulin model`

## 7.1 The best-controlled evidence

**[SUPPORTED — real but small; [CONTESTED] in interpretation]**

Hall KD, Chen KY, Guo J, et al. *Am J Clin Nutr* 2016;104(2):324–333. PMID 27385608.

Design: 17 overweight/obese men, metabolic ward. High-carbohydrate baseline diet (15:50:35 protein:carb:fat) for 4 weeks → isocaloric ketogenic diet (15:5:80) for 4 weeks, **protein clamped**. Metabolic chamber 2 consecutive days weekly. DLW during final 2 weeks of each period.

Results:
- EE_chamber **+57 ± 13 kcal/d** (P = 0.0004)
- Sleeping EE **+89 ± 14 kcal/d** (P < 0.0001)
- RQ **−0.111 ± 0.003** (P < 0.0001)
- Overall negative energy balance ~300 kcal/d; subjects lost weight and fat throughout
- **Body fat loss slowed during the KD phase**
- The EE increase was **transient, lasting about 2 weeks**

Protein was clamped, so this is not a TEF artifact. The RQ shift is also a clean demonstration of Randle-cycle dial movement (Section 1).

## 7.2 The dispute

**[CONTESTED]**

DLW-measured EE rose more substantially than chamber EE (151 vs. 57 kcal/d). Hall attributed this to increased physical activity outside the chambers.

- Friedman & Appel secondary analysis, *PLOS One* 2019;14(12):e0222971 — argued the ward-vs-chamber distinction was the key variable and that accelerometry did not account for the effect
- Hall KD. *PLOS One* 2019;14(12):e0225944 — "Mystery or method? Evaluating claims of increased energy expenditure during a ketogenic diet"
- Ebbeling CB, et al. *BMJ* 2018;363:k4583 — larger effects during weight-loss maintenance; has its own methodological disputes
- Ludwig DS, et al. *Int J Obes* 2019 — response to Hall regarding the carbohydrate-insulin model

Both groups declare relevant funding/employment interests. The disagreement is genuine and unresolved.

**>>> COACH POSITION:** 50–100 kcal/day is defensible. Do not characterize it as a metabolic transformation. **Appetite suppression, not energy expenditure, is the primary mechanism by which carbohydrate restriction produces weight loss.** Overstating the expenditure effect creates a specific failure mode: a user who doesn't lose weight concludes their metabolism is broken, having been told keto would fix it.

---

# SECTION 8 — CORTISOL, VISCERAL FAT, AND MEAL TIMING

`topic: cortisol, belly fat, visceral fat, menopause weight gain, cortisol reset, meal timing, eating window, fasting window, circadian eating, stress and weight`

## 8.1 Local glucocorticoid regeneration — the real cortisol/belly fat link

**[ESTABLISHED mechanism; [CONTESTED] clinical significance]**

**The paradox:** phenotypic similarity between Cushing's syndrome and common visceral obesity is striking, but **plasma cortisol in visceral obesity is typically normal.** The leading resolution is increased *local tissue* glucocorticoid activity rather than systemic excess.

**The enzyme:** 11β-hydroxysteroid dehydrogenase type 1 (**11β-HSD1**) catalyses intracellular regeneration of active cortisol from inert cortisone, in adipose tissue and liver, coupled to hexose-6-phosphate dehydrogenase (H6PDH).

**Supporting evidence:**
- Mice overexpressing 11β-HSD1 specifically in adipose tissue develop visceral obesity, insulin resistance, dyslipidemia, and hypertension — **with circulating corticosterone not elevated.** Masuzaki H, et al. *Science* 2001;294:2166–2170; *J Clin Invest* 2003;112:83–90
- Liver-specific overexpression produces insulin resistance and hypertension but not obesity. Paterson JM, et al. *PNAS* 2004;101:7088–7093
- 11β-HSD1 mRNA and activity are increased in human adipose tissue in obesity
- In mice, disrupting adipose 11β-HSD1 reduced rates of appearance of circulating regenerated cortisol by ~67% and reduced regeneration in liver and brain by ~30% each — adipose contribution to the circulating pool exceeds hepatic. *(PMC10448579)*

**[CONTESTED] — the limits, which must accompany any use:**
- **Human tissue-specificity is messy.** Obesity is associated with *increased* 11β-HSD1 activity in subcutaneous adipose tissue and *decreased* conversion in the liver. Review: "Tissue-specific dysregulation of cortisol regeneration by 11βHSD1 in obesity: has it promised too much?" *Diabetologia* 2014. PMID 24710966
- **The portal-vein story is not supported in humans.** Significant cortisol release was observed from subcutaneous adipose tissue, but visceral adipose 11β-HSD1 activity was insufficient to raise portal vein cortisol concentration; splanchnic release was accounted for entirely by the liver. PMID 18852329
- **Therapeutic translation has disappointed.** 11β-HSD1 inhibitor trials in metabolic syndrome, obesity, and Alzheimer's have largely failed primary endpoints; one phase II trial reduced HbA1c in diabetes.

**>>> COACH USE — HIGH VALUE:** When a user reports the classic abdominal pattern but says their cortisol test came back normal, this is the explanation for the apparent contradiction. **State it carefully:** a normal serum cortisol does not rule cortisol out, *and* does not establish that cortisol is the driver. Blood levels measure the wrong compartment. Do not use this to justify a cortisol-targeted protocol — no validated intervention follows from it.

## 8.2 Estradiol, not cortisol, drives menopausal fat redistribution

**[ESTABLISHED]** Declining estradiol shifts adipose storage toward visceral depots, altering distribution independent of total mass. Compounded by age-related sarcopenia and rising insulin resistance.

**[SUPPORTED]** Estradiol modulates HPA axis reactivity, so cortisol responsiveness does change across the menopausal transition. Contributory, not primary.

**[SUPPORTED]** Vasomotor symptoms fragment sleep; sleep disruption alters the diurnal cortisol curve. This is the most modifiable input in the chain.

**>>> COACH RULE:** Do not frame menopausal weight gain as "a cortisol problem." Estradiol-driven redistribution plus sarcopenia plus insulin resistance is the accurate account. Cortisol is one contributor. The "cortisol problem" framing is heavily used in predatory marketing to this demographic (see 8.6).

## 8.3 Fasting and restriction RAISE cortisol

**[ESTABLISHED]** The HPA axis is activated by fasting. Cortisol stimulates hepatic gluconeogenesis — a necessary counter-regulatory response. Absence of this response (reduced adrenal function, or blocked glucocorticoid signaling in rodents) impairs metabolic responses and leads to hypoglycemia.

**Human data:**
- Meta-analysis: acutely elevated plasma cortisol following fasting, **but not with less severe calorie restriction** — severity-dependent
- 10-day zero-calorie fast: cortisol rose during the first five days (Steinhauser et al. 2018)
- 72-hour fast in healthy men: 24-hour mean cortisol significantly higher than after a weight-maintenance diet (Chan et al. 2003)
- 5-day fasting increases cortisol and **shifts the peak from morning to afternoon**
- Fasting experiments of 2.5–6 days dramatically elevate plasma cortisol
- Early TRF (8:00 AM–2:00 PM) for 4 days slightly but significantly **increases** morning serum cortisol

Source review for the last three: PMC8419605, which concludes that intermittent fasting increases the level and frequency of cortisol secretion.

**[CONTESTED] — longer-term TRE is less clear.** One review distinguishes non-restrictive TRE (appears to lower cortisol) from isocaloric TRE (raises it), suggesting total intake matters more than the window. A 12-week TRE pilot in Cushing's disease found a trend toward lower cortisol, with authors proposing improved alignment between feeding time and the cortisol rhythm — heavily confounded by ~11 kg weight loss. *(PMC13119454)*

**>>> COACH RULE — CRITICAL:** If a user asks about fasting to lower cortisol, the answer is that fasting raises it. The correct response to elevated cortisol from over-restriction is **less restriction, not a longer fast.** Users arriving from cortisol-reset marketing will have the opposite expectation; correct it directly but without disparaging them for believing it.

## 8.4 Sex difference in fasting cortisol response

**[SUPPORTED — single study, needs replication]** In one-day fasting among obese adults, female participants showed altered cortisol rhythm — higher amplitude on the fasting day and earlier acrophase — while **none of the rhythm parameters differed in male subjects.** *(Front Nutr* 2023;10:1078508)

Directionally consistent with 5.3 (women more vulnerable to HPT/HPG suppression under carbohydrate restriction) and 5.4c (low energy availability).

**>>> COACH USE:** Supports a gentler default fasting protocol for women, and supports the course's "Rule of 3s" for stressed bodies. Also useful framing: most fasting protocols were generalized from male data. Do not overstate — one study.

## 8.5 Habitual eating windows are far longer than people believe

**[ESTABLISHED]** Gill S, Panda S: in 156 healthy adults in California tracked by smartphone app, **approximately 50% ate within a window greater than ~14.75 hours; only 10% ate within a window of 12 hours or less.**

Corroborating: in a pilot trial screening 60 interested participants, only 5 (8%) already ate within a 10-hour window.

**>>> COACH USE — HIGHEST PRACTICAL VALUE IN THIS SECTION:** Most users are not choosing between 8 and 10 hours. They are eating across 15 hours without realizing it, because coffee with cream, a bite while cooking, and evening snacks don't register as meals.

**Recommended first action:** three days of logging every caloric intake including standing-at-the-counter bites, before any window prescription. Then narrow to 12 hours. This is a meaningful change for the large majority and requires no precision.

**Note:** this reframes TRE from optimization to awareness, which also reduces the risk of triggering the over-restriction problem in 8.3.

## 8.6 No basis for a "personalized cortisol window"

**[REFUTED]**

Cortisol's diurnal rhythm is generated by SCN projections to the hypothalamic paraventricular nucleus driving CRH release, plus autonomic neural signals and local adrenal clocks. **In humans the SCN is entrained primarily by light, not food.**

In rodents, timed feeding can shift the corticosterone peak to feeding onset. Human evidence for food-driven shifting of the central rhythm is much weaker.

There is no published research supporting:
- A fasting window calculable from a questionnaire (age, sleep, stress, weight history)
- 90-minute precision determining fat storage vs. loss
- Fasting protocols "calibrated to a menopausal hormonal profile"
- Any such approach outperforming standard approaches by "2–3×"

**>>> ESCALATE — CONSUMER PROTECTION CONTEXT:** This claim set is actively marketed to women over 45, frequently via advertorials with fabricated or misattributed citations. A documented example (bbfasting.com, April 2026) cited a review — PMC8419605 — twice under two different titles as support for a "cortisol reset," when the cited paper concludes that intermittent fasting *increases* cortisol secretion. Its three headline statistics attributed journal names that appeared nowhere in its reference list, and one listed "peer-reviewed source" was a supplement company blog post.

**Coach posture if a user raises this kind of product:** be factual and non-condescending. Confirm that the underlying frustration is legitimate and that menopausal redistribution is real. Explain what the research supports (8.2, 8.3, 8.5, 8.7). Do not mock the user for having believed it — these are professionally produced and designed to be convincing.

## 8.7 What does modify cortisol — the defensible list

**[ESTABLISHED to [SUPPORTED]]**, in approximate order of effect:

1. **Sleep duration and continuity.** Largest modifiable lever. Harder during menopause due to vasomotor sleep fragmentation (8.2).
2. **Light timing** — morning bright light, dim evening. Acts on the actual entraining pathway.
3. **Avoiding late-night eating** — circadian alignment rather than a cortisol window per se.
4. **Avoiding severe restriction** — see 8.3. The lever most users expect to work in the opposite direction.

**Not on the list:** any specific clock-time eating window.

## 8.8 Related: visceral vs. subcutaneous adipose tissue

**[ESTABLISHED]** Visceral adipose tissue is metabolically and endocrinologically distinct from subcutaneous — more lipolytically active, drains to portal circulation, secretes more inflammatory cytokines (IL-6, TNF-α). Tracks with insulin resistance more closely than total adiposity. Waist circumference carries information weight does not.

**>>> COACH USE:** Useful for a user discouraged by a static scale — visceral reduction can occur without weight change, and the reverse is also possible. **Subject to the personal health situation flag:** if active, discuss without numeric targets or measurements.

---

# SECTION 9 — GLP-1 MEDICATIONS, GLUCAGON, PROTEIN, AND REMAINING GAPS

`topic: GLP-1, semaglutide, Ozempic, Wegovy, tirzepatide, Mounjaro, Zepbound, glucagon, insulin glucagon ratio, protein requirements, leucine, muscle, alcohol, autophagy, artificial sweeteners, HRT, uric acid`

## 9.1 GLP-1 receptor agonists — body composition

**[ESTABLISHED]** STEP 1 DXA substudy (*J Endocr Soc* 2021, exploratory analysis; n=140, semaglutide 95 / placebo 45, 68 weeks):
- Body weight −15.0% semaglutide vs −3.6% placebo
- Total fat mass −19.3%; regional visceral fat mass **−27.4%**
- Total lean body mass −9.7%
- **Proportion of lean body mass relative to total body mass increased**
- Absolute: −10.4 kg fat mass, −6.9 kg lean mass → **60% fat / 40% lean** (as reported in the SURMOUNT-1 body composition paper, *Diabetes Obes Metab* 2025)

**>>> CRITICAL CORRECTION — the course's comparison claim is not supported.** The SURMOUNT-1 analysis states that dietary interventions — very-low-calorie, low-carbohydrate, low-fat and high-fibre — have produced proportions of weight reduction *similar* to those seen with incretin therapy. The course's figures (25–30% lean loss on caloric restriction, 10–15% on ketogenic diets, vs. 40% on drugs) present a contrast the literature does not support.

For context in the opposite direction: gastric bypass in patients losing ≥15% body weight produced **76% fat mass** as a proportion of loss — a *better* ratio than the medications.

**Methodological note:** DXA "lean mass" includes water and glycogen. Early reductions partly reflect glycogen depletion and associated water, not contractile tissue.

**Also:** SUSTAIN 8 substudy found body composition changes with semaglutide were not significantly different from canagliflozin in T2D, with lean mass *proportion* increasing in both arms.

## 9.2 GLP-1 receptor agonists — outcome data

**[ESTABLISHED]** SELECT trial: 17,604 adults with pre-existing cardiovascular disease and overweight/obesity, without diabetes.
- **20% reduction in major adverse cardiovascular events**
- Weight loss continued over 65 weeks and was sustained up to 4 years; −10.2% weight at 208 weeks vs −1.5% placebo; waist circumference −7.7 cm
- **Semaglutide was associated with fewer serious adverse events**
- Pre-specified kidney analysis: composite kidney endpoint 1.8% semaglutide vs 2.2% placebo, HR 0.78 (95% CI 0.63–0.96, P = 0.02)

**>>> COACH RULE:** This data must be available to the coach. Omitting it while presenting the adverse-event data produces a one-sided picture that a user will discover elsewhere.

## 9.3 GLP-1 receptor agonists — GI adverse events, with absolute risk

**[SUPPORTED]** Sodhi et al., *JAMA* 2023 — retrospective claims cohort, GLP-1 RA for weight loss vs. bupropion-naltrexone comparator. Hazard ratios approximately: pancreatitis 9.09, bowel obstruction 4.22, gastroparesis 3.67.

**>>> COACH RULE — ALWAYS PAIR RELATIVE WITH ABSOLUTE.** These are large relative increases on low-incidence events. Presenting the hazard ratio alone materially overstates individual risk. Limitations: retrospective, claims-based, single comparator drug, potential residual confounding.

**>>> VERIFY:** obtain the absolute incidence rates per 1,000 person-years from the primary paper before any course copy quotes these figures.

## 9.4 Discontinuation and regain

**[ESTABLISHED]** STEP 1 extension (n=327): mean weight loss 17.3% at week 68 with semaglutide. Following withdrawal, semaglutide participants regained **11.6 percentage points** by week 120, leaving a net 5.6% loss. **Cardiometabolic improvements reverted toward baseline for most variables.**

**>>> COACH USE — THE STRONGEST HONEST ARGUMENT:** these agents work while taken; the discontinuation plan is where the durable outcome is determined. This is where the course's content is genuinely additive rather than competitive.

## 9.5 Coaching users currently on a GLP-1

**>>> ESCALATE / BOUNDARY RULE — READ BEFORE ANY GLP-1 CONVERSATION**

- **The coach never advises stopping, tapering, or altering dose.** That is a prescriber decision. State this explicitly if asked.
- **Do not tell a user on these drugs that they have damaged their metabolism.** It overstates the evidence (9.1, 9.2) and may prompt discontinuation of a medication reducing cardiovascular risk.
- If a user reports intending to stop, respond supportively and direct them to their prescriber. Do not endorse or discourage.

**What the coach CAN do — high value:**
- **Protein prioritization.** Appetite suppression makes profound under-consumption common. Protein adequacy is the primary modifiable lever on lean mass.
- **Resistance training.** Strongest evidence base for attenuating lean mass loss during weight reduction, by any method.
- **Total intake monitoring.** Under-eating drives tissue loss; this is the mechanism, not the drug per se.
- **Pre-taper preparation.** Given 9.4, building insulin-lowering meal structure, appetite regulation, and movement habits *before* discontinuation is the intervention that matters most.

**Subject to the personal health situation flag** — if active, discuss protein and resistance training qualitatively without numeric targets.

## 9.6 Glucagon and the insulin:glucagon ratio

**[ESTABLISHED]** Glucagon (pancreatic alpha cells) opposes insulin: stimulates hepatic glycogenolysis and gluconeogenesis, promotes lipolysis and ketogenesis. Net substrate direction is governed by the **insulin-to-glucagon ratio**, not insulin alone.

Macronutrient responses:
- **Carbohydrate** — raises insulin, suppresses glucagon → ratio rises sharply → storage
- **Fat** — minimal effect on either
- **Protein** — raises insulin **and** glucagon → ratio relatively preserved

**>>> COACH USE — HIGHEST-VALUE MISSING CONCEPT:** This is the correct rebuttal to "protein spikes insulin, so protein is no better than carbohydrate." It is the most common objection to the course's protein recommendation and currently the course has no answer to it.

Also connects to Section 1: glucagon is the primary on-signal for hepatic ketogenesis, acting via AMPK → ACC inhibition → reduced malonyl-CoA → CPT-1 disinhibition (see 1.4, 1.6). **The insulin:glucagon ratio and the CPT-1 gate are the same story told at two levels.**

**Note:** this framing is prominent in Bikman's work and is sound physiology. Avoid presenting a specific numeric ratio target — those circulate online without validated reference ranges.

## 9.7 Hyperinsulinemia precedes insulin resistance

**[CONTESTED — but the course's position is defensible and should be stated as a position]**

The carbohydrate-insulin model holds that chronic hyperinsulinemia is upstream of insulin resistance rather than compensatory to it. Supporting: hyperinsulinemia is detectable years before resistance is measurable; experimental insulin infusion induces resistance; reducing insulin exposure improves sensitivity.

The competing energy-balance view holds that adiposity and ectopic lipid drive resistance, with hyperinsulinemia compensatory. Ludwig vs. Hall is the live disagreement (see 7.2).

**>>> COACH RULE:** State the causal direction as the framework this course is built on, and name that it is contested. Do not present it as settled. It is the linchpin claim — which is exactly why it should be handled honestly.

## 9.8 Protein requirements and anabolic resistance

**[ESTABLISHED]** Muscle protein synthesis responds to per-meal protein dose in a threshold manner, driven substantially by leucine content — not to daily total alone. Distributing inadequate protein across meals can fail to reach the threshold at any meal.

**[ESTABLISHED] Anabolic resistance:** older adults require a higher per-meal protein dose than younger adults to achieve equivalent muscle protein synthesis. Commonly cited practical targets are roughly 25–30 g of high-quality protein per meal for younger adults and ~35–40 g for older adults, with daily intakes commonly recommended in the 1.2–1.6 g/kg range for older adults versus the 0.8 g/kg RDA.

**>>> VERIFY BEFORE PUBLISHING:** these numeric targets were stated from general knowledge, not from verified primary sources in this session. Anchor them (Volpi, Paddon-Jones, Phillips, and the PROT-AGE consensus are the relevant literature) before they become course copy or coach output.

**>>> SAFETY:** suppress all numeric protein targets when the personal health situation flag or any disordered eating signal is present (see 6.4).

## 9.9 Skeletal muscle as the primary glucose disposal site

**[ESTABLISHED]** Skeletal muscle accounts for the large majority of insulin-stimulated glucose disposal. Muscle mass therefore functions as glucose disposal capacity. Age-related sarcopenia reduces that capacity, requiring greater insulin for equivalent glucose handling.

Connects to 1.6 — contraction-mediated (insulin-independent) glucose uptake via AMPK and GLUT4 translocation.

**>>> COACH USE:** Reframes resistance training from energy expenditure to organ building. Particularly effective for users over 45 who have been directed toward cardio for decades. Combines with 8.2 (sarcopenia compounding menopausal redistribution) and 9.5 (lean mass protection on GLP-1s).

## 9.10 Alcohol

**[ESTABLISHED]** Ethanol is oxidized with metabolic priority. During ethanol metabolism, hepatic fatty acid oxidation is markedly suppressed — the acetate/acetaldehyde load and shifted NADH/NAD⁺ redox state inhibit β-oxidation and favor lipogenesis. Whole-body fat oxidation falls substantially for hours.

Secondary effects: fragmented sleep architecture with reduced REM (feeding into 2.8 and Section 8), reduced dietary restraint typically in the evening when cue-driven drive is already elevated (2.4), and competition for hepatic capacity with everything in Section 5.4a.

**>>> COACH USE:** For a stalled user with regular alcohol intake, this is a high-yield first variable. Recommend a two-week trial rather than one — a single week is confounded by water shifts.

## 9.11 Autophagy

**[ESTABLISHED mechanism; [HYPOTHESIS] for the popular human claims]**

Macroautophagy is nutrient-responsive lysosomal degradation and recycling of cellular components, negatively regulated by mTORC1 and positively by AMPK. Ohsumi's Nobel Prize (2016) was for elucidating the genetics.

**What is not established:**
- The specific fasting durations circulated online (16 h, 18 h, 24 h) were **not** measured in humans. There is no validated routine clinical assay for human autophagic flux; figures derive from model organisms or indirect surrogate markers.
- Lifespan and disease-reversal findings come predominantly from yeast, *C. elegans*, *Drosophila*, and rodents — organisms with lifespans of weeks to months.

**>>> COACH RULE:** Autophagy is a legitimate secondary argument for not eating continuously. It is **not** a justification for escalating fast duration, and the coach must not quote hour thresholds. Weigh against 8.3 (fasting raises cortisol) and 5.4c (energy availability), particularly for female users.

## 9.12 Non-nutritive sweeteners

**[SUPPORTED]** Most non-nutritive sweeteners produce little to no direct insulin secretory response in isolation. The simple "sweeteners spike insulin" claim is not well supported.

**[CONTESTED] Open questions:**
- Cephalic-phase insulin response exists but is small and inconsistent across studies and sweetener types
- Microbiome effects reported (notably for saccharin and sucralose); human significance debated
- Post-ingestive reward signaling requires calories (see 2.5) — sweet taste without caloric follow-through is not neutral to the reward system and may sustain sweet preference

**>>> COACH POSITION:** Better than sugar, not equivalent to water. Suggest a two-week elimination as a personal test of craving dependence rather than issuing a general rule.

## 9.13 Menopausal hormone therapy

**[OUT OF SCOPE FOR COACHING — ESCALATE]**

MHT directly addresses the estradiol decline underlying 8.2. The risk-benefit picture has been substantially revised since initial WHI reporting, with timing relative to menopause onset, formulation, route, and individual history materially altering the calculation.

**>>> COACH RULE:** The coach may confirm that MHT is a legitimate medical option and that current understanding differs from the early-2000s headlines. The coach **must not** advise for or against it, estimate individual risk, or comment on specific formulations or doses. Route to a qualified practitioner. Silence is also a position — acknowledging it as a real option while declining to advise is the correct posture.

## 9.14 Uric acid

**[SUPPORTED association; [CONTESTED] causal role]**

Hepatic fructose metabolism consumes ATP rapidly (fructokinase/ketohexokinase phosphorylation without the feedback inhibition that regulates glucokinase), generating AMP that is degraded to uric acid. Elevated uric acid is associated with hypertension, insulin resistance, and metabolic syndrome; Johnson and Lanaspa's work argues for a causal contribution.

Extends the existing course material on fructose and NAFLD (Lesson 11). Uric acid appears on most standard panels, so users may already have the value.

**>>> COACH RULE:** Present as an active research area. The association is robust; the causal role is not settled. Do not advise urate-lowering therapy.

---

# VERIFICATION BACKLOG

Items stated from memory during the source conversation or pulled from reference lists rather than primary sources. Confirm before any of this becomes published course copy:

- **1.6** — Ruderman/Saha AMPK-malonyl-CoA citations: page numbers from a reference list, not the papers
- **1.1** — *Am J Physiol* 2009 Randle review: title, journal, year, DOI confirmed; **author line not confirmed**
- **4.2** — RQ normal range (~0.75–0.95): standard physiology but should be anchored to a specific source
- **6.1** — ferritin ~50 ng/mL threshold: widely used clinically, evidence base weaker than its ubiquity implies
- **5.3** — the 1980 *Metabolism* all-fat/rT3 paper: obtain full text; it materially complicates 5.5
- **2.x** — Berridge & Robinson, Spiegel, Cummings, Simpson & Raubenheimer, Zioudrou: cited by author and finding, specific papers not pinned
- **3.5** — the 10-hour TEF study and the 3-vs-6 meal calorimetry study: findings confirmed via secondary sources; pin primary citations
- **Carbohydrate thresholds** (course Lesson 8's <40 g figure): the CPT-1 mechanism explains why a threshold exists but does **not** validate any specific number. Keep these claims separate.
- **8.5** — Gill & Panda eating-window figures: confirmed via two independent secondary sources quoting the same numbers; pin the primary citation (*Cell Metab* 2015, "A smartphone app reveals erratic diurnal eating patterns in humans...") before publishing the statistic
- **8.3** — Steinhauser 2018 and Chan 2003: cited within a review, not read directly
- **8.4** — the sex-difference finding is a single study in obese adults; do not build protocol defaults on it until replicated
- **8.1** — Masuzaki 2001/2003 and Paterson 2004: citations taken from reference lists; confirm before publishing
- **8.2** — the estradiol/visceral-redistribution claim is well established in the literature but was stated here from general knowledge rather than a specific verified source. Anchor it before it becomes course copy.
- **9.3** — **highest priority.** Obtain absolute incidence rates from Sodhi et al. *JAMA* 2023 before any course copy quotes the hazard ratios. Currently the course quotes relative risk only.
- **9.8** — **highest priority.** All protein numbers (25–30 g, 35–40 g, 1.2–1.6 g/kg) stated from general knowledge. Anchor against PROT-AGE consensus and the Phillips/Paddon-Jones/Volpi literature before publishing or loading into the coach.
- **9.1** — STEP 1 DXA substudy is an *exploratory* analysis of 140 participants from 9 sites, not a primary endpoint. Characterize it accordingly; do not present it as the trial's main finding.
- **9.10** — the magnitude and duration of alcohol's suppression of fat oxidation was stated from general knowledge. The mechanism is solid; pin a specific study before quoting numbers.
- **9.14** — Johnson and Lanaspa cited by name and argument; specific papers not pinned.
- **9.6** — the macronutrient effects on the insulin:glucagon ratio are standard physiology but were not verified against primary sources in this session.

---

*Mind Body Functional Health — MetaBurn AI Coach backend. Not for direct user display.*

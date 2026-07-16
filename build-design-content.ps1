$fp = "c:\Users\jaime\metabolism ebook\index.html"
$c = [System.IO.File]::ReadAllText($fp)
$c = $c.Replace("`r`n", "`n")

# ---- HELPERS ----

# Insert $html BEFORE the <h4> whose text contains $h4Text, searching from $fromIdx
function InsertBeforeH4($h4Text, $html, $fromIdx) {
    $ti = $script:c.IndexOf($h4Text, $fromIdx)
    if ($ti -lt 0) { Write-Host ("  H4 NOT FOUND: " + $h4Text); return }
    $h4s = $script:c.LastIndexOf('<h4', $ti)
    $script:c = $script:c.Insert($h4s, $html)
}

# Insert $html BEFORE the lesson-complete <button> whose inner text matches $btnText
function InsertBeforeBtn($html, $btnText) {
    $ti = $script:c.IndexOf($btnText)
    if ($ti -lt 0) { Write-Host ("  BUTTON NOT FOUND: " + $btnText); return }
    $bs = $script:c.LastIndexOf('<button', $ti)
    $script:c = $script:c.Insert($bs, $html)
}

function PullQuote($text) {
    return ('            <div class="pull-quote">' + "`n" +
            '                <p>' + $text + '</p>' + "`n" +
            '            </div>' + "`n")
}

function KeyInsight($fact) {
    return ('            <div class="key-insight">' + "`n" +
            '                <p class="key-insight-label">Key Insight</p>' + "`n" +
            '                <p class="key-insight-fact">' + $fact + '</p>' + "`n" +
            '            </div>' + "`n")
}

function Summary($t1, $t2, $t3) {
    return ('            <div class="lesson-summary">' + "`n" +
            '                <div class="lesson-summary-header">&#x2736; What You Just Learned</div>' + "`n" +
            '                <div class="lesson-summary-body">' + "`n" +
            '                    <div class="lesson-summary-item"><span class="lesson-summary-diamond">&#x2736;</span><span>' + $t1 + '</span></div>' + "`n" +
            '                    <div class="lesson-summary-item"><span class="lesson-summary-diamond">&#x2736;</span><span>' + $t2 + '</span></div>' + "`n" +
            '                    <div class="lesson-summary-item"><span class="lesson-summary-diamond">&#x2736;</span><span>' + $t3 + '</span></div>' + "`n" +
            '                </div>' + "`n" +
            '            </div>' + "`n")
}

# ============================================================
# LESSON 1 — The Flawed Calorie Model
# ============================================================
Write-Host "Lesson 1"
$L1 = $script:c.IndexOf('id="intro"')
InsertBeforeH4 'The Combustible Myth' `
    (PullQuote 'To truly understand metabolism, you have to completely abandon the idea of calories as a math equation and begin to understand food as signals that create a biological response.') `
    $L1
InsertBeforeBtn `
    (KeyInsight 'A calorie is simply the amount of heat needed to raise one kilogram of water by one degree Celsius — a measure designed for a furnace, not a living cell.') `
    '&#x2713; Lesson 1 Complete &#x2014; Continue to Lesson 2 &#x2192;'
InsertBeforeBtn `
    (Summary `
     'Calories are a flawed measure because the human body is not a closed combustion system — hormones, not math, determine fat storage.' `
     'Different macronutrients trigger different hormonal responses and travel through entirely separate metabolic pathways.' `
     'Food must be understood as biological signals that create a hormonal response, not simply as units of energy.') `
    '&#x2713; Lesson 1 Complete &#x2014; Continue to Lesson 2 &#x2192;'

# ============================================================
# LESSON 2 — Understanding Insulin
# ============================================================
Write-Host "Lesson 2"
$L2 = $script:c.IndexOf('id="ch2"')
InsertBeforeH4 'The Cephalic Phase' `
    (PullQuote 'When insulin is elevated, your body is physically incapable of burning fat. Fat burning is not a matter of willpower — it is a matter of hormonal chemistry.') `
    $L2
InsertBeforeH4 'Insulin Resistance and the Chronic Disease' `
    (KeyInsight 'Insulin resistance is the common, foundational root cause for almost all modern chronic diseases — including type 2 diabetes, heart disease, PCOS, Alzheimer''s, and certain cancers.') `
    $L2
InsertBeforeBtn `
    (Summary `
     'Insulin acts as the master gatekeeper, determining whether incoming energy is burned for fuel or locked away in fat cells.' `
     'Even artificial sweeteners and the sight or smell of sweet foods can trigger an insulin response through the cephalic phase.' `
     'Chronically elevated insulin drives systemic inflammation, blocks leptin signaling, and increases risk of nearly every modern disease.') `
    '&#x2713; Lesson 2 Complete &#x2014; Continue to Lesson 3 &#x2192;'

# ============================================================
# LESSON 3 — Metabolism as a Signaling System
# ============================================================
Write-Host "Lesson 3"
$L3 = $script:c.IndexOf('id="ch3"')
InsertBeforeH4 'Measuring the Signals' `
    (PullQuote 'You cannot force a protective body to let go of energy by simply starving it — you must first change the signals it is receiving.') `
    $L3
InsertBeforeBtn `
    (KeyInsight 'An optimal fasting insulin level should ideally be below 3 to 5 uIU/mL — yet most labs consider anything under 25 uIU/mL "normal," masking years of silent metabolic damage.') `
    '&#x2713; Lesson 3 Complete &#x2014; Continue to Lesson 4 &#x2192;'
InsertBeforeBtn `
    (Summary `
     'Metabolism is a complex signaling network — every food choice, sleep pattern, and stress response sends instructions to your cells.' `
     'Fasting insulin and the triglyceride-to-HDL ratio are far more accurate metabolic health markers than A1C or LDL cholesterol.' `
     'The body prioritizes survival above all else — perceived safety is a biological prerequisite for fat loss.') `
    '&#x2713; Lesson 3 Complete &#x2014; Continue to Lesson 4 &#x2192;'

# ============================================================
# LESSON 4 — Mitochondria
# ============================================================
Write-Host "Lesson 4"
$L4 = $script:c.IndexOf('id="ch4"')
InsertBeforeH4 'The Protective Shift' `
    (PullQuote 'Your metabolism is only as strong as your ability to produce energy at the cellular level. Everything else — hormones, weight, mood, cognition — flows from there.') `
    $L4
InsertBeforeBtn `
    (KeyInsight 'When mitochondrial function is strong, your body becomes metabolically flexible — able to seamlessly switch between burning carbohydrates and stored fat without fatigue or cravings.') `
    '&#x2713; Lesson 4 Complete &#x2014; Continue to Lesson 5 &#x2192;'
InsertBeforeBtn `
    (Summary `
     'Mitochondria are the energy-producing powerhouses that determine your metabolic rate, fat-burning capacity, and cellular vitality.' `
     'When mitochondrial function is impaired, the body shifts into conservation mode — making fat loss physically impossible regardless of diet.' `
     'B vitamins, magnesium, CoQ10, and omega-3 fatty acids are critical raw materials for sustaining ATP production.') `
    '&#x2713; Lesson 4 Complete &#x2014; Continue to Lesson 5 &#x2192;'

# ============================================================
# LESSON 5 — Thyroid and Nervous System
# ============================================================
Write-Host "Lesson 5"
$L5 = $script:c.IndexOf('id="ch5"')
InsertBeforeH4 'The Nervous System: The Safety Switch' `
    (PullQuote 'When the body shifts into a parasympathetic state, digestion improves, nutrient absorption increases, hormones find their natural balance, and the body becomes willing to burn energy rather than hoarding it.') `
    $L5
InsertBeforeH4 'Brown Fat, Cold Exposure' `
    (KeyInsight 'Cold exposure activates brown fat, which contains UCP1 — a protein that forces cells to generate pure heat instead of ATP, permanently raising resting metabolic rate without traditional exercise.') `
    $L5
InsertBeforeBtn `
    (Summary `
     'The thyroid is your metabolic accelerator and is profoundly influenced by nutrient availability, liver conversion of T4 to T3, and chronic stress.' `
     'The nervous system acts as the body''s safety switch — chronic sympathetic activation signals threat, forcing the body to conserve energy rather than burn it.' `
     'Even 15 to 30 seconds of cold exposure daily activates brown fat thermogenesis and progressively elevates resting metabolic rate.') `
    '&#x2713; Lesson 5 Complete &#x2014; Continue to Lesson 6 &#x2192;'

# ============================================================
# LESSON 6 — GLP-1 and Appetite
# ============================================================
Write-Host "Lesson 6"
$L6 = $script:c.IndexOf('id="ch6"')
InsertBeforeH4 'The Drug Dilemma' `
    (PullQuote 'When your natural GLP-1 is functioning correctly, it acts as a perfectly calibrated built-in brake pedal for your appetite — no prescription required.') `
    $L6
InsertBeforeH4 'Foods That Naturally Boost GLP-1' `
    (KeyInsight 'GLP-1 agonist medications carry up to 9.09 times higher risk of pancreatitis and cause up to 40% of total weight loss to come from lean muscle mass rather than fat.') `
    $L6
InsertBeforeBtn `
    (Summary `
     'GLP-1 is released naturally in response to eating and regulates insulin secretion, stomach emptying speed, and satiety signals to the brain.' `
     'Synthetic GLP-1 drugs carry severe risks — pancreatitis, gastroparesis, bowel obstruction — and cause catastrophic muscle mass loss.' `
     'Protein, healthy fats, fermented foods, and dietary fiber all naturally stimulate your own GLP-1 production without any pharmaceutical risk.') `
    '&#x2713; Lesson 6 Complete &#x2014; Continue to Lesson 7 &#x2192;'

# ============================================================
# LESSON 7 — Leptin and Ghrelin
# ============================================================
Write-Host "Lesson 7"
$L7 = $script:c.IndexOf('id="ch7"')
InsertBeforeH4 'Leptin: The Energy Gauge' `
    (PullQuote 'Because the brain cannot sense the leptin, it assumes the body is starving — and responds by dramatically increasing appetite and slowing the metabolic rate to conserve every calorie.') `
    $L7
InsertBeforeH4 'Ghrelin: The Hunger Hormone' `
    (KeyInsight 'Chronically elevated insulin physically blocks the leptin signal from reaching the brain — creating a state where the brain perceives starvation despite having abundant stored energy.') `
    $L7
InsertBeforeBtn `
    (Summary `
     'Leptin resistance — caused by chronically high insulin — makes the brain perceive starvation even when the body holds abundant stored fat, driving relentless hunger.' `
     'Ghrelin is a highly trainable hormone that responds directly to eating patterns, sleep quality, and meal timing consistency.' `
     'Restoring leptin sensitivity requires lowering insulin through proper nutrition — not calorie restriction, which worsens the problem.') `
    '&#x2713; Lesson 7 Complete &#x2014; Continue to Lesson 8 &#x2192;'

# ============================================================
# LESSON 8 — Ketones and Metabolic Flexibility
# ============================================================
Write-Host "Lesson 8"
$L8 = $script:c.IndexOf('id="ch8"')
InsertBeforeH4 'The Ultimate Clean Fuel' `
    (PullQuote 'When your body is fueled by its own stored fat via ketones, the blood sugar rollercoaster stops entirely — and energy levels remain flat and stable throughout the entire day.') `
    $L8
InsertBeforeH4 'The Menopause Connection' `
    (KeyInsight 'Ketones produce significantly fewer free radicals than glucose and act as powerful signaling molecules that protect muscle tissue, enhance cognitive function, and suppress appetite naturally.') `
    $L8
InsertBeforeBtn `
    (Summary `
     'Ketones are produced when insulin is low and serve as a clean, stable, superior fuel source for both the brain and the body.' `
     'The "keto flu" is a temporary energy transition that can be managed effectively with electrolytes and B vitamin supplementation.' `
     'For women in menopause, ketone production provides critical metabolic support that compensates for the decline in estrogen''s insulin-sensitizing effects.') `
    '&#x2713; Lesson 8 Complete &#x2014; Continue to Lesson 9 &#x2192;'

# ============================================================
# LESSON 9 — Balancing Your Plate
# ============================================================
Write-Host "Lesson 9"
$L9 = $script:c.IndexOf('id="ch9"')
InsertBeforeH4 'The Lever: Carbohydrates' `
    (PullQuote 'By applying the Fiber First rule — eating your fibrous vegetables and high-quality protein before your carbohydrates — you completely change the biological response to that exact same meal.') `
    $L9
InsertBeforeH4 'The Randle Cycle' `
    (KeyInsight 'Industrial seed oils force your fat cells into hypertrophy — sick, inflamed, oversized storage — rather than allowing them to multiply safely, directly driving systemic insulin resistance.') `
    $L9
InsertBeforeBtn `
    (Summary `
     'Protein is the non-negotiable foundation of every metabolically healthy meal — it preserves muscle, triggers GLP-1 satiety hormones, and generates the highest thermic effect.' `
     'Eating fiber and protein before carbohydrates physically blunts post-meal blood sugar and insulin spikes by slowing gastric emptying.' `
     'Combining high refined carbohydrates with high fat in the same meal creates a metabolic traffic jam that forces the body to lock fat into storage.') `
    '&#x2713; Lesson 9 Complete &#x2014; Continue to Lesson 10 &#x2192;'

# ============================================================
# LESSON 10 — Ceramides
# ============================================================
Write-Host "Lesson 10"
$L10 = $script:c.IndexOf('id="ch10"')
InsertBeforeH4 'What Are Ceramides?' `
    (PullQuote 'The saturated fats are innocent bystanders. The actual drivers that force your body to build harmful ceramides are toxins and systemic inflammation — not the fats themselves.') `
    $L10
InsertBeforeH4 'How to Get Rid of Them' `
    (KeyInsight 'Ceramides act like biological roadblocks inside your muscle and liver cells, physically interfering with insulin receptors and making your cells completely deaf to insulin''s signal.') `
    $L10
InsertBeforeBtn `
    (Summary `
     'Ceramides are harmful lipid molecules built from fats, but they are manufactured by inflammation — not by eating healthy ancestral fats.' `
     'Fixing a ceramide problem requires removing inflammatory drivers — processed foods, seed oils, chronic stress — not avoiding saturated fat.' `
     'Lowering insulin, eliminating seed oils, reducing toxin exposure, and managing stress all work together to extinguish ceramide overproduction.') `
    '&#x2713; Lesson 10 Complete &#x2014; Continue to Lesson 11 &#x2192;'

# ============================================================
# LESSON 11 — Digestive Health
# ============================================================
Write-Host "Lesson 11"
$L11 = $script:c.IndexOf('id="ch11"')
InsertBeforeH4 'The Gut Microbiome' `
    (PullQuote 'When you consume a diet high in processed foods, artificial sweeteners, and seed oils, you feed the pathogenic bacteria and starve the beneficial ones — triggering leaky gut and systemic inflammation.') `
    $L11
InsertBeforeH4 'A Practical Note' `
    (KeyInsight 'A fatty liver is an insulin-resistant liver. The primary driver is liquid fructose — found in high-fructose corn syrup and agave — which can only be processed by the liver and is directly converted to fat.') `
    $L11
InsertBeforeBtn `
    (Summary `
     'The liver performs over 500 vital functions and becomes insulin-resistant when overloaded by liquid fructose from sweetened beverages and processed foods.' `
     'Beneficial gut bacteria produce short-chain fatty acids that heal the gut lining, reduce inflammation, and directly regulate metabolic function.' `
     'Drinking too much liquid with meals dilutes stomach acid, enzymes, and bile — undermining digestion and feeding the very bacteria that cause gut dysbiosis.') `
    '&#x2713; Lesson 11 Complete &#x2014; Continue to Lesson 12 &#x2192;'

# ============================================================
# LESSON 12 — The Gut-Brain Axis
# ============================================================
Write-Host "Lesson 12"
$L12 = $script:c.IndexOf('id="ch12"')
InsertBeforeH4 'The Role of Stress in Digestion' `
    (PullQuote 'If you sit down to eat a healthy meal while in a state of high stress, your body is physically incapable of digesting it properly — no matter how nutritious it is.') `
    $L12
InsertBeforeH4 'Shifting the State' `
    (KeyInsight 'The Vagus Nerve is a massive informational highway running from your brainstem directly to your digestive organs — and it is the primary conduit through which stress shuts down your metabolism.') `
    $L12
InsertBeforeBtn `
    (Summary `
     'Chronic stress triggers a sympathetic state that physically shuts down digestion, blocks nutrient absorption, and signals the body to store fat for perceived survival.' `
     'Three slow deep breaths before meals and thorough chewing are not wellness clichés — they are scientifically validated tools for activating parasympathetic digestion.' `
     'When the gut-brain axis communicates clearly, the body accurately gauges its energy needs, reducing cravings and enabling effortless fat loss.') `
    '&#x2713; Lesson 12 Complete &#x2014; Continue to Lesson 13 &#x2192;'

# ============================================================
# LESSON 13 — Factors That Hinder Weight Loss
# ============================================================
Write-Host "Lesson 13"
$L13 = $script:c.IndexOf('id="ch13"')
InsertBeforeH4 'Chronic Stress and Cortisol' `
    (PullQuote 'You cannot out-diet a nervous system that believes it is fighting for its life. No nutrition plan can override a body locked in chronic survival mode.') `
    $L13
InsertBeforeH4 'Hidden Nutrient Deficiencies' `
    (KeyInsight 'Just one night of poor sleep can significantly increase insulin resistance the following day by disrupting leptin and ghrelin signaling — making willpower completely irrelevant.') `
    $L13
InsertBeforeBtn `
    (Summary `
     'Chronic sleep deprivation, unmanaged stress, and systemic inflammation are metabolic brakes that override even the most perfect nutrition protocol.' `
     'A history of restrictive dieting causes cellular energy failure — the body needs abundant, nourishing food to rebuild metabolic capacity, not further restriction.' `
     'Nutrient deficiencies in magnesium, iodine, vitamin D, and selenium can completely stall metabolism despite eating a clean, whole-food diet.') `
    '&#x2713; Lesson 13 Complete &#x2014; Continue to Lesson 14 &#x2192;'

# ============================================================
# LESSON 14 — Processed Foods and Toxins
# ============================================================
Write-Host "Lesson 14"
$L14 = $script:c.IndexOf('id="ch14"')
InsertBeforeH4 'The Danger of Hyper-Palatable Foods' `
    (PullQuote 'When you consume high amounts of refined sugar, industrial seed oils, and processed foods, the production of free radicals skyrockets — creating oxidative stress that damages your cells at the genetic level.') `
    $L14
InsertBeforeH4 'Oxidative Stress and Inflammation' `
    (KeyInsight 'Environmental chemicals like BPA found in plastics and pesticides are "obesogens" that mimic estrogen, directly confusing hormonal signaling and instructing fat cells to grow and multiply.') `
    $L14
InsertBeforeBtn `
    (Summary `
     'Hyper-palatable processed foods are scientifically engineered to bypass your natural satiety signals and trigger excessive insulin secretion.' `
     'Endocrine disruptors — found in plastics, fragrances, and pesticides — confuse the body''s hormonal messaging and actively encourage fat cell expansion.' `
     'Eliminating seed oils and refined sugars dramatically reduces free radical production, extinguishing the systemic inflammation that drives insulin resistance.') `
    '&#x2713; Lesson 14 Complete &#x2014; Continue to Lesson 15 &#x2192;'

# ============================================================
# LESSON 15 — Nutritional Support
# ============================================================
Write-Host "Lesson 15"
$L15 = $script:c.IndexOf('id="ch15"')
InsertBeforeH4 'Timing Your Meals With Your Body' `
    (PullQuote 'By deliberately restricting your salt on a healthy low-carb diet, you are biologically instructing your fat cells to grow larger — and can completely stall your metabolic progress.') `
    $L15
InsertBeforeH4 'Cut the Snacks' `
    (KeyInsight 'Eating one larger meal a day causes the body to burn up to 38% more energy processing that meal compared to spreading the same food across multiple smaller ones throughout the day.') `
    $L15
InsertBeforeBtn `
    (Summary `
     'Time-restricted eating or the Rule of 3s — three balanced meals with zero snacking — are both valid strategies depending on your individual metabolic and stress state.' `
     'Meal timing matters profoundly: eat larger meals earlier when insulin sensitivity is highest, and finish eating 2-3 hours before bed to align with melatonin onset.' `
     'Liberally salting food on a low-carb diet is essential — low insulin causes sodium loss, and the resulting hormonal response to replace it actively promotes fat cell growth.') `
    '&#x2713; Lesson 15 Complete &#x2014; Continue to Lesson 16 &#x2192;'

# ============================================================
# LESSON 16 — Lifestyle Strategies
# ============================================================
Write-Host "Lesson 16"
$L16 = $script:c.IndexOf('id="ch16"')
InsertBeforeH4 'The Melatonin and Insulin Connection' `
    (PullQuote 'Melatonin binds to the beta cells in your pancreas and signals them to stop producing insulin — meaning your body is naturally designed to have its lowest insulin levels while you are sleeping.') `
    $L16
InsertBeforeH4 'Active Stress Management' `
    (KeyInsight 'Getting natural sunlight in your eyes within 30 minutes of waking regulates your circadian rhythm, triggering the healthy cortisol rise that programs proper melatonin release 14 to 16 hours later.') `
    $L16
InsertBeforeBtn `
    (Summary `
     'Melatonin naturally shuts down insulin production, so eating large carbohydrate meals before bed creates a direct biological conflict that disrupts both sleep quality and blood sugar.' `
     'Anchoring your circadian rhythm with morning sunlight exposure regulates all downstream metabolic hormones and meaningfully improves both energy and fat loss.' `
     'Active stress management through meditation, yoga, vagus nerve work, and somatic practices lowers cortisol and creates the hormonal conditions for effortless fat release.') `
    '&#x2713; Lesson 16 Complete &#x2014; Continue to Lesson 17 &#x2192;'

# ============================================================
# LESSON 17 — Exercise and Movement
# ============================================================
Write-Host "Lesson 17"
$L17 = $script:c.IndexOf('id="ch17"')
InsertBeforeH4 'High-Intensity Interval Training (HIIT)' `
    (PullQuote 'We have been taught to view our bodies like a math equation — that a 300-calorie donut requires 45 minutes on a treadmill to erase. This model is not only wrong, it is actively harmful.') `
    $L17
InsertBeforeH4 'The Power of Post-Meal Movement' `
    (KeyInsight 'Muscle acts as a powerful "glucose sink" — well-developed muscle mass allows the body to store carbohydrates without requiring the massive insulin spikes that trigger fat storage.') `
    $L17
InsertBeforeBtn `
    (Summary `
     'Resistance training is the single most important form of exercise for sustainable fat loss because muscle tissue drives your resting metabolic rate 24 hours a day.' `
     'HIIT triggers Excess Post-Exercise Oxygen Consumption (EPOC), keeping the metabolism significantly elevated for hours after the workout ends.' `
     'Just 15 bodyweight squats immediately after meals forces the largest muscles in the body to rapidly absorb blood glucose — more effectively than 30 minutes of steady-state walking.') `
    '&#x2713; Lesson 17 Complete &#x2014; Continue to Lesson 18 &#x2192;'

# ============================================================
# LESSON 18 — Emotional Sabotage
# ============================================================
Write-Host "Lesson 18"
$L18 = $script:c.IndexOf('id="ch18"')
InsertBeforeH4 'The Root of Self-Sabotage' `
    (PullQuote 'If you subconsciously believe you are unworthy of health, your mind will actively find ways to keep you stuck — making self-compassion the most powerful metabolic tool you possess.') `
    $L18
InsertBeforeH4 'Common Emotional Triggers' `
    (KeyInsight 'Emotional eating is a real, neurologically driven coping mechanism that must be addressed with compassion rather than guilt — food genuinely and temporarily numbs uncomfortable feelings in the nervous system.') `
    $L18
InsertBeforeBtn `
    (Summary `
     'Self-sabotage stems from deeply ingrained subconscious beliefs about your worth and your body — these require compassionate awareness, not more willpower.' `
     'Common emotional triggers (stress, boredom, loneliness, exhaustion, and reward-seeking) drive eating behaviors that have nothing to do with physical hunger.' `
     'Progress is infinitely more powerful than perfection — celebrating every good choice and viewing setbacks with curiosity rather than shame builds transformation that actually lasts.') `
    "&#x2713; I've Completed How Your Body Burns &#x2014; Continue to Your Bonus Materials &#x2192;"

[System.IO.File]::WriteAllText($fp, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done."

$fp = "c:\Users\jaime\metabolism ebook\index.html"
$c = [System.IO.File]::ReadAllText($fp)
$c = $c.Replace("`r`n", "`n")

# ============================================================
# PHASE 1: Remove intro -> ch1 boundary (merge into lesson-1)
# ============================================================
$p1old = @'
            <button onclick="showLesson(2)" class="w-full mt-8 py-5 px-8 bg-brand-accent hover:bg-[#a68256] text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3">
                &#x2713; Lesson 1 Complete &#x2014; Continue to Lesson 2 &#x2192;
            </button>
        </div>

        <div id="lesson-2" class="hidden">
            <p class="text-xs font-bold uppercase tracking-widest text-brand-accent mb-6">Lesson 2 of 20</p>

'@.TrimEnd()
$before = $c.Length; $c = $c.Replace($p1old, ""); Write-Host "Phase 1 (merge intro+ch1): $($before -ne $c.Length)"

# ============================================================
# PHASE 2: Remove ch18 -> conclusion boundary (merge into 1 lesson)
# ============================================================
$p2old = @'
            <button onclick="showLesson(20)" class="w-full mt-8 py-5 px-8 bg-brand-accent hover:bg-[#a68256] text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3">
                &#x2713; Lesson 19 Complete &#x2014; Continue to Lesson 20 &#x2192;
            </button>
        </div>

        <div id="lesson-20" class="hidden">
            <p class="text-xs font-bold uppercase tracking-widest text-brand-accent mb-6">Lesson 20 of 20</p>

'@.TrimEnd()
$before = $c.Length; $c = $c.Replace($p2old, ""); Write-Host "Phase 2 (merge ch18+conclusion): $($before -ne $c.Length)"

# ============================================================
# RENUMBERING: lesson-3..19 -> lesson-2..18 (low-to-high via TEMP)
# ============================================================

# IDs
for ($n = 3; $n -le 19; $n++) { $c = $c.Replace("id=""lesson-$n""", "id=""lesson-TEMP-$n""") }
for ($n = 3; $n -le 19; $n++) { $c = $c.Replace("id=""lesson-TEMP-$n""", "id=""lesson-$($n-1)""") }

# showLesson() calls
for ($n = 3; $n -le 19; $n++) { $c = $c.Replace("showLesson($n)", "showLessonTEMP$n") }
for ($n = 3; $n -le 19; $n++) { $c = $c.Replace("showLessonTEMP$n", "showLesson($($n-1))") }

# Progress text "Lesson N of 20" -> "Lesson N-1 of 18" (N=3..19)
for ($n = 3; $n -le 19; $n++) { $c = $c.Replace("Lesson $n of 20", "Lesson $($n-1) of 18") }
$c = $c.Replace("Lesson 1 of 20", "Lesson 1 of 18")

# Button text "Lesson N Complete -> N+1" -> "Lesson N-1 Complete -> N" (N=2..18)
for ($n = 2; $n -le 18; $n++) {
    $c = $c.Replace(
        "&#x2713; Lesson $n Complete &#x2014; Continue to Lesson $($n+1) &#x2192;",
        "&#x2713; Lesson $($n-1) Complete &#x2014; Continue to Lesson $n &#x2192;"
    )
}
Write-Host "Renumbering: done"

# ============================================================
# GUIDE-HERO WRAPPER (visible only on lesson-1 via JS toggle)
# ============================================================
$heroOpen = @'
            <!-- Hero Section -->
            <header class="mb-20 text-center pt-8">
'@.TrimEnd()
$heroOpenNew = @'
            <div id="guide-hero">
            <!-- Hero Section -->
            <header class="mb-20 text-center pt-8">
'@.TrimEnd()
$before = $c.Length; $c = $c.Replace($heroOpen, $heroOpenNew); Write-Host "guide-hero open: $($before -ne $c.Length)"

$heroClose = @'
            <!-- Chapter Images Placeholder - Strategically placed for visual flow -->
            <img src="9.jpg" alt="Metabolism Health" class="w-full h-auto object-cover rounded-xl shadow-md mb-16" onerror="this.style.display='none'">

            <!-- Content Sections -->
'@.TrimEnd()
$heroCloseNew = @'
            <!-- Chapter Images Placeholder - Strategically placed for visual flow -->
            <img src="9.jpg" alt="Metabolism Health" class="w-full h-auto object-cover rounded-xl shadow-md mb-16" onerror="this.style.display='none'">
            </div>

            <!-- Content Sections -->
'@.TrimEnd()
$before = $c.Length; $c = $c.Replace($heroClose, $heroCloseNew); Write-Host "guide-hero close: $($before -ne $c.Length)"

# ============================================================
# WATERMARKS: Replace each progress <p> with branded watermark group
# ============================================================
for ($n = 1; $n -le 18; $n++) {
    $old = "            <p class=""text-xs font-bold uppercase tracking-widest text-brand-accent mb-6"">Lesson $n of 18</p>"
    $new = @"
            <div class="flex flex-col gap-0.5 mb-8">
                <p class="text-[10px] font-bold uppercase tracking-[0.45em] text-brand-accent/60 leading-none">How Your Body Burns</p>
                <p class="text-xs font-bold uppercase tracking-widest text-brand-accent leading-snug">Lesson $n of 18</p>
            </div>
"@.TrimEnd()
    $before = $c.Length; $c = $c.Replace($old, $new)
    if ($before -eq $c.Length) { Write-Host "  WARNING: watermark not found for lesson $n" }
}
Write-Host "Watermarks: done"

# ============================================================
# JUMP TO LESSON MENU HTML
# ============================================================
$titles = @(
    "The Flawed Calorie Model",
    "Understanding Insulin: The Master Switch",
    "Metabolism as a Signaling System",
    "Mitochondria: The Engine Behind Your Metabolism",
    "Thyroid, Nervous System, and Energy Output",
    "GLP-1 and Appetite Regulation",
    "Other Key Metabolic Hormones: Leptin and Ghrelin",
    "Ketones and Metabolic Flexibility",
    "Balancing Your Plate",
    "The Truth About Ceramides: Hidden Drivers of Insulin Resistance",
    "Digestive Health: Liver, Bile, and Gut",
    "The Gut-Brain Axis and Metabolism",
    "Factors That Hinder Weight Loss",
    "Processed Foods, Toxins, and Cellular Stress",
    "Supporting Metabolism Through Nutrition",
    "Lifestyle Strategies That Improve Metabolism",
    "Exercise and Movement",
    "Emotional Sabotage and Emotional Eating"
)

$items = ""
for ($i = 0; $i -lt $titles.Count; $i++) {
    $n = $i + 1
    $t = $titles[$i]
    $num = $n.ToString().PadLeft(2, '0')
    $locked = if ($n -eq 1) { "" } else { " opacity-30 cursor-not-allowed pointer-events-none" }
    $items += "                    <li><button onclick=`"jumpToLesson($n)`" data-lesson=`"$n`" class=`"lesson-jump-btn w-full text-left px-5 py-3.5 hover:bg-brand-accent/10 transition-all flex items-center gap-3 group$locked`"><span class=`"text-brand-accent font-mono font-bold text-xs min-w-[2rem] opacity-70`">$num</span><span class=`"text-brand-dark text-sm font-medium group-hover:text-brand-accent transition-colors leading-snug`">$t</span></button></li>`n"
}

$menu = @"
            <!-- Jump to Lesson Menu -->
            <div class="mb-8 relative" id="lesson-nav-container">
                <button onclick="toggleLessonMenu()" class="inline-flex items-center gap-2 border-2 border-brand-accent text-brand-accent px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h10"></path></svg>
                    Jump to Lesson
                    <span id="lesson-menu-arrow" class="text-[10px]">&#x25BC;</span>
                </button>
                <div id="lesson-dropdown" class="hidden absolute top-full left-0 mt-2 w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div class="px-5 py-2.5 bg-brand-dark border-b border-white/10">
                        <p class="text-[9px] font-bold uppercase tracking-[0.3em] text-white/60">How Your Body Burns &mdash; Course Navigation</p>
                    </div>
                    <ul class="divide-y divide-gray-50 max-h-72 overflow-y-auto">
$items                    </ul>
                </div>
            </div>

"@

$anchor = "            <!-- Content Sections -->"
$before = $c.Length
$c = $c.Replace($anchor, $menu + $anchor)
Write-Host "Jump to Lesson menu: $($before -ne $c.Length)"

# ============================================================
# JS: Update showLesson + add lesson menu functions
# ============================================================
$jsOld = @'
            window.switchTab = switchTab;

            function showLesson(n) {
                for (let i = 1; i <= 20; i++) {
                    const el = document.getElementById('lesson-' + i);
                    if (el) el.classList.add('hidden');
                }
                const target = document.getElementById('lesson-' + n);
                if (target) {
                    target.classList.remove('hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
            window.showLesson = showLesson;
'@.TrimEnd()

$jsNew = @'
            window.switchTab = switchTab;

            let visitedLessons = new Set([1]);
            let currentLesson = 1;

            function showLesson(n) {
                for (let i = 1; i <= 18; i++) {
                    const el = document.getElementById('lesson-' + i);
                    if (el) el.classList.add('hidden');
                }
                const target = document.getElementById('lesson-' + n);
                if (target) {
                    target.classList.remove('hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                const hero = document.getElementById('guide-hero');
                if (hero) hero.classList.toggle('hidden', n !== 1);
                visitedLessons.add(n);
                currentLesson = n;
                updateLessonMenuState();
            }
            window.showLesson = showLesson;

            function toggleLessonMenu() {
                const dd = document.getElementById('lesson-dropdown');
                const arrow = document.getElementById('lesson-menu-arrow');
                const opening = dd.classList.contains('hidden');
                dd.classList.toggle('hidden');
                arrow.innerHTML = opening ? '&#x25B2;' : '&#x25BC;';
                if (opening) updateLessonMenuState();
            }
            window.toggleLessonMenu = toggleLessonMenu;

            function jumpToLesson(n) {
                if (!visitedLessons.has(n)) return;
                showLesson(n);
                const dd = document.getElementById('lesson-dropdown');
                if (dd) dd.classList.add('hidden');
                const arrow = document.getElementById('lesson-menu-arrow');
                if (arrow) arrow.innerHTML = '&#x25BC;';
            }
            window.jumpToLesson = jumpToLesson;

            function updateLessonMenuState() {
                document.querySelectorAll('.lesson-jump-btn').forEach(btn => {
                    const n = parseInt(btn.dataset.lesson);
                    if (visitedLessons.has(n)) {
                        btn.classList.remove('opacity-30', 'cursor-not-allowed', 'pointer-events-none');
                    } else {
                        btn.classList.add('opacity-30', 'cursor-not-allowed', 'pointer-events-none');
                    }
                });
            }
'@.TrimEnd()

$before = $c.Length; $c = $c.Replace($jsOld, $jsNew); Write-Host "JS update: $($before -ne $c.Length)"

# ============================================================
# WRITE
# ============================================================
[System.IO.File]::WriteAllText($fp, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done."

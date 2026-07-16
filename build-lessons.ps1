$fp = "c:\Users\jaime\metabolism ebook\index.html"
$c = [System.IO.File]::ReadAllText($fp)
$c = $c.Replace("`r`n", "`n")

$btnCls = "w-full mt-8 py-5 px-8 bg-brand-accent hover:bg-[#a68256] text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"

# ---- 1. Open lesson-1 div before intro section ----
$old = @'
            <!-- Content Sections -->
            <section id="intro"
'@.TrimEnd()
$new = @"
            <!-- Content Sections -->
        <div id="lesson-1">
            <p class="text-xs font-bold uppercase tracking-widest text-brand-accent mb-6">Lesson 1 of 20</p>
            <section id="intro"
"@.TrimEnd()
$before = $c.Length
$c = $c.Replace($old, $new)
Write-Host "Step 1 (lesson-1 open): $($before -ne $c.Length)"

# ---- 2-20. Transitions: close prev lesson + open next lesson ----
$sections = @("ch1","ch2","ch3","ch4","ch5","ch6","ch7","ch8","ch9","ch10","ch11","ch12","ch13","ch14","ch15","ch16","ch17","ch18","conclusion")

for ($i = 0; $i -lt $sections.Count; $i++) {
    $sid = $sections[$i]
    $nextLesson = $i + 2
    $prevLesson = $i + 1
    $btnText = "&#x2713; Lesson $prevLesson Complete &#x2014; Continue to Lesson $nextLesson &#x2192;"
    $onclick = "showLesson($nextLesson)"

    $old = @"
        </section>

        <section id="$sid"
"@.TrimEnd()
    $new = @"
        </section>

            <button onclick="$onclick" class="$btnCls">
                &#x2713; Lesson $prevLesson Complete &#x2014; Continue to Lesson $nextLesson &#x2192;
            </button>
        </div>

        <div id="lesson-$nextLesson" class="hidden">
            <p class="text-xs font-bold uppercase tracking-widest text-brand-accent mb-6">Lesson $nextLesson of 20</p>

        <section id="$sid"
"@.TrimEnd()
    $before = $c.Length
    $c = $c.Replace($old, $new)
    Write-Host "Step $($i+2) (lesson-$prevLesson -> $nextLesson, section '$sid'): $($before -ne $c.Length)"
}

# ---- 21. Final button + close lesson-20 before END TAB 1 ----
$old = @'
            </div>
        </div> <!-- END TAB 1 -->
'@.TrimEnd()
$new = @"
            </div>
            <button onclick="window.switchTab('summary')" class="$btnCls">
                &#x2713; I've Completed How Your Body Burns &#x2014; Continue to Your Bonus Materials &#x2192;
            </button>
        </div>
        </div> <!-- END TAB 1 -->
"@.TrimEnd()
$before = $c.Length
$c = $c.Replace($old, $new)
Write-Host "Step 21 (lesson-20 close + final btn): $($before -ne $c.Length)"

# ---- 22. Add showLesson JS + expose globals ----
$old = @'
            btnNavHome.addEventListener('click', () => switchTab('home'));
'@.TrimEnd()
$new = @'
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

            btnNavHome.addEventListener('click', () => switchTab('home'));
'@.TrimEnd()
$before = $c.Length
$c = $c.Replace($old, $new)
Write-Host "Step 22 (showLesson JS): $($before -ne $c.Length)"

[System.IO.File]::WriteAllText($fp, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done. File written."

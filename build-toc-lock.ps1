$fp = "c:\Users\jaime\metabolism ebook\index.html"
$c = [System.IO.File]::ReadAllText($fp)
$c = $c.Replace("`r`n", "`n")

# ============================================================
# 1. REPLACE NAV CONTENT: anchor links -> lesson buttons
# ============================================================
$lk  = '                <a href="#'
$cls = ' class="nav-link block py-2 px-3 rounded text-gray-600 hover:bg-brand-light hover:text-brand-dark transition-colors'
$navOld = ('                <nav class="space-y-2 text-sm" id="toc-nav">' + "`n" +
$lk + 'intro"'      + $cls + ' font-medium mb-2 border-b border-gray-100 pb-3">Introduction</a>'  + "`n" +
$lk + 'ch1"'        + $cls + '">1. The Flawed Calorie Model</a>'            + "`n" +
$lk + 'ch2"'        + $cls + '">2. Understanding Insulin</a>'               + "`n" +
$lk + 'ch3"'        + $cls + '">3. Metabolism as a Signaling System</a>'   + "`n" +
$lk + 'ch4"'        + $cls + '">4. Mitochondria: The Engine</a>'            + "`n" +
$lk + 'ch5"'        + $cls + '">5. Thyroid & Nervous System</a>'            + "`n" +
$lk + 'ch6"'        + $cls + '">6. GLP-1 & Appetite</a>'                   + "`n" +
$lk + 'ch7"'        + $cls + '">7. Leptin and Ghrelin</a>'                 + "`n" +
$lk + 'ch8"'        + $cls + '">8. Ketones & Flexibility</a>'               + "`n" +
$lk + 'ch9"'        + $cls + '">9. Balancing Your Plate</a>'                + "`n" +
$lk + 'ch10"'       + $cls + '">10. The Truth About Ceramides</a>'          + "`n" +
$lk + 'ch11"'       + $cls + '">11. Digestive Health</a>'                   + "`n" +
$lk + 'ch12"'       + $cls + '">12. The Gut-Brain Axis</a>'                 + "`n" +
$lk + 'ch13"'       + $cls + '">13. Factors That Hinder Weight Loss</a>'   + "`n" +
$lk + 'ch14"'       + $cls + '">14. Processed Foods & Toxins</a>'           + "`n" +
$lk + 'ch15"'       + $cls + '">15. Nutritional Support</a>'               + "`n" +
$lk + 'ch16"'       + $cls + '">16. Lifestyle Strategies</a>'               + "`n" +
$lk + 'ch17"'       + $cls + '">17. Exercise and Movement</a>'              + "`n" +
$lk + 'ch18"'       + $cls + '">18. Emotional Sabotage</a>'                 + "`n" +
$lk + 'conclusion"' + $cls + ' font-medium mt-4">Conclusion</a>'            + "`n" +
'            </nav>')

$lessons = @(
    "The Flawed Calorie Model",
    "Understanding Insulin",
    "Metabolism as a Signaling System",
    "Mitochondria: The Engine",
    "Thyroid & Nervous System",
    "GLP-1 & Appetite",
    "Leptin and Ghrelin",
    "Ketones & Flexibility",
    "Balancing Your Plate",
    "The Truth About Ceramides",
    "Digestive Health",
    "The Gut-Brain Axis",
    "Factors That Hinder Weight Loss",
    "Processed Foods & Toxins",
    "Nutritional Support",
    "Lifestyle Strategies",
    "Exercise and Movement",
    "Emotional Sabotage"
)

$btns = '                <nav class="space-y-1 text-sm" id="toc-nav">' + "`n"
for ($i = 0; $i -lt $lessons.Count; $i++) {
    $n = $i + 1
    $t = $lessons[$i]
    $btns += ('                <button data-toc-lesson="' + $n + '" onclick="tocGoToLesson(' + $n + ')" class="toc-lesson-btn w-full text-left py-2 px-3 rounded transition-all flex items-center gap-2">' + "`n")
    $btns += ('                    <span class="toc-icon text-xs w-4 shrink-0 text-center"></span>' + "`n")
    $btns += ('                    <span class="toc-label text-sm leading-snug">' + $n + '. ' + $t + '</span>' + "`n")
    $btns += ('                </button>' + "`n")
}
$btns += '            </nav>'

$before = $c.Length; $c = $c.Replace($navOld, $btns); Write-Host "Nav replaced: $($before -ne $c.Length)"

# ============================================================
# 2. JS VARIABLES: add highestUnlocked
# ============================================================
$varsOld = ('            let visitedLessons = new Set([1]);' + "`n" +
            '            let currentLesson = 1;' + "`n" +
            '            let highestLesson = 1;' + "`n" +
            '            let celebrationDone = false;')
$varsNew = ('            let visitedLessons = new Set([1]);' + "`n" +
            '            let currentLesson = 1;' + "`n" +
            '            let highestLesson = 1;' + "`n" +
            '            let celebrationDone = false;' + "`n" +
            "            let highestUnlocked = parseInt(localStorage.getItem('tocHighestUnlocked') || '1');")
$before = $c.Length; $c = $c.Replace($varsOld, $varsNew); Write-Host "JS vars: $($before -ne $c.Length)"

# ============================================================
# 3. showLesson: persist highestUnlocked + call updateTocState
# ============================================================
$slOld = ('                visitedLessons.add(n);' + "`n" +
          '                currentLesson = n;' + "`n" +
          '                updateProgressBar(n);')
$slNew = ('                visitedLessons.add(n);' + "`n" +
          '                currentLesson = n;' + "`n" +
          "                if (n > highestUnlocked) { highestUnlocked = n; localStorage.setItem('tocHighestUnlocked', String(n)); }" + "`n" +
          '                updateTocState();' + "`n" +
          '                updateProgressBar(n);')
$before = $c.Length; $c = $c.Replace($slOld, $slNew); Write-Host "showLesson updated: $($before -ne $c.Length)"

# ============================================================
# 4. Initial call after updateProgressBar(1)
# ============================================================
$initOld = '            updateProgressBar(1);'
$initNew = '            updateProgressBar(1);' + "`n" + '            updateTocState();'
$before = $c.Length; $c = $c.Replace($initOld, $initNew); Write-Host "Initial updateTocState: $($before -ne $c.Length)"

# ============================================================
# 5. New JS functions — use here-string to avoid escaping issues
# ============================================================
$fnAnchor = '            window.showLesson = showLesson;'

$fnNew = @"
            window.showLesson = showLesson;

            function tocGoToLesson(n) {
                if (n > highestUnlocked) return;
                showLesson(n);
            }
            window.tocGoToLesson = tocGoToLesson;

            function updateTocState() {
                document.querySelectorAll('.toc-lesson-btn').forEach(function(btn) {
                    var n = parseInt(btn.dataset.tocLesson);
                    var icon = btn.querySelector('.toc-icon');
                    var label = btn.querySelector('.toc-label');
                    if (!icon || !label) return;
                    btn.style.fontWeight = '';
                    btn.style.backgroundColor = '';
                    if (n > highestUnlocked) {
                        btn.style.opacity = '0.4';
                        btn.style.cursor = 'not-allowed';
                        icon.textContent = String.fromCodePoint(0x1F512);
                        icon.style.color = '';
                        label.style.color = '#9ca3af';
                    } else if (n === currentLesson) {
                        btn.style.opacity = '1';
                        btn.style.cursor = 'pointer';
                        btn.style.backgroundColor = 'rgba(193,154,107,0.10)';
                        btn.style.fontWeight = '600';
                        icon.textContent = '→';
                        icon.style.color = '#c19a6b';
                        label.style.color = '#c19a6b';
                    } else if (n < currentLesson) {
                        btn.style.opacity = '1';
                        btn.style.cursor = 'pointer';
                        icon.textContent = '✓';
                        icon.style.color = '#c19a6b';
                        label.style.color = '#34657a';
                    } else {
                        btn.style.opacity = '1';
                        btn.style.cursor = 'pointer';
                        icon.textContent = '';
                        icon.style.color = '';
                        label.style.color = '#4b5563';
                    }
                });
            }
"@

$before = $c.Length; $c = $c.Replace($fnAnchor, $fnNew); Write-Host "New JS functions: $($before -ne $c.Length)"

# ============================================================
# WRITE
# ============================================================
[System.IO.File]::WriteAllText($fp, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done."

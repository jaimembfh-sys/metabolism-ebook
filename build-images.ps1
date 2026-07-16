$fp = "c:\Users\jaime\metabolism ebook\index.html"
$c = [System.IO.File]::ReadAllText($fp)
$c = $c.Replace("`r`n", "`n")

# ============================================================
# CSS: heroFadeIn keyframe + lesson-hero-img class
# ============================================================
$cssOld = '        .progress-celebrating { animation: progressGlow 0.9s ease-in-out 4; }' + "`n    </style>"
$cssNew = '        .progress-celebrating { animation: progressGlow 0.9s ease-in-out 4; }' + "`n" +
          '        @keyframes heroFadeIn {' + "`n" +
          '            from { opacity: 0; transform: translateY(8px); }' + "`n" +
          '            to   { opacity: 1; transform: translateY(0); }' + "`n" +
          '        }' + "`n" +
          '        .lesson-hero-img { animation: heroFadeIn 0.7s ease-out both; }' + "`n" +
          '    </style>'
$before = $c.Length; $c = $c.Replace($cssOld, $cssNew); Write-Host "CSS heroFadeIn: $($before -ne $c.Length)"

# ============================================================
# SIDEBAR LOGO: swap to white-transparent version
# ============================================================
$logoOld = 'src="Mindbody Functional Health Logo B.jpg" alt="Mindbody Functional Health" class="w-40 mx-auto mb-8 rounded" onerror="this.src=''https://via.placeholder.com/150?text=Mindbody+Logo''; this.onerror=null;"'
$logoNew = 'src="images/logo-white-transparent.png" alt="Mindbody Functional Health" style="max-height:50px;width:auto;" class="mx-auto mb-8" onerror="this.onerror=null;"'
$before = $c.Length; $c = $c.Replace($logoOld, $logoNew); Write-Host "Sidebar logo: $($before -ne $c.Length)"

# ============================================================
# HERO IMAGE MAP (lesson -> image path)
# ============================================================
$heroImages = @{
    1  = 'images/4_-_Copy.png'
    4  = 'images/13.png'
    5  = 'images/5_-_Copy.png'
    6  = 'images/photos.png'
    8  = 'images/12.png'
    9  = 'images/garlic__onions__broccoli__caulifower__eggs_and_asparagus.jpg'
    11 = 'images/9.png'
    12 = 'images/5_-_Copy.png'
    14 = 'images/8_-_Copy.png'
    15 = 'images/2_-_Copy.png'
    16 = 'images/11.png'
    17 = 'images/12.png'
    18 = 'images/5_-_Copy.png'
}

# ============================================================
# WATERMARK TEMPLATE (the 4-line block unique per lesson)
# ============================================================
$wLine0 = '            <div class="flex flex-col gap-0.5 mb-8">'
$wLine1 = '                <p class="text-[10px] font-bold uppercase tracking-[0.45em] text-brand-accent/60 leading-none">How Your Body Burns</p>'
$wLine3 = '            </div>'

# Logo div to insert BEFORE each watermark
$logoDiv = '            <div class="flex justify-center mb-3 pt-2">' + "`n" +
           '                <img src="images/logo-teal.png" alt="Mindbody Functional Health" style="max-height:60px;width:auto;">' + "`n" +
           '            </div>'

for ($n = 1; $n -le 18; $n++) {
    $wLine2 = '                <p class="text-xs font-bold uppercase tracking-widest text-brand-accent leading-snug">Lesson ' + $n + ' of 18</p>'
    $wOld = $wLine0 + "`n" + $wLine1 + "`n" + $wLine2 + "`n" + $wLine3

    # Build replacement: logo div + watermark + optional hero
    $wNew = $logoDiv + "`n" + $wOld

    if ($heroImages.ContainsKey($n)) {
        $src = $heroImages[$n]
        $heroDiv = '            <div class="relative w-full h-[180px] md:h-[280px] rounded-xl overflow-hidden mb-8 lesson-hero-img">' + "`n" +
                   '                <img src="' + $src + '" alt="" class="w-full h-full object-cover">' + "`n" +
                   '                <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>' + "`n" +
                   '            </div>'
        $wNew = $wNew + "`n" + $heroDiv
    }

    $before = $c.Length
    $c = $c.Replace($wOld, $wNew)
    if ($before -eq $c.Length) {
        Write-Host "  WARNING: lesson $n watermark not found"
    } else {
        $hasHero = $heroImages.ContainsKey($n)
        Write-Host ("  Lesson " + $n + ": logo=OK, hero=" + $hasHero)
    }
}

# ============================================================
# TEXTURE: Subtle gradient background on lessons WITHOUT hero images
# ============================================================
$textureLessons = @(2, 3, 7, 10, 13)
foreach ($n in $textureLessons) {
    $oldDiv = '<div id="lesson-' + $n + '" class="hidden">'
    $newDiv = '<div id="lesson-' + $n + '" class="hidden" style="background:linear-gradient(135deg,#f7f4ef 0%,#fafaf9 60%,#eef3f5 100%);">'
    $before = $c.Length
    $c = $c.Replace($oldDiv, $newDiv)
    if ($before -eq $c.Length) { Write-Host "  WARNING: texture lesson $n div not found" }
    else { Write-Host ("  Texture lesson " + $n + ": done") }
}

# ============================================================
# RECIPE TAB HERO BANNER
# ============================================================
$recOld = '<div id="tab-content-recipes" class="hidden transition-opacity duration-300 pt-8">' + "`n            " + "`n            <h2"
$recNew = '<div id="tab-content-recipes" class="hidden transition-opacity duration-300 pt-8">' + "`n" +
          '            <div class="relative w-full h-[200px] md:h-[320px] rounded-xl overflow-hidden mb-10 lesson-hero-img">' + "`n" +
          '                <img src="images/pexels-esrakorkmaz-14677945.jpg" alt="The Metabolic Kitchen" class="w-full h-full object-cover">' + "`n" +
          '                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>' + "`n" +
          '            </div>' + "`n            " + "`n            <h2"
$before = $c.Length; $c = $c.Replace($recOld, $recNew); Write-Host "Recipe hero: $($before -ne $c.Length)"

# ============================================================
# WRITE
# ============================================================
[System.IO.File]::WriteAllText($fp, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done."

$fp = "c:\Users\jaime\metabolism ebook\index.html"
$c = [System.IO.File]::ReadAllText($fp)
$c = $c.Replace("`r`n", "`n")

# ============================================================
# 1. INSERT COVER PAGE before guide-hero + hide guide-hero
# ============================================================
$guideHeroOld = '            <div id="guide-hero">'

$coverHtml = @"
            <div id="cover-page" class="py-14 px-4">
                <div style="position:relative;max-width:580px;margin:0 auto;padding:3.5rem 3.75rem;background:rgba(255,250,242,0.72);border:1px solid rgba(193,154,107,0.5);box-shadow:0 10px 48px rgba(52,101,122,0.07),0 2px 18px rgba(193,154,107,0.10);">
                    <div style="position:absolute;inset:8px;border:1px solid rgba(193,154,107,0.2);pointer-events:none;"></div>
                    <span style="position:absolute;top:-2.5px;left:-2.5px;width:26px;height:26px;border-top:2.5px solid #c19a6b;border-left:2.5px solid #c19a6b;"></span>
                    <span style="position:absolute;top:-2.5px;right:-2.5px;width:26px;height:26px;border-top:2.5px solid #c19a6b;border-right:2.5px solid #c19a6b;"></span>
                    <span style="position:absolute;bottom:-2.5px;left:-2.5px;width:26px;height:26px;border-bottom:2.5px solid #c19a6b;border-left:2.5px solid #c19a6b;"></span>
                    <span style="position:absolute;bottom:-2.5px;right:-2.5px;width:26px;height:26px;border-bottom:2.5px solid #c19a6b;border-right:2.5px solid #c19a6b;"></span>
                    <div style="text-align:center;margin-bottom:2.25rem;">
                        <img src="logos/Logo-teal-transparent.png.png" alt="Mindbody Functional Health" style="max-height:80px;width:auto;margin:0 auto;display:block;">
                    </div>
                    <p style="font-family:'Montserrat',sans-serif;font-size:0.6rem;font-weight:700;letter-spacing:0.38em;text-transform:uppercase;color:#c19a6b;text-align:center;margin-bottom:1.75rem;">Mindbody Functional Health Presents</p>
                    <h1 style="font-family:'Cormorant Garamond',serif;font-size:clamp(2.4rem,5vw,3.75rem);font-weight:700;line-height:1.1;color:#34657a;text-align:center;margin-bottom:1.25rem;">How Your Body Burns</h1>
                    <p style="color:#c19a6b;font-size:1rem;text-align:center;margin-bottom:1.25rem;letter-spacing:0.15em;">&#x2736;</p>
                    <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.45rem;font-style:italic;font-weight:300;color:#34657a;text-align:center;margin-bottom:1.75rem;">The Real Science of Metabolism</h2>
                    <p style="font-family:'Montserrat',sans-serif;font-size:0.85rem;font-weight:500;color:#34657a;text-align:center;margin-bottom:0.4rem;">By Jaime Jenkins</p>
                    <p style="font-family:'Montserrat',sans-serif;font-size:0.6rem;font-weight:700;letter-spacing:0.32em;text-transform:uppercase;color:#c19a6b;text-align:center;margin-bottom:2rem;">Mind-Body Practitioner</p>
                    <div style="width:100%;height:1px;background:linear-gradient(to right,transparent,rgba(193,154,107,0.65),transparent);margin-bottom:2rem;"></div>
                    <p style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-style:italic;color:#34657a;text-align:center;max-width:460px;margin:0 auto 2.75rem;line-height:1.75;">A Simplified Guide to Healing Your Body, Balancing Hormones, and Burning Fat Naturally Without Fighting Your Physiology.</p>
                    <div style="text-align:center;">
                        <button onclick="showLesson(1)" style="background:#c19a6b;color:white;font-family:'Montserrat',sans-serif;font-weight:700;font-size:0.95rem;padding:1rem 2.75rem;border-radius:0.75rem;border:none;cursor:pointer;letter-spacing:0.06em;box-shadow:0 4px 18px rgba(193,154,107,0.35);transition:background 0.2s;" onmouseover="this.style.background='#a68256'" onmouseout="this.style.background='#c19a6b'">Begin Lesson 1 &#x2192;</button>
                    </div>
                </div>
            </div>

            <div id="guide-hero" class="hidden">
"@

$before = $c.Length; $c = $c.Replace($guideHeroOld, $coverHtml); Write-Host "Cover page + guide-hero hidden: $($before -ne $c.Length)"

# ============================================================
# 2. HIDE LESSON-1 INITIALLY
# ============================================================
$before = $c.Length
$c = $c.Replace('        <div id="lesson-1">', '        <div id="lesson-1" class="hidden">')
Write-Host "lesson-1 hidden: $($before -ne $c.Length)"

# ============================================================
# 3. SIDEBAR: add Cover Page link at top of toc-nav
# ============================================================
$navTopOld = '                <nav class="space-y-1 text-sm" id="toc-nav">' + "`n" +
             '                <button data-toc-lesson="1"'

$navTopNew = '                <nav class="space-y-1 text-sm" id="toc-nav">' + "`n" +
             '                <button id="toc-cover-btn" onclick="showCoverPage()" class="w-full text-left py-2 px-3 rounded transition-all flex items-center gap-2" style="margin-bottom:4px;border-bottom:1px solid rgba(193,154,107,0.15);padding-bottom:10px;margin-bottom:8px;">' + "`n" +
             '                    <span id="toc-cover-icon" class="text-xs w-4 shrink-0 text-center" style="color:#c19a6b;">&#x25C9;</span>' + "`n" +
             '                    <span class="text-sm leading-snug font-semibold" style="color:#c19a6b;">Introduction</span>' + "`n" +
             '                </button>' + "`n" +
             '                <button data-toc-lesson="1"'

$before = $c.Length; $c = $c.Replace($navTopOld, $navTopNew); Write-Host "Sidebar cover link: $($before -ne $c.Length)"

# ============================================================
# 4. JS: currentLesson starts at 0 (on cover page, not lesson 1)
# ============================================================
$before = $c.Length
$c = $c.Replace('            let currentLesson = 1;', '            let currentLesson = 0;')
Write-Host "currentLesson init: $($before -ne $c.Length)"

# ============================================================
# 5. JS: showLesson hides cover-page
# ============================================================
$slOld = '                const hero = document.getElementById(''guide-hero'');' + "`n" +
         '                if (hero) hero.classList.toggle(''hidden'', n !== 1);'
$slNew = '                const cover = document.getElementById(''cover-page'');' + "`n" +
         '                if (cover) cover.classList.add(''hidden'');' + "`n" +
         '                const hero = document.getElementById(''guide-hero'');' + "`n" +
         '                if (hero) hero.classList.toggle(''hidden'', n !== 1);'
$before = $c.Length; $c = $c.Replace($slOld, $slNew); Write-Host "showLesson cover hide: $($before -ne $c.Length)"

# ============================================================
# 6. JS: add showCoverPage after tocGoToLesson
# ============================================================
$tocAnchor = '            window.tocGoToLesson = tocGoToLesson;'

$showCoverJs = @"
            window.tocGoToLesson = tocGoToLesson;

            function showCoverPage() {
                for (let i = 1; i <= 18; i++) {
                    const el = document.getElementById('lesson-' + i);
                    if (el) el.classList.add('hidden');
                }
                const hero = document.getElementById('guide-hero');
                if (hero) hero.classList.add('hidden');
                const cover = document.getElementById('cover-page');
                if (cover) cover.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                currentLesson = 0;
                updateTocState();
            }
            window.showCoverPage = showCoverPage;
"@

$before = $c.Length; $c = $c.Replace($tocAnchor, $showCoverJs); Write-Host "showCoverPage JS: $($before -ne $c.Length)"

# ============================================================
# 7. JS: updateTocState — highlight cover link when on cover
#    Add cover-btn state update at the top of updateTocState
# ============================================================
$tocStateOld = '            function updateTocState() {' + "`n" +
               "                document.querySelectorAll('.toc-lesson-btn').forEach(function(btn) {"

$tocStateNew = @"
            function updateTocState() {
                const coverBtn = document.getElementById('toc-cover-btn');
                if (coverBtn) {
                    if (currentLesson === 0) {
                        coverBtn.style.fontWeight = '700';
                        coverBtn.style.backgroundColor = 'rgba(193,154,107,0.10)';
                    } else {
                        coverBtn.style.fontWeight = '';
                        coverBtn.style.backgroundColor = '';
                    }
                }
                document.querySelectorAll('.toc-lesson-btn').forEach(function(btn) {
"@

$before = $c.Length; $c = $c.Replace($tocStateOld, $tocStateNew); Write-Host "updateTocState cover: $($before -ne $c.Length)"

# ============================================================
# WRITE
# ============================================================
[System.IO.File]::WriteAllText($fp, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done."

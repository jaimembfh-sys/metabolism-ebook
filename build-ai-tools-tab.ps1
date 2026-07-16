$fp = "c:\Users\jaime\metabolism ebook\index.html"
$c = [System.IO.File]::ReadAllText($fp)
$c = $c.Replace("`r`n", "`n")

# ============================================================
# 1. SIDEBAR: Add AI Tools tab button after Deep Healing button
# ============================================================
$healingSvgPath = 'd="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"'
$sidebarOld = $healingSvgPath + '></path></svg>' + "`n" +
              '                </button>' + "`n" +
              '            </div>'
$sidebarNew = $healingSvgPath + '></path></svg>' + "`n" +
              '                </button>' + "`n" +
              '                <button id="btn-nav-ai-tools" class="tab-nav-btn text-brand-dark border-2 border-brand-dark hover:bg-brand-light px-4 py-3 rounded-lg font-bold transition-all text-left flex justify-between items-center">' + "`n" +
              '                    <span>&#x1F916; Your AI Coach Tools</span>' + "`n" +
              '                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>' + "`n" +
              '                </button>' + "`n" +
              '            </div>'
$before = $c.Length; $c = $c.Replace($sidebarOld, $sidebarNew); Write-Host ("Sidebar AI button: " + ($before -ne $c.Length))

# ============================================================
# 2. REMOVE AI Feature 1 (Meal Coach) from guide tab
# ============================================================
$f1Start = '            <!-- AI FEATURE 1: Meal Balancer -->'
$f1End   = '            <!-- END AI FEATURE 1 -->'
$s1 = $c.IndexOf($f1Start)
$e1 = $c.IndexOf($f1End) + $f1End.Length
if ($s1 -ge 0 -and $e1 -gt $s1) {
    $c = $c.Remove($s1, $e1 - $s1)
    Write-Host "AI Feature 1 removed: True"
} else { Write-Host "AI Feature 1: NOT FOUND" }

# ============================================================
# 3. REMOVE AI Feature 2 (Interactive Coach) from guide tab
# ============================================================
$f2Start = '        <!-- AI FEATURE 2: Interactive Intake Coach -->'
$f2End   = '            <!-- END AI FEATURE 2 -->'
$s2 = $c.IndexOf($f2Start)
$e2 = $c.IndexOf($f2End) + $f2End.Length
if ($s2 -ge 0 -and $e2 -gt $s2) {
    $c = $c.Remove($s2, $e2 - $s2)
    Write-Host "AI Feature 2 removed: True"
} else { Write-Host "AI Feature 2: NOT FOUND" }

# ============================================================
# 4. REMOVE AI Feature 3 (Fridge Chef) from recipe tab
# ============================================================
$f3Start  = '            <!-- AI FEATURE 3: Fridge-to-Meal Generator -->'
$f3Marker = 'id="fridge-output"'
$s3 = $c.IndexOf($f3Start)
$f3MarkerIdx = $c.IndexOf($f3Marker, $s3)
$f3LineEnd = $c.IndexOf("`n", $f3MarkerIdx)
$f3DivClose = $c.IndexOf('</div>', $f3LineEnd)
$e3 = $f3DivClose + '</div>'.Length
if ($s3 -ge 0 -and $e3 -gt $s3) {
    $c = $c.Remove($s3, $e3 - $s3)
    Write-Host "AI Feature 3 removed: True"
} else { Write-Host "AI Feature 3: NOT FOUND" }

# ============================================================
# 5. INSERT NEW AI TOOLS TAB after END TAB 3
#    Using single-quoted here-string to avoid PS operator issues
# ============================================================
$insertAnchor = '        </div> <!-- END TAB 3 -->'

$aiTabHtml = @'
        </div> <!-- END TAB 3 -->

        <!-- ========================================== -->
        <!-- TAB: AI COACH TOOLS                        -->
        <!-- ========================================== -->
        <div id="tab-content-ai-tools" class="hidden transition-opacity duration-300 pt-8">

            <!-- Intro Header -->
            <div class="text-center mb-12">
                <img src="logos/Logo-teal-transparent.png" alt="Mindbody Functional Health" style="max-height:60px;width:auto;" class="mx-auto mb-6" onerror="this.onerror=null;">
                <h2 class="font-serif text-4xl font-bold text-brand-dark mb-4">Your Personal AI Coaching Suite</h2>
                <p class="font-serif italic text-lg text-gray-600 max-w-2xl mx-auto mb-8">Three powerful tools trained in metabolic science and Jaime Jenkins&#x2019; methods &#x2014; ready to personalize your journey.</p>
                <div style="width:100%;height:1px;background:linear-gradient(to right,transparent,rgba(193,154,107,0.65),transparent);"></div>
            </div>

            <!-- Tool 1: Interactive Metabolic Coach -->
            <div class="mb-10">
                <h3 class="font-serif text-3xl font-bold text-brand-dark mb-2">&#x2728; Interactive Metabolic Coach</h3>
                <p class="font-sans text-sm text-gray-500 mb-6">Answer 3 quick questions and receive a fully personalized, science-backed metabolic action plan built around your unique biology and goals.</p>
                <div class="bg-gradient-to-br from-brand-dark to-[#234553] text-white rounded-xl p-8 shadow-lg flex flex-col h-[650px]">
                    <div id="chat-window" class="flex-1 overflow-y-auto bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-4 space-y-4 border border-white/20 shadow-inner flex flex-col">
                        <!-- Messages will be injected here -->
                    </div>
                    <div class="flex flex-col sm:flex-row gap-3">
                        <input type="text" id="chat-input" placeholder="Type your answer here..." class="flex-1 px-4 py-3 rounded-lg border-none text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-inner">
                        <button id="chat-send-btn" class="bg-brand-accent hover:bg-[#a68256] text-white px-8 py-3 rounded-lg font-bold transition-colors text-lg shadow-md flex items-center justify-center whitespace-nowrap">
                            Send Reply
                        </button>
                    </div>
                </div>
            </div>

            <!-- Divider -->
            <div style="width:100%;height:1px;background:linear-gradient(to right,transparent,rgba(193,154,107,0.65),transparent);margin:2.5rem 0;"></div>

            <!-- Tool 2: Metabolic Meal Coach -->
            <div class="mb-10">
                <h3 class="font-serif text-3xl font-bold text-brand-dark mb-2">&#x2728; Metabolic Meal Coach</h3>
                <p class="font-sans text-sm text-gray-500 mb-6">Tell our AI what you want to eat and get instant, practical suggestions to make your meal more metabolically balanced &#x2014; without giving up the foods you love.</p>
                <div class="bg-brand-light/50 border border-brand-accent/30 rounded-xl p-6 shadow-sm">
                    <div class="flex flex-col sm:flex-row gap-3">
                        <input type="text" id="meal-input" placeholder="e.g., A bagel and a sweet coffee" class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark">
                        <button id="balance-meal-btn" class="bg-brand-dark hover:bg-[#234553] text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center whitespace-nowrap">
                            &#x2728; Balance My Meal
                        </button>
                    </div>
                    <div id="meal-loading" class="hidden mt-4 text-brand-accent text-sm font-medium animate-pulse">Analyzing your meal...</div>
                    <div id="meal-output" class="hidden mt-4 p-4 bg-white rounded-lg border border-gray-200 text-sm text-gray-700 leading-relaxed"></div>
                </div>
            </div>

            <!-- Divider -->
            <div style="width:100%;height:1px;background:linear-gradient(to right,transparent,rgba(193,154,107,0.65),transparent);margin:2.5rem 0;"></div>

            <!-- Tool 3: Fridge-to-Meal Chef -->
            <div class="mb-10">
                <h3 class="font-serif text-3xl font-bold text-brand-dark mb-2">&#x2728; AI &#x201C;Fridge-to-Meal&#x201D; Chef</h3>
                <p class="font-sans text-sm text-gray-500 mb-6">List what&#x2019;s in your fridge or pantry and our AI Chef instantly generates a simple, metabolically balanced recipe designed around your ingredients.</p>
                <div class="bg-gradient-to-br from-[#234553] to-brand-dark text-white rounded-xl p-8 shadow-xl border-l-4 border-brand-accent">
                    <div id="profile-connected-badge" class="hidden mb-4 px-4 py-3 rounded-lg text-sm font-semibold" style="background-color: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); color: #86efac;">
                        &#x2705; Your Metabolic Coach profile is connected &#x2014; recipes are now personalized to your protocol!
                    </div>
                    <div class="mb-4">
                        <label class="block text-brand-light text-sm font-semibold mb-2">What ingredients do you have?</label>
                        <textarea id="fridge-input" rows="3" placeholder="e.g., I have ground beef, half an onion, some spinach, and eggs..." class="w-full px-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent"></textarea>
                    </div>
                    <button id="generate-fridge-btn" class="w-full bg-brand-accent hover:bg-[#a68256] text-white px-6 py-3 rounded-lg font-bold transition-colors text-lg flex justify-center items-center shadow-md">
                        &#x2728; Create My Recipe
                    </button>
                    <div id="fridge-loading" class="hidden mt-6 text-brand-light text-center font-medium animate-pulse">Chopping vegetables and writing your recipe...</div>
                    <div id="fridge-output" class="hidden mt-6 p-6 bg-white text-gray-800 rounded-lg shadow-inner prose prose-brand max-w-none"></div>
                </div>
            </div>

        </div> <!-- END AI TOOLS TAB -->
'@

$before = $c.Length; $c = $c.Replace($insertAnchor, $aiTabHtml); Write-Host ("AI Tools tab inserted: " + ($before -ne $c.Length))

# ============================================================
# 6. JS: Add btnNavAiTools and tabContentAiTools variables
#    Find the block by unique substrings
# ============================================================

# 6a. btn variable
$btnAnchor = "const btnNavHealing = document.getElementById('btn-nav-healing');"
$btnInsert = "const btnNavHealing = document.getElementById('btn-nav-healing');" + "`n" +
             "            const btnNavAiTools = document.getElementById('btn-nav-ai-tools');"
$before = $c.Length; $c = $c.Replace($btnAnchor, $btnInsert); Write-Host ("JS btnNavAiTools: " + ($before -ne $c.Length))

# 6b. content variable
$cntAnchor = "const tabContentHealing = document.getElementById('tab-content-healing');"
$cntInsert = "const tabContentHealing = document.getElementById('tab-content-healing');" + "`n" +
             "            const tabContentAiTools = document.getElementById('tab-content-ai-tools');"
$before = $c.Length; $c = $c.Replace($cntAnchor, $cntInsert); Write-Host ("JS tabContentAiTools: " + ($before -ne $c.Length))

# ============================================================
# 7. switchTab: add to hide-all block
# ============================================================
$hideAnchor = "tabContentHealing.classList.add('hidden');"
$idx = $c.IndexOf($hideAnchor)
if ($idx -ge 0) {
    $ins = "`n                tabContentAiTools.classList.add('hidden');"
    $c = $c.Insert($idx + $hideAnchor.Length, $ins)
    Write-Host "switchTab hide-all: True"
} else { Write-Host "switchTab hide-all: NOT FOUND" }

# ============================================================
# 8. switchTab: add to reset-all block
# ============================================================
$resetAnchor = "btnNavHealing.className = inactiveClass;"
$idx = $c.IndexOf($resetAnchor)
if ($idx -ge 0) {
    $ins = "`n                btnNavAiTools.className = inactiveClass;"
    $c = $c.Insert($idx + $resetAnchor.Length, $ins)
    Write-Host "switchTab reset-all: True"
} else { Write-Host "switchTab reset-all: NOT FOUND" }

# ============================================================
# 9. switchTab: add else-if branch for ai-tools
# ============================================================
$elseIfAnchor = "tocContainer.style.display = 'none'; " + "`n                }"
$elseIfInsert = "tocContainer.style.display = 'none'; " + "`n" +
                "                } else if (target === 'ai-tools') {" + "`n" +
                "                    tabContentAiTools.classList.remove('hidden');" + "`n" +
                "                    btnNavAiTools.className = activeClass;" + "`n" +
                "                    tocContainer.style.display = 'none';" + "`n" +
                "                }"
# Use IndexOf to find the LAST occurrence (the healing branch closing brace)
$lastIdx = -1
$searchFrom = 0
while ($true) {
    $found = $c.IndexOf($elseIfAnchor, $searchFrom)
    if ($found -lt 0) { break }
    $lastIdx = $found
    $searchFrom = $found + 1
}
if ($lastIdx -ge 0) {
    $c = $c.Remove($lastIdx, $elseIfAnchor.Length).Insert($lastIdx, $elseIfInsert)
    Write-Host "switchTab ai-tools branch: True"
} else { Write-Host "switchTab ai-tools branch: NOT FOUND" }

# ============================================================
# 10. Event listener
# ============================================================
$listenerAnchor = "btnNavHealing.addEventListener('click', () => switchTab('healing'));"
$listenerInsert = "btnNavHealing.addEventListener('click', () => switchTab('healing'));" + "`n" +
                  "            btnNavAiTools.addEventListener('click', () => switchTab('ai-tools'));"
$before = $c.Length; $c = $c.Replace($listenerAnchor, $listenerInsert); Write-Host ("Event listener: " + ($before -ne $c.Length))

# ============================================================
# WRITE
# ============================================================
[System.IO.File]::WriteAllText($fp, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done."

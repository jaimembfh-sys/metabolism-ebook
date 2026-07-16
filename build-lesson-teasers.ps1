$fp = "c:\Users\jaime\metabolism ebook\index.html"
$c = [System.IO.File]::ReadAllText($fp)
$c = $c.Replace("`r`n", "`n")

# Helper: insert $html before the <button> whose inner text matches $anchor
function InsertBeforeBtn($html, $anchor) {
    $idx = $script:c.IndexOf($anchor)
    if ($idx -lt 0) { Write-Host ("  NOT FOUND: " + $anchor); return }
    $btnStart = $script:c.LastIndexOf('<button', $idx)
    if ($btnStart -lt 0) { Write-Host ("  button tag not found for: " + $anchor); return }
    $script:c = $script:c.Insert($btnStart, $html)
}

# Helper: build a full teaser box
function TeaserBox($emoji, $heading, $bodyText) {
    return (
        '            <div class="mt-10 p-6 rounded-xl shadow-sm" style="border-left:4px solid #c19a6b;background:rgba(251,248,242,0.88);">' + "`n" +
        '                <p class="text-xl mb-2">' + $emoji + '</p>' + "`n" +
        '                <h4 class="font-serif text-xl font-bold mb-2" style="color:#34657a;">' + $heading + '</h4>' + "`n" +
        '                <p class="font-sans text-sm text-gray-600 leading-relaxed mb-4">' + $bodyText + '</p>' + "`n" +
        '                <button onclick="window.switchTab(''ai-tools'')" style="color:#c19a6b;background:none;border:none;cursor:pointer;padding:0;font-family:''Montserrat'',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.03em;">Go to Your AI Coaching Suite &#x2192;</button>' + "`n" +
        '            </div>' + "`n"
    )
}

# Helper: build a subtle italic mention
function Mention($text) {
    return (
        '            <p class="font-serif italic text-center text-sm mt-8 mb-0" style="color:#c19a6b;">' + $text + '</p>' + "`n"
    )
}

# ============================================================
# FULL TEASER BOXES
# ============================================================

Write-Host "--- Teaser Boxes ---"

# Lesson 1
InsertBeforeBtn `
    (TeaserBox '&#x2728;' 'Your Metabolism Is Unique To You' `
     'Once you finish the Master Class your personal AI Metabolic Coach will ask you 3 questions and build a custom protocol designed specifically for your biology &#x2014; not a generic plan.') `
    '&#x2713; Lesson 1 Complete &#x2014; Continue to Lesson 2 &#x2192;'
Write-Host "  Lesson 1 teaser: done"

# Lesson 3
InsertBeforeBtn `
    (TeaserBox '&#x1F9E0;' 'Ready to Decode Your Signals?' `
     'Your AI Metabolic Coach is trained in the exact signaling science you are learning right now. After your final lesson it will analyze your personal patterns and tell you exactly what your metabolism needs.') `
    '&#x2713; Lesson 3 Complete &#x2014; Continue to Lesson 4 &#x2192;'
Write-Host "  Lesson 3 teaser: done"

# Lesson 9
InsertBeforeBtn `
    (TeaserBox '&#x2728;' 'Build Your Perfect Metabolic Plate' `
     'Your AI Meal Coach can take any meal you are craving and instantly show you how to make it metabolically stable &#x2014; without giving up the foods you love.') `
    '&#x2713; Lesson 9 Complete &#x2014; Continue to Lesson 10 &#x2192;'
Write-Host "  Lesson 9 teaser: done"

# Lesson 11
InsertBeforeBtn `
    (TeaserBox '&#x2728;' 'Heal Your Gut With the Right Foods' `
     'After completing the Master Class your AI Chef can turn whatever ingredients you have in your fridge into a gut-healing, metabolically balanced meal in seconds.') `
    '&#x2713; Lesson 11 Complete &#x2014; Continue to Lesson 12 &#x2192;'
Write-Host "  Lesson 11 teaser: done"

# Lesson 15
InsertBeforeBtn `
    (TeaserBox '&#x2728;' 'Your Personalized Nutrition Protocol Awaits' `
     'Your AI Metabolic Coach will take everything you have learned in these lessons and combine it with your personal health history to build a supplement and nutrition strategy made just for you.') `
    '&#x2713; Lesson 15 Complete &#x2014; Continue to Lesson 16 &#x2192;'
Write-Host "  Lesson 15 teaser: done"

# Lesson 17
InsertBeforeBtn `
    (TeaserBox '&#x1F9E0;' 'Movement That Works For Your Metabolism' `
     'Once you complete the Master Class your AI Coach will factor in your stress levels, sleep, and metabolic type to recommend the exact style of movement your body needs right now.') `
    '&#x2713; Lesson 17 Complete &#x2014; Continue to Lesson 18 &#x2192;'
Write-Host "  Lesson 17 teaser: done"

# ============================================================
# SUBTLE MENTIONS
# ============================================================

Write-Host "--- Subtle Mentions ---"

# Lesson 2
InsertBeforeBtn `
    (Mention 'Your AI Coach understands insulin resistance deeply &#x2014; it will factor this into your personal protocol.') `
    '&#x2713; Lesson 2 Complete &#x2014; Continue to Lesson 3 &#x2192;'
Write-Host "  Lesson 2 mention: done"

# Lesson 4
InsertBeforeBtn `
    (Mention 'The more you understand your mitochondria, the more powerful your AI protocol becomes.') `
    '&#x2713; Lesson 4 Complete &#x2014; Continue to Lesson 5 &#x2192;'
Write-Host "  Lesson 4 mention: done"

# Lesson 6
InsertBeforeBtn `
    (Mention 'Your appetite patterns are part of what your AI Coach will assess in your personal intake.') `
    '&#x2713; Lesson 6 Complete &#x2014; Continue to Lesson 7 &#x2192;'
Write-Host "  Lesson 6 mention: done"

# Lesson 8
InsertBeforeBtn `
    (Mention 'Metabolic flexibility is at the core of how your AI Coach builds your custom plan.') `
    '&#x2713; Lesson 8 Complete &#x2014; Continue to Lesson 9 &#x2192;'
Write-Host "  Lesson 8 mention: done"

# Lesson 12
InsertBeforeBtn `
    (Mention 'Your gut-brain connection will be part of your personalized AI coaching protocol.') `
    '&#x2713; Lesson 12 Complete &#x2014; Continue to Lesson 13 &#x2192;'
Write-Host "  Lesson 12 mention: done"

# Lesson 16
InsertBeforeBtn `
    (Mention 'Every lifestyle strategy your AI Coach recommends will be tailored to your unique stress and sleep patterns.') `
    '&#x2713; Lesson 16 Complete &#x2014; Continue to Lesson 17 &#x2192;'
Write-Host "  Lesson 16 mention: done"

# Lesson 18 (insert before the final completion button)
InsertBeforeBtn `
    (Mention 'Your emotional relationship with food matters. Your AI Coach is trained to address it with compassion.') `
    "&#x2713; I've Completed How Your Body Burns &#x2014; Continue to Your Bonus Materials &#x2192;"
Write-Host "  Lesson 18 mention: done"

# ============================================================
# WRITE
# ============================================================
[System.IO.File]::WriteAllText($fp, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done."

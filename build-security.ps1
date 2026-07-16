$fp = "c:\Users\jaime\metabolism ebook\index.html"
$c = [System.IO.File]::ReadAllText($fp)
$c = $c.Replace("`r`n", "`n")

# ============================================================
# 1. INSERT PROTECTION + RATE LIMITING BLOCK
#    Placed immediately before the Claude API section
# ============================================================
$apiAnchor = '            // --- CLAUDE API (via Netlify proxy) ---'

$protectionBlock = @'
            // ============================================================
            // CONTENT PROTECTION
            // ============================================================
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                alert('Content protected © Mindbody Functional Health');
            });
            document.addEventListener('keydown', function(e) {
                var ctrl = e.ctrlKey || e.metaKey;
                if (ctrl && (e.key === 'u' || e.key === 'U' ||
                             e.key === 's' || e.key === 'S' ||
                             e.key === 'a' || e.key === 'A')) {
                    e.preventDefault();
                }
            });

            // Diagonal watermark overlay
            (function() {
                var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="350">' +
                    '<text x="250" y="175" fill="rgba(52,101,122,0.04)" font-family="Montserrat,sans-serif"' +
                    ' font-size="22" font-weight="900" text-anchor="middle" dominant-baseline="middle"' +
                    ' transform="rotate(-45,250,175)">MINDBODY FUNCTIONAL HEALTH</text></svg>';
                var wm = document.createElement('div');
                wm.setAttribute('aria-hidden', 'true');
                wm.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;' +
                    'z-index:9998;background-image:url("data:image/svg+xml,' + encodeURIComponent(svg) + '");' +
                    'background-repeat:repeat;background-size:500px 350px;';
                document.body.appendChild(wm);
            })();

            // Copyright footer injected into every lesson
            (function() {
                for (var i = 1; i <= 18; i++) {
                    var el = document.getElementById('lesson-' + i);
                    if (el) {
                        var p = document.createElement('p');
                        p.style.cssText = 'text-align:center;font-size:0.65rem;color:#c19a6b;' +
                            'margin-top:2rem;padding-bottom:0.5rem;letter-spacing:0.04em;';
                        p.textContent = '© Mindbody Functional Health by Jaime Jenkins. All Rights Reserved.';
                        el.appendChild(p);
                    }
                }
            })();

            // ============================================================
            // RATE LIMITING — 10 AI requests per 24 hours
            // ============================================================
            var AI_LIMIT = 10;
            var AI_USAGE_KEY = 'aiDailyUsage';

            function getAiUsage() {
                try {
                    var raw = localStorage.getItem(AI_USAGE_KEY);
                    if (!raw) return { count: 0, resetAt: Date.now() + 86400000 };
                    var u = JSON.parse(raw);
                    if (Date.now() > u.resetAt) return { count: 0, resetAt: Date.now() + 86400000 };
                    return u;
                } catch(e) { return { count: 0, resetAt: Date.now() + 86400000 }; }
            }

            function incrementAiUsage() {
                try {
                    var u = getAiUsage();
                    u.count = (u.count || 0) + 1;
                    localStorage.setItem(AI_USAGE_KEY, JSON.stringify(u));
                } catch(e) {}
            }

            function isAiLimitReached() {
                return getAiUsage().count >= AI_LIMIT;
            }

            function updateAiCounters() {
                var usage = getAiUsage();
                var count = Math.min(usage.count, AI_LIMIT);
                var limitHit = count >= AI_LIMIT;
                document.querySelectorAll('.ai-usage-counter').forEach(function(el) {
                    el.textContent = count + ' of ' + AI_LIMIT + ' daily AI sessions used';
                });
                document.querySelectorAll('.ai-limit-message').forEach(function(el) {
                    el.style.display = limitHit ? '' : 'none';
                });
                ['balance-meal-btn', 'chat-send-btn', 'generate-fridge-btn'].forEach(function(id) {
                    var btn = document.getElementById(id);
                    if (btn) {
                        btn.disabled = limitHit;
                        btn.style.opacity = limitHit ? '0.5' : '';
                    }
                });
            }

            // --- CLAUDE API (via Netlify proxy) ---
'@

$before = $c.Length; $c = $c.Replace($apiAnchor, $protectionBlock)
Write-Host ("Protection + rate limiting block: " + ($before -ne $c.Length))

# ============================================================
# 2. MEAL COACH — add limit check after !meal guard
# ============================================================
$mealGuard = '                    if (!meal) return;'
$mealGuardNew = '                    if (!meal) return;' + "`n" +
                '                    if (isAiLimitReached()) return;'
$before = $c.Length; $c = $c.Replace($mealGuard, $mealGuardNew)
Write-Host ("Meal limit check: " + ($before -ne $c.Length))

# ============================================================
# 3. MEAL COACH — increment after successful response
# ============================================================
$mealSuccess = "                        mealOutput.innerHTML = response.replace(/\n/g, '<br>');"
$mealSuccessNew = "                        mealOutput.innerHTML = response.replace(/\n/g, '<br>');" + "`n" +
                  "                        incrementAiUsage(); updateAiCounters();"
$before = $c.Length; $c = $c.Replace($mealSuccess, $mealSuccessNew)
Write-Host ("Meal increment: " + ($before -ne $c.Length))

# ============================================================
# 4. CHAT — add limit check after !text guard
# ============================================================
$chatGuard = '                    if (!text) return;'
$chatGuardNew = '                    if (!text) return;' + "`n" +
                '                    if (isAiLimitReached()) return;'
$before = $c.Length; $c = $c.Replace($chatGuard, $chatGuardNew)
Write-Host ("Chat limit check: " + ($before -ne $c.Length))

# ============================================================
# 5. CHAT — increment after AI response pushed to history
# ============================================================
$chatSuccess = '                        chatHistory.push({ role: "assistant", content: responseText });'
$chatSuccessNew = '                        chatHistory.push({ role: "assistant", content: responseText });' + "`n" +
                  '                        incrementAiUsage(); updateAiCounters();'
$before = $c.Length; $c = $c.Replace($chatSuccess, $chatSuccessNew)
Write-Host ("Chat increment: " + ($before -ne $c.Length))

# ============================================================
# 6. FRIDGE CHEF — add limit check after !ingredients guard
# ============================================================
$fridgeGuard = '                    if (!ingredients) return;'
$fridgeGuardNew = '                    if (!ingredients) return;' + "`n" +
                  '                    if (isAiLimitReached()) return;'
$before = $c.Length; $c = $c.Replace($fridgeGuard, $fridgeGuardNew)
Write-Host ("Fridge limit check: " + ($before -ne $c.Length))

# ============================================================
# 7. FRIDGE CHEF — increment after successful response
# ============================================================
$fridgeSuccess = '                        fridgeOutput.innerHTML = response;'
$fridgeSuccessNew = '                        fridgeOutput.innerHTML = response;' + "`n" +
                    '                        incrementAiUsage(); updateAiCounters();'
$before = $c.Length; $c = $c.Replace($fridgeSuccess, $fridgeSuccessNew)
Write-Host ("Fridge increment: " + ($before -ne $c.Length))

# ============================================================
# 8. INJECT USAGE COUNTERS + LIMIT MESSAGES into AI tools tab
#    and call updateAiCounters() — placed before closing });
# ============================================================
$closingAnchor = '        });' + "`n    </script>"

$counterInit = @'
        });

            // Inject usage counters and limit messages into AI tools tab sections
            document.querySelectorAll('#tab-content-ai-tools .mb-10').forEach(function(toolDiv) {
                var desc = toolDiv.querySelector('p');
                if (!desc) return;
                var counter = document.createElement('p');
                counter.className = 'ai-usage-counter';
                counter.style.cssText = 'font-size:0.7rem;color:#c19a6b;margin-top:-0.5rem;margin-bottom:0.75rem;';
                var limitMsg = document.createElement('div');
                limitMsg.className = 'ai-limit-message';
                limitMsg.style.cssText = 'display:none;color:#c19a6b;background:rgba(193,154,107,0.08);' +
                    'border:1px solid rgba(193,154,107,0.3);border-radius:0.5rem;' +
                    'padding:0.75rem 1rem;font-size:0.85rem;font-weight:600;text-align:center;margin-bottom:1rem;';
                limitMsg.textContent = 'You have reached your daily limit for AI coaching sessions. Come back tomorrow to continue your metabolic journey!';
                desc.after(counter, limitMsg);
            });
            updateAiCounters();

    </script>
'@

$before = $c.Length; $c = $c.Replace($closingAnchor, $counterInit)
Write-Host ("Counter injection: " + ($before -ne $c.Length))

# ============================================================
# WRITE
# ============================================================
[System.IO.File]::WriteAllText($fp, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done."

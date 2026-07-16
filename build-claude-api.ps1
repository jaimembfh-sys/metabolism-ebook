$fp = "c:\Users\jaime\metabolism ebook\index.html"
$c = [System.IO.File]::ReadAllText($fp)
$c = $c.Replace("`r`n", "`n")

# ============================================================
# 1. API config: remove MODEL_NAME, update comment
# ============================================================
$cfgOld = '            // --- GEMINI API INTEGRATIONS ---' + "`n" +
          '            const apiKey = ""; // API key will be provided by the execution environment' + "`n" +
          '            const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";'
$cfgNew = '            // --- CLAUDE API INTEGRATIONS ---' + "`n" +
          '            const apiKey = ""; // Anthropic API key'
$before = $c.Length; $c = $c.Replace($cfgOld, $cfgNew); Write-Host "API config: $($before -ne $c.Length)"

# ============================================================
# 2. Replace callGemini + callGeminiChat with single callClaude
# ============================================================
$fnOld = @'
            // Reusable Gemini Call
            async function callGemini(prompt, systemInstruction) {
                if (!apiKey) throw new Error("API Key is missing. The environment must provide the key.");

                const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
                const payload = {
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] }
                };

                const data = await fetchWithRetry(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
            }

            // Chat-based Gemini Call for multi-turn conversations
            async function callGeminiChat(history, systemInstruction) {
                if (!apiKey) throw new Error("API Key is missing. The environment must provide the key.");

                const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
                const payload = {
                    contents: history,
                    systemInstruction: { parts: [{ text: systemInstruction }] }
                };

                const data = await fetchWithRetry(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
            }
'@.TrimEnd()

$fnNew = @'
            // Claude API call — handles both single-turn and multi-turn
            async function callClaude(messages, systemInstruction) {
                const url = 'https://api.anthropic.com/v1/messages';
                const payload = {
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1024,
                    system: systemInstruction,
                    messages: messages
                };

                const data = await fetchWithRetry(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify(payload)
                });

                return data.content?.[0]?.text || "No response generated.";
            }
'@.TrimEnd()

$before = $c.Length; $c = $c.Replace($fnOld, $fnNew); Write-Host "callClaude function: $($before -ne $c.Length)"

# ============================================================
# 3. Meal Coach: call site + error message
# ============================================================
$mealCallOld = 'const response = await callGemini(`How can I metabolically balance this meal: ${meal}`, sysInstruction);'
$mealCallNew = 'const response = await callClaude([{ role: "user", content: `How can I metabolically balance this meal: ${meal}` }], sysInstruction);'
$before = $c.Length; $c = $c.Replace($mealCallOld, $mealCallNew); Write-Host "Meal call site: $($before -ne $c.Length)"

$mealErrOld = 'mealOutput.innerHTML = `<span class="text-red-500">Oops! Something went wrong: ${error.message}</span>`;'
$mealErrNew = 'mealOutput.innerHTML = ''<span style="color:#c19a6b;font-weight:600;">Our AI coach is taking a short break. Please try again in a moment.</span>'';'
$before = $c.Length; $c = $c.Replace($mealErrOld, $mealErrNew); Write-Host "Meal error message: $($before -ne $c.Length)"

# ============================================================
# 4. Chat: history format — initial greeting push
# ============================================================
$greetPushOld = 'chatHistory.push({ role: "model", parts: [{ text: initialGreeting }] });'
$greetPushNew = 'chatHistory.push({ role: "assistant", content: initialGreeting });'
$before = $c.Length; $c = $c.Replace($greetPushOld, $greetPushNew); Write-Host "Chat greeting push: $($before -ne $c.Length)"

# ============================================================
# 5. Chat: user message push
# ============================================================
$userPushOld = 'chatHistory.push({ role: "user", parts: [{ text: text }] });'
$userPushNew = 'chatHistory.push({ role: "user", content: text });'
$before = $c.Length; $c = $c.Replace($userPushOld, $userPushNew); Write-Host "Chat user push: $($before -ne $c.Length)"

# ============================================================
# 6. Chat: API call
# ============================================================
$chatCallOld = 'const responseText = await callGeminiChat(chatHistory, coachSystemInstruction);'
$chatCallNew = 'const responseText = await callClaude(chatHistory, coachSystemInstruction);'
$before = $c.Length; $c = $c.Replace($chatCallOld, $chatCallNew); Write-Host "Chat call site: $($before -ne $c.Length)"

# ============================================================
# 7. Chat: AI response push
# ============================================================
$aiPushOld = 'chatHistory.push({ role: "model", parts: [{ text: responseText }] });'
$aiPushNew = 'chatHistory.push({ role: "assistant", content: responseText });'
$before = $c.Length; $c = $c.Replace($aiPushOld, $aiPushNew); Write-Host "Chat AI push: $($before -ne $c.Length)"

# ============================================================
# 8. Chat: error message
# ============================================================
$chatErrOld = 'appendChatMessage(''ai'', `<span class="text-red-500 font-bold">Oops! Something went wrong: ${error.message}</span>`);'
$chatErrNew = 'appendChatMessage(''ai'', ''<span style="color:#c19a6b;font-weight:600;">Our AI coach is taking a short break. Please try again in a moment.</span>'');'
$before = $c.Length; $c = $c.Replace($chatErrOld, $chatErrNew); Write-Host "Chat error message: $($before -ne $c.Length)"

# ============================================================
# 9. Fridge Chef: call site + error message
# ============================================================
$fridgeCallOld = 'const response = await callGemini(`I have these ingredients: ${ingredients}. Please make me a metabolically healthy meal!`, sysInstruction);'
$fridgeCallNew = 'const response = await callClaude([{ role: "user", content: `I have these ingredients: ${ingredients}. Please make me a metabolically healthy meal!` }], sysInstruction);'
$before = $c.Length; $c = $c.Replace($fridgeCallOld, $fridgeCallNew); Write-Host "Fridge call site: $($before -ne $c.Length)"

$fridgeErrOld = 'fridgeOutput.innerHTML = `<span class="text-red-500">Oops! Something went wrong: ${error.message}</span>`;'
$fridgeErrNew = 'fridgeOutput.innerHTML = ''<span style="color:#c19a6b;font-weight:600;">Our AI coach is taking a short break. Please try again in a moment.</span>'';'
$before = $c.Length; $c = $c.Replace($fridgeErrOld, $fridgeErrNew); Write-Host "Fridge error message: $($before -ne $c.Length)"

# ============================================================
# WRITE
# ============================================================
[System.IO.File]::WriteAllText($fp, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done."

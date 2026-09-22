/* ============================================================
   MetaBurn AI Coaching Suite — app-shell behaviour
   ============================================================
   Carries the preview's shell behaviour onto the real suite:

     - bottom tab bar under 900px, side rail above it
     - the view body scrolls, never the page
     - the active view is remembered across reloads
     - scroll position is kept per view, the way a native app does
     - deep-linkable: #coach, #meal-planner and the rest, back/forward too
     - staged AI loading messages and a typing indicator

   IT DOES NOT SWITCH VIEWS ITSELF. switchAiToolsView() in index.html already
   owns that, and every feature — the disclaimer gate, the usage limits, the
   safety gates — is wired around it. This wraps that function rather than
   replacing it, so the shell gets its hooks and the existing behaviour is
   untouched.

   Scoped to #tab-content-ai-tools. The other six tabs on the page are the
   course, and they scroll normally.
   ============================================================ */
(function () {
    "use strict";

    var ROOT_ID = "tab-content-ai-tools";
    var STORE_KEY = "metaburnActiveView";
    var scrollPos = {};
    var root = null;

    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

    function viewEl(name) {
        return $('.ai-tool-view[data-view-id="' + name + '"]', root);
    }
    function activeViewName() {
        var el = all(".ai-tool-view", root).filter(function (v) { return !v.classList.contains("hidden"); })[0];
        return el ? el.getAttribute("data-view-id") : null;
    }

    /* The shell fills whatever the site chrome leaves. Measured rather than
       hard-coded: the header above it is responsive and its height changes
       with the viewport. */
    function sizeShell() {
        var app = $(".mb-app", root);
        if (!app || !root || root.classList.contains("hidden")) return;
        var top = app.getBoundingClientRect().top + (window.scrollY || 0);
        var chrome = Math.max(0, Math.round(top));
        root.style.setProperty("--mb-chrome", chrome + "px");
    }

    // ---- navigation -------------------------------------------------------

    function markActive(name) {
        all(".ai-nav-item[data-ai-view]", root).forEach(function (b) {
            b.classList.toggle("is-active", b.getAttribute("data-ai-view") === name);
        });
        all(".mb-tab[data-mb-tab]", root).forEach(function (t) {
            var on = t.getAttribute("data-mb-tab") === name;
            t.classList.toggle("is-active", on);
            t.setAttribute("aria-current", on ? "page" : "false");
        });
        // The My Stuff tab lights up for any of the four account screens.
        var stuffTab = $('.mb-tab[data-mb-sheet]', root);
        if (stuffTab) {
            var on = /^account-/.test(name || "");
            stuffTab.classList.toggle("is-active", on);
            stuffTab.setAttribute("aria-current", on ? "page" : "false");
        }
        var titleEl = $("[data-mb-title]", root);
        var v = viewEl(name);
        if (titleEl && v) {
            var label = v.getAttribute("data-mb-label");
            if (!label) {
                var h = v.querySelector("h3");
                label = h ? h.textContent.replace(/[✨⚙️]/g, "").trim() : name;
            }
            titleEl.textContent = label;
        }
    }

    function rememberScroll(name) {
        var v = viewEl(name);
        if (!v) return;
        var body = v.querySelector("[data-scroll]") || v;
        scrollPos[name] = body.scrollTop;
    }
    function restoreScroll(name) {
        var v = viewEl(name);
        if (!v) return;
        var body = v.querySelector("[data-scroll]") || v;
        body.scrollTop = scrollPos[name] || 0;
    }

    /* Wrap the app's own switcher. Everything that already calls
       switchAiToolsView keeps working; the shell just learns about it. */
    function wrapSwitcher() {
        var original = window.switchAiToolsView;
        if (typeof original !== "function" || original.__mbWrapped) return;

        var wrapped = function (name) {
            var leaving = activeViewName();
            if (leaving) rememberScroll(leaving);

            original.apply(this, arguments);

            var now = activeViewName();
            if (!now) return;
            markActive(now);
            restoreScroll(now);
            closeSheet();
            try { localStorage.setItem(STORE_KEY, now); } catch (e) {}
            if (location.hash.slice(1) !== now) {
                try { history.replaceState(null, "", "#" + now); } catch (e) {}
            }
        };
        wrapped.__mbWrapped = true;
        window.switchAiToolsView = wrapped;
    }

    // ---- My Stuff sheet ---------------------------------------------------

    var sheetLastFocus = null;

    function openSheet() {
        var back = $(".mb-sheet-backdrop", root);
        if (!back) return;
        sheetLastFocus = document.activeElement;
        back.classList.add("is-open");
        back.setAttribute("aria-hidden", "false");
        var first = $(".mb-sheet .ai-nav-item", root);
        if (first) first.focus();
        document.addEventListener("keydown", sheetKeydown, true);
    }
    function closeSheet() {
        var back = $(".mb-sheet-backdrop", root);
        if (!back || !back.classList.contains("is-open")) return;
        back.classList.remove("is-open");
        back.setAttribute("aria-hidden", "true");
        document.removeEventListener("keydown", sheetKeydown, true);
        if (sheetLastFocus && sheetLastFocus.focus) sheetLastFocus.focus();
        sheetLastFocus = null;
    }
    function sheetKeydown(e) {
        if (e.key === "Escape") { e.preventDefault(); closeSheet(); return; }
        if (e.key !== "Tab") return;
        var items = all(".mb-sheet .ai-nav-item", root);
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    // ---- staged AI loading messages + typing indicator ---------------------

    /* The preview cycled a few lines while it pretended to think. These are
       the real ones, per tool, and they are advisory only: the actual request
       is what it is, this just stops a long wait looking like a hang. */
    var STEPS = {
        "meal_plan": ["Reading your protocol…", "Checking your allergies and sensitivities…", "Choosing from your recipes…", "Writing your week…"],
        "protocol": ["Reading your history…", "Checking the course material…", "Writing your answer…"],
        "chat": ["Reading your protocol…", "Checking the course material…", "Writing your answer…"],
        "default": ["Working on it…", "Nearly there…"]
    };

    var timers = new WeakMap();

    function stepsFor(el) {
        var view = el.closest ? el.closest(".ai-tool-view") : null;
        var cat = view ? view.getAttribute("data-usage-category") : null;
        return STEPS[cat] || STEPS.default;
    }

    /* Any element whose id ends in -loading is a busy indicator; scripts/a11y.js
       already gives it aria-live="polite", so replacing its text announces each
       stage to a screen reader without any extra wiring. */
    function startStages(el) {
        if (!el || timers.has(el)) return;
        var steps = stepsFor(el);
        var original = el.getAttribute("data-mb-original");
        if (original === null) el.setAttribute("data-mb-original", el.textContent.trim());

        var i = 0;
        function paint() {
            el.innerHTML =
                '<span class="mb-typing"><span class="mb-dots"><i></i><i></i><i></i></span>' +
                '<span class="mb-typing-label"></span></span>';
            var lab = el.querySelector(".mb-typing-label");
            if (lab) lab.textContent = steps[i];
        }
        paint();
        var t = setInterval(function () {
            if (i < steps.length - 1) { i++; paint(); }
        }, 2600);
        timers.set(el, t);
    }
    function stopStages(el) {
        if (!el) return;
        var t = timers.get(el);
        if (t) { clearInterval(t); timers.delete(el); }
        var original = el.getAttribute("data-mb-original");
        if (original !== null) el.textContent = original;
    }

    /* Driven by the .hidden class the app already toggles on these elements,
       so no call site has to change. */
    function watchLoaders() {
        all('[id$="-loading"]', root).forEach(function (el) {
            if (!el.classList.contains("hidden")) startStages(el);
            new MutationObserver(function () {
                if (el.classList.contains("hidden")) stopStages(el);
                else startStages(el);
            }).observe(el, { attributes: true, attributeFilter: ["class"] });
        });
    }

    // ---- boot -------------------------------------------------------------

    function boot() {
        root = document.getElementById(ROOT_ID);
        if (!root || !$(".mb-app", root)) return;

        /* The ?tabs=top / ?tabs=bottom comparison switch is gone. Jaime chose
           the top bar on 2026-09-22 and it is now simply the layout. The key
           it wrote is cleared so anyone who tried the switch is not left
           pinned to a variant that no longer exists. */
        try { localStorage.removeItem("metaburnTabsPos"); } catch (e) {}

        wrapSwitcher();

        all(".mb-tab[data-mb-tab]", root).forEach(function (t) {
            t.addEventListener("click", function (e) {
                e.preventDefault();
                if (typeof window.switchAiToolsView === "function") {
                    window.switchAiToolsView(t.getAttribute("data-mb-tab"));
                }
            });
        });
        var stuff = $(".mb-tab[data-mb-sheet]", root);
        if (stuff) {
            stuff.addEventListener("click", function (e) {
                e.preventDefault();
                var back = $(".mb-sheet-backdrop", root);
                if (back && back.classList.contains("is-open")) closeSheet(); else openSheet();
            });
        }
        var back = $(".mb-sheet-backdrop", root);
        if (back) {
            back.addEventListener("click", function (e) { if (e.target === back) closeSheet(); });
        }

        /* DEEP LINKS INTO THE SUITE.
           index.html has seven page-level tabs and opens on the course, so a
           link to #coach used to need a click across to AI Tools first. When
           the hash names one of this suite's views — or "ai-tools" itself —
           the page tab is switched too, so the link lands where it says:

               index.html#coach           the Interactive Metabolic Coach
               index.html#meal-planner    the Meal Planner
               index.html#account-recipes My Recipes
               index.html#ai-tools        the suite, on whatever was last open

           The inline script calls switchTab('home') while the page parses;
           this runs after, being deferred, so it wins. */
        function openSuite(name) {
            /* switchTab does more than switch tabs — it also fires the daily
               quote popup, which fetches. If anything in there throws, the
               view switch below must still happen: landing on the suite
               showing the wrong screen is a worse failure than losing a
               popup, and the link is the whole point. */
            if (typeof window.switchTab === "function" && root.classList.contains("hidden")) {
                try { window.switchTab("ai-tools"); }
                catch (e) {
                    console.error("[metaburn-shell] switchTab failed, opening the tab directly", e);
                    root.classList.remove("hidden");
                }
            }
            if (name && typeof window.switchAiToolsView === "function") {
                try { window.switchAiToolsView(name); }
                catch (e) { console.error("[metaburn-shell] switchAiToolsView failed", e); }
            }
            /* #ai-tools with nothing remembered opens the suite without
               naming a view, so the wrapped switcher never runs and no tab
               would be lit. Mark whatever is showing. */
            markActive(activeViewName());
            sizeShell();
        }

        var fromHash = (location.hash || "").slice(1);
        var stored = null;
        try { stored = localStorage.getItem(STORE_KEY); } catch (e) {}

        if (viewEl(fromHash)) {
            openSuite(fromHash);
        } else if (fromHash === "ai-tools") {
            openSuite(viewEl(stored) ? stored : null);
        } else if (viewEl(stored) && typeof window.switchAiToolsView === "function") {
            // Remembered view, but do NOT yank the page off the course to show it.
            window.switchAiToolsView(stored);
        } else {
            markActive(activeViewName());
        }

        window.addEventListener("hashchange", function () {
            var name = (location.hash || "").slice(1);
            if (name === "ai-tools") { openSuite(null); return; }
            if (viewEl(name) && name !== activeViewName()) openSuite(name);
            else if (viewEl(name)) openSuite(null);
        });

        sizeShell();
        window.addEventListener("resize", sizeShell);
        window.addEventListener("orientationchange", sizeShell);
        // The suite lives in a tab that starts hidden; remeasure when it appears.
        new MutationObserver(sizeShell).observe(root, { attributes: true, attributeFilter: ["class"] });

        watchLoaders();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
}());

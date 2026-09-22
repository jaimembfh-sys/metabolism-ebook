/* ============================================================
   Shared app-shell behaviour for the three MetaBurn design previews
   ============================================================
   Identical in all three so the comparison is about LOOK, not function.
   Everything the brief asked an app to do lives here:

     - view switching with no page reload
     - the active tab is remembered across reloads
     - AI loading states with a visible working indicator
     - back/forward and deep links via the hash, so a tab is shareable
     - scroll position kept per view, the way a native app does

   Previews only. Nothing here touches the real app.
   ============================================================ */
(function () {
  "use strict";

  var STORE_KEY = "metaburnPreviewTab";
  var scrollPos = {};

  function views() {
    return Array.prototype.slice.call(document.querySelectorAll("[data-view]"));
  }
  function tabs() {
    return Array.prototype.slice.call(document.querySelectorAll("[data-tab]"));
  }

  function show(name, pushHash) {
    var all = views();
    var found = all.some(function (v) { return v.getAttribute("data-view") === name; });
    if (!found) name = all.length ? all[0].getAttribute("data-view") : null;
    if (!name) return;

    // Remember where we were in the view we're leaving.
    var current = document.querySelector("[data-view].is-active");
    if (current) {
      var body = current.querySelector("[data-scroll]") || current;
      scrollPos[current.getAttribute("data-view")] = body.scrollTop;
    }

    all.forEach(function (v) {
      v.classList.toggle("is-active", v.getAttribute("data-view") === name);
    });
    tabs().forEach(function (t) {
      var on = t.getAttribute("data-tab") === name;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-current", on ? "page" : "false");
    });

    var next = document.querySelector('[data-view="' + name + '"]');
    var nextBody = next.querySelector("[data-scroll]") || next;
    nextBody.scrollTop = scrollPos[name] || 0;

    var title = next.getAttribute("data-title");
    var titleEl = document.querySelector("[data-screen-title]");
    if (title && titleEl) titleEl.textContent = title;

    try { localStorage.setItem(STORE_KEY, name); } catch (e) {}
    if (pushHash !== false && location.hash.slice(1) !== name) {
      history.replaceState(null, "", "#" + name);
    }
  }

  // ---- AI loading states ----
  function setBusy(el, on, label) {
    if (!el) return;
    el.classList.toggle("is-busy", !!on);
    el.setAttribute("aria-busy", on ? "true" : "false");
    if (label) {
      var l = el.querySelector("[data-busy-label]");
      if (l) l.textContent = label;
    }
  }

  var CHAT_STEPS = [
    "Reading your protocol…",
    "Checking the course material…",
    "Writing your answer…"
  ];

  function fakeCoachReply(root) {
    var log = root.querySelector("[data-chat-log]");
    var input = root.querySelector("[data-chat-input]");
    var send = root.querySelector("[data-chat-send]");
    if (!log || !input) return;

    var text = (input.value || "").trim();
    if (!text) return;
    input.value = "";

    log.insertAdjacentHTML(
      "beforeend",
      '<div class="msg msg--me"><div class="bubble">' + text.replace(/[<>&]/g, "") + "</div></div>"
    );
    log.scrollTop = log.scrollHeight;

    var typing = document.createElement("div");
    typing.className = "msg msg--ai";
    typing.innerHTML =
      '<div class="bubble bubble--typing"><span class="dots"><i></i><i></i><i></i></span>' +
      '<span class="typing-label" data-busy-label>' + CHAT_STEPS[0] + "</span></div>";
    log.appendChild(typing);
    log.scrollTop = log.scrollHeight;
    if (send) send.disabled = true;

    var step = 0;
    var tick = setInterval(function () {
      step++;
      if (step < CHAT_STEPS.length) {
        var l = typing.querySelector("[data-busy-label]");
        if (l) l.textContent = CHAT_STEPS[step];
      }
    }, 900);

    setTimeout(function () {
      clearInterval(tick);
      typing.remove();
      log.insertAdjacentHTML(
        "beforeend",
        '<div class="msg msg--ai"><div class="bubble">' +
          "<p>That evening pull is almost always a daytime problem showing up late. You're on shift work with 5–6 hours of sleep, so appetite signalling is already blunted.</p>" +
          "<p>Start with protein at breakfast within an hour of waking. It's the single change that moves the 8pm window most.</p>" +
          '<p class="src">Lesson 13 · Lesson 7</p>' +
          "</div></div>"
      );
      log.scrollTop = log.scrollHeight;
      if (send) send.disabled = false;
    }, 2700);
  }

  function fakeGenerate(btn) {
    var target = document.querySelector(btn.getAttribute("data-generates"));
    if (!target) return;
    setBusy(target, true, "Building your week…");
    btn.disabled = true;
    setTimeout(function () {
      setBusy(target, false);
      btn.disabled = false;
      target.classList.add("has-result");
    }, 2200);
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Restore: hash wins over stored tab, so a shared link opens the right screen.
    var fromHash = location.hash.slice(1);
    var stored = null;
    try { stored = localStorage.getItem(STORE_KEY); } catch (e) {}
    show(fromHash || stored || (views()[0] && views()[0].getAttribute("data-view")), false);

    document.addEventListener("click", function (e) {
      var tab = e.target.closest("[data-tab]");
      if (tab) { e.preventDefault(); show(tab.getAttribute("data-tab")); return; }

      var go = e.target.closest("[data-go]");
      if (go) { e.preventDefault(); show(go.getAttribute("data-go")); return; }

      var send = e.target.closest("[data-chat-send]");
      if (send) { e.preventDefault(); fakeCoachReply(send.closest("[data-view]")); return; }

      var gen = e.target.closest("[data-generates]");
      if (gen) { e.preventDefault(); fakeGenerate(gen); return; }

      var chip = e.target.closest("[data-day]");
      if (chip) {
        e.preventDefault();
        var wrap = chip.closest("[data-day-strip]");
        if (wrap) wrap.querySelectorAll("[data-day]").forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || e.shiftKey) return;
      var input = e.target.closest("[data-chat-input]");
      if (!input) return;
      e.preventDefault();
      fakeCoachReply(input.closest("[data-view]"));
    });

    window.addEventListener("hashchange", function () {
      show(location.hash.slice(1), false);
    });
  });
})();

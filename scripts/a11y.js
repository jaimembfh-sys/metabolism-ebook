/* ============================================================
   Shared accessibility wiring — Design Audit Phase 2 / TASK 4
   ============================================================

   Applied at runtime rather than by hand-editing 65 input tags and 24 result
   containers across eight pages. Doing it in one place also means any AI tool
   or form field added later inherits the behaviour instead of silently
   missing it.

   The markup-level fix is still the correct one and is queued in
   NEEDS_JAIME.md. This is a working floor, not the finished job: it depends on
   JavaScript, so it does nothing for a user with JS disabled.

   What the audit found before this existed:
     - aria-live appeared ZERO times site-wide, so every AI result arrived
       silently for a screen-reader user.
     - 65 inputs across the site had IDs but no associated label. index.html
       has real <label> elements with correct text that were simply missing
       `for`; account-info.html uses <div class="label"> instead of <label>.
     - No skip link on any page.
     - No visible focus treatment outside the components added in Phase 2.
   ============================================================ */
(function () {
  "use strict";

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  /* 1. Live regions for anything that fills in asynchronously. The codebase
        names these consistently, which is what makes this safe to automate. */
  function wireLiveRegions() {
    document.querySelectorAll('[id$="-loading"]').forEach(function (el) {
      if (el.hasAttribute("aria-live")) return;
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
    });
    document.querySelectorAll('[id$="-output"]').forEach(function (el) {
      if (!el.hasAttribute("aria-live")) el.setAttribute("aria-live", "polite");
    });
    var chat = document.getElementById("chat-window");
    if (chat && !chat.hasAttribute("aria-live")) {
      chat.setAttribute("role", "log");
      chat.setAttribute("aria-live", "polite");
      chat.setAttribute("aria-relevant", "additions");
    }
  }

  /* 2a. <label> elements that already carry the right text but no `for`. */
  function wireLabels() {
    document.querySelectorAll("label:not([for])").forEach(function (label) {
      if (label.querySelector("input, select, textarea")) return; // already wrapping
      var scope = label.parentElement;
      if (!scope) return;
      var field = scope.querySelector(
        'input[id]:not([type="hidden"]), select[id], textarea[id]'
      );
      if (field && field.id) label.setAttribute("for", field.id);
    });
  }

  /* 2b. account-info.html styles its labels as <div class="label">, which a
         screen reader treats as plain text. A div cannot own a `for`, so the
         association is made from the input side with aria-labelledby. */
  var labelSeq = 0;
  function wireDivLabels() {
    document.querySelectorAll("div.label").forEach(function (div) {
      var scope = div.parentElement;
      if (!scope) return;
      var field = scope.querySelector(
        'input[id]:not([type="hidden"]), select[id], textarea[id]'
      );
      if (!field || field.getAttribute("aria-labelledby") || field.getAttribute("aria-label")) return;
      if (!div.id) div.id = "lbl-auto-" + ++labelSeq;
      field.setAttribute("aria-labelledby", div.id);
    });
  }

  /* 3. Buttons whose only content is an icon or entity have no accessible
        name. Use the title attribute when the markup already supplies one;
        never invent wording. */
  function wireIconButtons() {
    document.querySelectorAll("button:not([aria-label])").forEach(function (btn) {
      if ((btn.textContent || "").replace(/\s+/g, "")) return;
      var title = btn.getAttribute("title");
      if (title) btn.setAttribute("aria-label", title);
    });
  }

  /* 4. Skip link, injected as the first focusable thing on the page. The text
        is a standard UI string, not page content. */
  function addSkipLink() {
    if (document.querySelector(".skip-link")) return;
    var target =
      document.querySelector("main") ||
      document.getElementById("ebook-content") ||
      document.querySelector(".shell");
    if (!target) return;
    if (!target.id) target.id = "main-content";
    var a = document.createElement("a");
    a.className = "skip-link";
    a.href = "#" + target.id;
    a.textContent = "Skip to main content";
    document.body.insertBefore(a, document.body.firstChild);
  }

  onReady(function () {
    try {
      wireLiveRegions();
      wireLabels();
      wireDivLabels();
      wireIconButtons();
      addSkipLink();
    } catch (e) {
      // Never let an accessibility enhancement break the page it is enhancing.
      console.warn("a11y wiring failed:", e);
    }
  });
})();

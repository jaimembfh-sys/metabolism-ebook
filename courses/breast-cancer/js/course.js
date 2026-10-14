/* ==========================================================
   Breast Cancer Beyond Genetics — course behavior
   Builds the top bar, chapter menu, sidebar, progress bar,
   "In this lesson" list, next/previous buttons, study pop-ups,
   word definitions and photo placeholders.
   ========================================================== */

/* ---- 1. The chapter list. Edit titles or order here only. ---- */
window.CHAPTERS = [
  { file: "part-1.html",  n: "One",    title: "Why You Haven’t Heard This",          blurb: "How much of breast cancer is actually inherited, what the industry is worth, and the conflict of interest at the origin of the pink ribbon." },
  { file: "part-2.html",  n: "Two",    title: "How Cancer Actually Starts",           blurb: "Apoptosis, mitochondria, how sugar damages them, and the three routes your body uses to clear estrogen." },
  { file: "part-3.html",  n: "Three",  title: "What Actually Raises Your Risk",       blurb: "Alcohol, body composition, hormones, stress, blood sugar, dairy and circadian rhythm — ordered by strength of evidence." },
  { file: "part-4.html",  n: "Four",   title: "What You’re Absorbing",                blurb: "Plastics, cookware, water, receipts, cosmetics and the household exposures nobody warns you about." },
  { file: "part-5.html",  n: "Five",   title: "Eating And Living Like Your Ancestors", blurb: "Whole food, muscle, movement, the thirteen-hour gap, fasting research, sunlight and sleep." },
  { file: "part-6.html",  n: "Six",    title: "Foods With Evidence Behind Them",      blurb: "Cruciferous vegetables, soy, flaxseed, green tea, mushrooms and olive oil — with the numbers." },
  { file: "part-7.html",  n: "Seven",  title: "Supporting The Cell",                  blurb: "Mitochondrial repair, glutathione, methylation, and the compound that redirects estrogen." },
  { file: "part-8.html",  n: "Eight",  title: "Beyond Standard Care",                 blurb: "Hyperthermia, IV vitamin C, mistletoe, deuterium-depleted water, repurposed drugs and metabolic therapy — sorted by evidence." },
  { file: "part-9.html",  n: "Nine",   title: "If You Have Already Been Diagnosed",   blurb: "What the research says for women with a diagnosis, and how to bring it to your oncology team." },
  { file: "part-10.html", n: "Ten",    title: "Screening, Honestly",                  blurb: "Radiation, overdiagnosis, DCIS, breast density, ultrasound, and the questions to bring." },
  { file: "part-11.html", n: "Eleven", title: "Know Your Numbers",                    blurb: "The tests a standard panel misses, what each one tells you, and what to do with the results." },
  { file: "part-12.html", n: "Twelve", title: "Where To Start",                       blurb: "All of it, ordered by how much it gives you back for what it costs you." }
];

/* ---- 2. Plain-English definitions. Tap a dotted-underlined word to see one.
        Use in a page as: <span class="term" data-term="methylation">methylation</span> ---- */
window.GLOSSARY = {
  "apoptosis": "A cell's built-in self-destruct program — an orderly shutdown your body uses to remove damaged cells.",
  "mitochondria": "The structures inside every cell that turn food into usable energy. They also hold the trigger for apoptosis.",
  "methylation": "Your body attaching a small chemical tag to a molecule. For estrogen, it makes the dangerous byproducts stable and easy to excrete.",
  "insulin": "A hormone that moves sugar out of your blood — and also a growth signal that tells cells to take up nutrients and divide.",
  "igf-1": "Insulin-like growth factor 1. A close relative of insulin that tells cells to grow and not to die.",
  "aromatase": "The enzyme that converts other hormones into estrogen, especially in fat tissue.",
  "xenoestrogens": "Manufactured chemicals shaped closely enough to estrogen to dock on its receptor and send the signal.",
  "pfas": "A class of more than 14,000 “forever chemicals” that resist breakdown in the body and the environment.",
  "superoxide": "A reactive molecule formed when electrons leak from the energy chain early. It damages whatever it touches.",
  "quinones": "Reactive molecules formed from the damaging 4-OH estrogen route. They chemically attack DNA.",
  "estrobolome": "The gut bacteria that affect how much estrogen is reactivated and sent back into circulation.",
  "autophagy": "Literally “self-eating” — cells breaking down damaged proteins and worn-out parts instead of letting them build up.",
  "ketosis": "When your body runs largely on fat and produces ketones, because carbohydrate is low.",
  "metabolic flexibility": "Your body's ability to switch cleanly between burning glucose and burning stored fat.",
  "dcis": "Ductal carcinoma in situ — abnormal cells contained inside a milk duct that have not invaded surrounding tissue.",
  "overdiagnosis": "Finding a real abnormality that meets the criteria for cancer but would never have caused symptoms or shortened your life.",
  "hba1c": "A blood test showing your average blood sugar over roughly the last three months.",
  "hs-crp": "High-sensitivity C-reactive protein — a blood marker of background inflammation.",
  "cortisol": "Your main stress hormone. It should be high in the morning and low at night.",
  "nk cells": "Natural killer cells — immune cells whose job is finding and destroying abnormal cells.",
  "deuterium": "A heavier form of hydrogen with an extra neutron. Ordinary water carries about 150 parts per million.",
  "hyperthermia": "Heating a tumor to roughly 40–44°C, usually alongside radiation.",
  "glutathione": "The antioxidant your cells rely on most heavily to neutralize oxidative damage.",
  "dim": "Diindolylmethane — a compound formed from cruciferous vegetables that shifts estrogen toward the safe route.",
  "sulforaphane": "A compound from broccoli and other cruciferous vegetables that switches on detoxification enzymes.",
  "randomized trial": "A study where people are assigned to groups by chance, so the groups differ only in what is being tested.",
  "meta-analysis": "A study that pools the results of many earlier studies to get a bigger, steadier answer.",
  "cohort": "A group of people followed over time to see who develops what.",
  "brca1": "A gene everyone has, whose job is repairing broken DNA. Inherited faulty copies carry high risk."
};

(function () {
  const page = location.pathname.split("/").pop() || "index.html";
  const idx = CHAPTERS.findIndex(c => c.file === page);
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const read = store.get("bcbg-read") || {};

  /* ---- Top bar + chapter dropdown ---- */
  const top = document.createElement("header");
  top.className = "topbar";
  top.innerHTML = `
    <button class="menu-btn" aria-label="Open chapter list">☰ Menu</button>
    <a class="brand" href="index.html"><img class="icon" src="images/logo-icon.png" alt=""><img class="word" src="images/logo-wordmark.png" alt="Mind Body Functional Health"></a>
    <span class="course-name">Breast Cancer Beyond Genetics</span>
    <span class="spacer"></span>
    <button class="chapters-btn" aria-expanded="false">Chapters ▾</button>
    <nav class="chapters-drop">
      <a href="index.html"><span class="n">⌂</span>Course home</a>
      ${CHAPTERS.map((c, i) => `<a href="${c.file}" class="${i === idx ? "current" : ""}"><span class="n">${i + 1}</span>${c.title}</a>`).join("")}
      <a href="references.html"><span class="n">📖</span>References</a>
    </nav>`;
  document.body.prepend(top);
  const progress = document.createElement("div");
  progress.className = "progress";
  top.after(progress);

  const drop = top.querySelector(".chapters-drop");
  const dropBtn = top.querySelector(".chapters-btn");
  dropBtn.addEventListener("click", e => {
    e.stopPropagation();
    drop.classList.toggle("open");
    dropBtn.setAttribute("aria-expanded", drop.classList.contains("open"));
  });
  document.addEventListener("click", e => { if (!drop.contains(e.target)) drop.classList.remove("open"); });

  /* ---- Sidebar ---- */
  const content = document.querySelector(".content");
  const h2s = content ? [...content.querySelectorAll("h2")] : [];
  h2s.forEach((h, i) => { if (!h.id) h.id = "s" + (i + 1); });

  const side = document.createElement("aside");
  side.className = "sidebar";
  side.innerHTML = `<h4>Chapters</h4>` + CHAPTERS.map((c, i) => {
    let html = `<a class="chap ${i === idx ? "current" : ""} ${read[c.file] ? "done" : ""}" href="${c.file}"><span class="n">${i + 1}</span>${c.title}</a>`;
    if (i === idx && h2s.length) html += `<div class="sections">${h2s.map(h => `<a href="#${h.id}">${h.textContent}</a>`).join("")}</div>`;
    return html;
  }).join("") + `<h4 style="margin-top:22px">More</h4><a class="chap" href="references.html"><span class="n">📖</span>References</a><a class="chap" href="index.html"><span class="n">⌂</span>Course home</a>`;
  document.querySelector(".layout").prepend(side);

  top.querySelector(".menu-btn").addEventListener("click", e => { e.stopPropagation(); document.body.classList.toggle("nav-open"); });
  side.addEventListener("click", e => { if (e.target.closest("a")) document.body.classList.remove("nav-open"); });
  document.addEventListener("click", e => { if (!side.contains(e.target)) document.body.classList.remove("nav-open"); });

  /* ---- "In this lesson" list ---- */
  const toc = document.querySelector(".lesson-toc");
  if (toc && h2s.length) {
    toc.innerHTML = `<div class="label">In this lesson</div><ol>${h2s.map(h => `<li><a href="#${h.id}">${h.textContent}</a></li>`).join("")}</ol>`;
  } else if (toc) toc.remove();

  /* ---- Scroll progress + section highlight + mark as read ---- */
  const sideLinks = [...side.querySelectorAll(".sections a")];
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? Math.min(100, (scrollY / max) * 100) : 100;
    progress.style.width = pct + "%";
    let active = 0;
    h2s.forEach((h, i) => { if (h.getBoundingClientRect().top < 140) active = i; });
    sideLinks.forEach((a, i) => a.classList.toggle("active", i === active));
    if (idx >= 0 && pct > 92 && !read[page]) {
      read[page] = true; store.set("bcbg-read", read);
      const link = side.querySelector(".chap.current"); if (link) link.classList.add("done");
    }
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (idx >= 0) store.set("bcbg-last", page);

  /* ---- Next / previous ---- */
  if (idx >= 0 && content) {
    const prev = CHAPTERS[idx - 1], next = CHAPTERS[idx + 1];
    const pager = document.createElement("nav");
    pager.className = "pager";
    pager.innerHTML =
      (prev ? `<a class="prev" href="${prev.file}"><small>← Part ${prev.n}</small><span>${prev.title}</span></a>` : "") +
      (next ? `<a class="next" href="${next.file}"><small>Part ${next.n} →</small><span>${next.title}</span></a>`
            : `<a class="next" href="references.html"><small>Next →</small><span>References</span></a>`);
    content.append(pager);
  }
  if (content) {
    const d = document.createElement("p");
    d.className = "disclaimer";
    d.textContent = "Mind Body Functional Health · Breast Cancer Beyond Genetics · Educational only — not medical advice.";
    content.append(d);
  }

  /* ---- Study pop-ups ---- */
  const REF = {};
  (window.REFERENCE_SECTIONS || []).forEach(s => s.refs.forEach(([n, t]) => REF[n] = t));
  const bg = document.createElement("div");
  bg.className = "modal-bg";
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><button class="close" aria-label="Close">×</button><h5>The research behind this</h5><div class="body"></div></div>`;
  document.body.append(bg);
  const close = () => bg.classList.remove("open");
  bg.addEventListener("click", e => { if (e.target === bg || e.target.classList.contains("close")) close(); });
  addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  document.querySelectorAll(".study").forEach(btn => {
    btn.addEventListener("click", () => {
      const nums = (btn.dataset.refs || "").split(",").map(s => s.trim()).filter(Boolean);
      bg.querySelector(".body").innerHTML = nums.map(n => {
        const t = REF[n] || "Reference not found.";
        const q = encodeURIComponent(t.split(". ").slice(0, 3).join(". "));
        return `<div class="ref"><span class="rn">${n}</span>${t}<br><a href="https://scholar.google.com/scholar?q=${q}" target="_blank" rel="noopener">Find this study ↗</a></div>`;
      }).join("") + (btn.dataset.note ? `<p style="font-size:14px;color:var(--muted);margin:12px 0 0">${btn.dataset.note}</p>` : "");
      bg.classList.add("open");
    });
  });

  /* ---- Definitions ---- */
  let tip = null;
  function hideTip() { if (tip) { tip.remove(); tip = null; } }
  function showTip(el) {
    hideTip();
    const key = (el.dataset.term || el.textContent).toLowerCase();
    const def = GLOSSARY[key];
    if (!def) return;
    tip = document.createElement("div");
    tip.className = "term-tip";
    tip.innerHTML = `<b>${el.dataset.term || el.textContent}</b>${def}`;
    document.body.append(tip);
    const r = el.getBoundingClientRect();
    const w = tip.offsetWidth;
    let left = Math.max(12, Math.min(r.left + scrollX, scrollX + innerWidth - w - 12));
    tip.style.left = left + "px";
    tip.style.top = (r.bottom + scrollY + 8) + "px";
  }
  document.querySelectorAll(".term").forEach(el => {
    el.setAttribute("tabindex", "0");
    el.addEventListener("mouseenter", () => showTip(el));
    el.addEventListener("mouseleave", hideTip);
    el.addEventListener("focus", () => showTip(el));
    el.addEventListener("blur", hideTip);
    el.addEventListener("click", e => { e.stopPropagation(); tip ? hideTip() : showTip(el); });
  });
  document.addEventListener("click", hideTip);
  addEventListener("scroll", hideTip, { passive: true });

  /* ---- Photo placeholders: shown until you drop the named image into /images ---- */
  document.querySelectorAll(".photo img").forEach(img => {
    const fail = () => {
      const box = document.createElement("div");
      box.className = "photo-missing";
      box.innerHTML = `<div><b>Photo</b><span>${img.alt}</span><code>${img.getAttribute("src")}</code></div>`;
      img.replaceWith(box);
    };
    if (img.complete && img.naturalWidth === 0) fail(); else img.addEventListener("error", fail);
  });

  /* ---- Home page: chapter cards + resume link ---- */
  const grid = document.querySelector(".chapter-grid");
  if (grid) {
    grid.innerHTML = CHAPTERS.map((c, i) => `<a class="chapter-card ${read[c.file] ? "done" : ""}" href="${c.file}"><div class="n">Part ${c.n}</div><h3>${c.title}</h3><p>${c.blurb}</p></a>`).join("");
    const last = store.get("bcbg-last");
    const start = document.querySelector(".hero .start");
    if (last && start) { const c = CHAPTERS.find(x => x.file === last); if (c) { start.href = c.file; start.textContent = "Continue: " + c.title + " →"; } }
  }

  /* ---- Part Twelve checklist boxes remember what you ticked ---- */
  const ticks = store.get("bcbg-ticks") || {};
  document.querySelectorAll(".action input[type=checkbox]").forEach(cb => {
    const k = cb.dataset.key; if (!k) return;
    cb.checked = !!ticks[k];
    cb.addEventListener("change", () => { ticks[k] = cb.checked; store.set("bcbg-ticks", ticks); });
  });
})();

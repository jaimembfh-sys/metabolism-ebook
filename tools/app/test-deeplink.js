/* Deep-link regression test for the MetaBurn suite.
 *
 *   node tools/app/test-deeplink.js
 *
 * index.html has seven page-level tabs and opens on the course, so a link to
 * #coach has to switch the page tab as well as the view. A 200 from the
 * server proves nothing — the hash is handled client side. This loads the
 * real index.html in a DOM, lets jsdom run its real scripts, and asks which
 * page tab and which view are visible afterwards.
 *
 * Ordering IS the thing under test, so the harness must not fake it.
 * index.html calls switchTab('home') and switchAiToolsView('coach') from
 * inline scripts during parse; metaburn-shell.js is deferred, so it runs
 * after them and wins. An earlier version of this harness injected the
 * deferred scripts at load and then dispatched a synthetic DOMContentLoaded.
 * That got the order wrong and made a working deep link look broken for an
 * hour — hence the real <script defer> handling below.
 *
 * jsdom is a dev-only dependency and is deliberately NOT in package.json,
 * since nothing the site ships needs it. Install it when you want to run
 * this:  npm install --no-save jsdom
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");
let jsdom;
try { jsdom = require(path.join(ROOT, "node_modules", "jsdom")); }
catch (e) {
  console.error("jsdom is not installed. Run:  npm install --no-save jsdom");
  process.exit(2);
}
const { JSDOM, VirtualConsole, requestInterceptor } = jsdom;
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const ORIGIN = "http://localhost:4173/";
const served = [];

const fromDisk = requestInterceptor((request) => {
  const url = request.url;
  if (url.startsWith(ORIGIN)) {
    const rel = decodeURIComponent(url.slice(ORIGIN.length).split(/[?#]/)[0]);
    const file = path.join(ROOT, rel);
    if (rel && fs.existsSync(file) && fs.statSync(file).isFile()) {
      served.push(rel);
      return new Response(fs.readFileSync(file), {
        headers: { "Content-Type": "application/javascript" },
      });
    }
  }
  return new Response("", { headers: { "Content-Type": "application/javascript" } });
});

function run(hash) {
  return new Promise((resolve) => {
    const dom = new JSDOM(html, {
      url: ORIGIN + "index.html" + hash,
      runScripts: "dangerously",
      resources: { interceptors: [fromDisk] },
      pretendToBeVisual: true,
      virtualConsole: new VirtualConsole(),   // swallow the page's own noise
      beforeParse(window) {
        // jsdom has no fetch. Without one the page's daily-quote popup throws
        // and the run stops measuring the thing under test.
        window.fetch = () => Promise.resolve({
          ok: true, status: 200,
          json: () => Promise.resolve({}),
          text: () => Promise.resolve(""),
        });
        window.scrollTo = () => {};
      },
    });
    const { window } = dom;

    window.addEventListener("load", () => setTimeout(measure, 400));
    setTimeout(measure, 6000);   // in case load never fires

    let done = false;
    function measure() {
      if (done) return;
      done = true;
      const d = window.document;
      const pageTab = Array.from(d.querySelectorAll('[id^="tab-content-"]'))
        .filter((t) => !t.classList.contains("hidden"))
        .map((t) => t.id.replace("tab-content-", "")).join(",") || "(none)";
      const view = Array.from(d.querySelectorAll(".ai-tool-view"))
        .filter((v) => !v.classList.contains("hidden"))
        .map((v) => v.getAttribute("data-view-id")).join(",") || "(none)";
      const title = (d.querySelector("[data-mb-title]") || {}).textContent || "";
      const activeTab = Array.from(d.querySelectorAll(".mb-tab.is-active"))
        .map((t) => t.getAttribute("data-mb-tab") || "my-stuff")[0] || "(none)";
      dom.window.close();
      resolve({ hash: hash || "(none)", pageTab, view, title: title.trim(), activeTab });
    }
  });
}

(async () => {
  const cases = ["", "#coach", "#meal-planner", "#account-recipes", "#ai-tools", "#not-a-view"];
  console.log("hash".padEnd(18) + "page tab".padEnd(12) + "view".padEnd(20) + "tab bar".padEnd(14) + "topbar title");
  console.log("-".repeat(92));
  for (const c of cases) {
    const r = await run(c);
    console.log(
      r.hash.padEnd(18) + r.pageTab.padEnd(12) + r.view.padEnd(20) +
      r.activeTab.padEnd(14) + r.title.slice(0, 32)
    );
  }
  console.log("\nlocal files jsdom actually loaded: " + [...new Set(served)].join(", "));
})();

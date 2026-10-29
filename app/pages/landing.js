/* tredo landing page (#/start) - the front door before the workspace. */

function landMock() {
  return [
    { pair: "EURUSD", total: -6, bias: "Very Bearish" },
    { pair: "GBPUSD", total: 7, bias: "Very Bullish" },
    { pair: "USDJPY", total: 4, bias: "Bullish" },
    { pair: "USDCAD", total: -6, bias: "Very Bearish" },
    { pair: "AUDUSD", total: 4, bias: "Bullish" }
  ];
}

function landChip(v) {
  var cls = v > 0 ? "pos" : v < 0 ? "neg" : "neu";
  return '<span class="lchip ' + cls + '">' + esc(v > 0 ? "+" + v : String(v)) + "</span>";
}

function landRow(r) {
  return '<div class="prow"><b class="ppair">' + esc(r.pair) + "</b>" +
    '<span class="pbias ' + (r.total > 0 ? "bpos" : "bneg") + '">' + esc(r.bias || "") + "</span>" +
    landChip(r.total) + "</div>";
}

async function landRows() {
  try {
    var a = await sb("scores_v3?select=as_of&order=as_of.desc&limit=1");
    var asOf = a && a[0] && a[0].as_of;
    if (!asOf) return null;
    var rows = await sb("scores_v3?select=pair,total,bias&as_of=eq." + asOf + "&order=total.desc&limit=100");
    if (!rows || !rows.length) return null;
    var top = rows.slice(0, 3), byTotal = rows.slice().sort(function (x, y) { return x.total - y.total; });
    return { asOf: asOf, rows: top.concat(byTotal.slice(0, 2)) };
  } catch (e) { return null; }
}

function ficon(d) {
  return '<span class="fic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg></span>';
}

var LAND_FEATURES = [
  ["Confluence scoring", "Nine independent signals collapse into one bias score per pair, so agreement is obvious at a glance.", "M8 2a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2z"],
  ["COT positioning", "Institutional net positioning, weekly change and 52-week extremes, updated after the Friday release.", "M5 20V10M12 20V4M15 5v5"],
  ["Retail sentiment", "See where the crowd sits and read it as a contrarian input, not as confirmation.", "M12 21a9 9 0 100-18 9 9 0 000 18z"],
  ["Currency strength", "All eight majors ranked by real-yield and data momentum, with divergence flags on every pair page.", "M4 8h16M8 14l2 2M16 14l2-2M12 20a4 4 0 000-8 4 4 0 000 8z"],
  ["Intermarket correlations", "A live matrix across pairs and assets, so you never stack three versions of the same trade.", "M2 4h20M2 10h20M2 16h20"],
  ["Calendar and central banks", "High-impact releases, actual-versus-forecast surprise and each bank's current policy bias.", "M4 7h16M8 20l4-4H7M5 18l3-3 3 3"]
];

var LAND_STEPS = [
  ["Open the workspace", "Home surfaces the clearest bias of the day, with the score bars behind it."],
  ["Read the confluence", "Every signal for every pair on one screen. Sort by any column, filter the noise, open a pair for the full breakdown."],
  ["Act with context", "Strength, correlations and the calendar tell you whether an idea is early, crowded or already priced."]
];

var LAND_FAQ = [
  ["What is confluence scoring?", "Each score combines nine independent signals: growth, inflation, retail sales, consumer, labour, rates, COT, retail sentiment and seasonality. Independent signals agreeing is confluence. A single signal is just noise."],
  ["Is it free?", "Yes. The workspace is free and open, with no account required. Signing in only enables saved preferences and alerts."],
  ["How often is data updated?", "Scores refresh daily, COT weekly after the Friday release, and sentiment and calendar data throughout the day."],
  ["Are scores trade signals?", "No. Scores help prioritise attention. They are not trade entries or financial advice."]
];

function landingHTML(rows, asOfLabel) {
  var feats = LAND_FEATURES.map(function (f) {
    return '<article class="fcard reveal">' + ficon(f[2]) + "<h3>" + esc(f[0]) + "</h3><p>" + esc(f[1]) + "</p></article>";
  }).join("");

  var steps = LAND_STEPS.map(function (s, i) {
    return '<div class="step reveal"><span class="n">' + (i + 1) + "</span><h3>" + esc(s[0]) + "</h3><p>" + esc(s[1]) + "</p></div>";
  }).join("");

  var faq = LAND_FAQ.map(function (q) {
    return "<details><summary>" + esc(q[0]) + "</summary><p>" + esc(q[1]) + "</p></details>";
  }).join("");

  return '<section class="lhero">' +
    '<div class="lhero-grid">' +
      '<div class="lhero-copy reveal">' +
        '<span class="kicker">Macro confluence &middot; 28 instruments</span>' +
        "<h1>Read the macro picture. <span class=\"ct\">Trade the confluence.</span></h1>" +
        '<p class="lede">tredo scores every major FX pair on rates, growth, inflation, labour and event momentum, then layers positioning, sentiment and seasonality on top — so you act when the inputs agree, not when one chart merely moves.</p>' +
        '<div class="cta-row">' +
          '<a href="#/home" class="btn primary lg">Get started free</a>' +
          '<a href="#/auth" class="btn ghost lg">Sign in</a>' +
        "</div>" +
        '<p class="micro muted">Free &middot; No account needed &middot; Daily score refresh & live COT updates</p>' +
      "</div>" +
      '<div class="shot reveal">' +
        '<div class="pcard">' +
          '<div class="phead"><span class="brand sm">' + esc(TREDO.name) + "<b>.</b></span><span class=\"muted asofdt\">" + esc(asOfLabel) + "</span></div>" +
          '<div class="pbody">' + rows.map(landRow).join("") + "</div>" +
          '<div class="pfoot muted">Every signal behind every score. This is the workspace.</div>' +
        "</div>" +
        '<div class="floatb f1"><span>Confluence</span><b class="up">High</b></div>' +
        '<div class="floatb f2"><span>Refresh</span><b>Daily</b></div>' +
      "</div>" +
    "</div>" +
  "</section>" +

  '<section class="lband"><div class="lband-in">' +
    '<div class="lstat"><b data-count="28">28</b><span>Instruments scored</span></div>' +
    '<div class="lstat"><b data-count="9">9</b><span>Independent signals</span></div>' +
    '<div class="lstat"><b data-count="8">8</b><span>Majors ranked</span></div>' +
    '<div class="lstat"><b>Daily</b><span>Score refresh</span></div>' +
  "</div></section>" +

  '<section class="lsect" id="features">' +
    '<div class="lsect-head reveal"><span class="kicker">The toolkit</span>' +
      "<h2>Everything you need to read a pair</h2>" +
      "<p>One workspace that turns macro data, positioning and seasonality into a single, comparable bias score.</p></div>" +
    '<div class="fgrid">' + feats + "</div>" +
  "</section>" +

  '<section class="lsect" id="how">' +
    '<div class="lsect-head reveal"><span class="kicker">How it works</span>' +
      "<h2>From open to answer in three steps</h2>" +
      "<p>No chart stacking. No tab hunting. The inputs are already scored, ranked and explained.</p></div>" +
    '<div class="steps">' + steps + "</div>" +
  "</section>" +

  '<section class="lsect" id="faq">' +
    '<div class="lsect-head reveal"><span class="kicker">Questions</span>' +
      "<h2>Common questions</h2></div>" +
    '<div class="faq reveal">' + faq + "</div>" +
  "</section>" +

  '<section class="lsect lfin">' +
    '<div class="lfin-card reveal">' +
      '<span class="kicker">Start now</span>' +
      "<h2>Stop guessing. Start reading the macro.</h2>" +
      "<p>The workspace opens free, with no account. Sign in later if you want saved preferences and alerts. Scores help prioritise attention — they are not trade entries or financial advice.</p>" +
      '<div class="cta-row"><a href="#/home" class="btn primary lg">Get started</a><a href="#/auth" class="btn ghost lg">Sign in</a></div>' +
    "</div>" +
  "</section>" +

  '<footer class="lfooter"><div class="lfoot-in">' +
    '<span class="brand sm">' + esc(TREDO.name) + "<b>.</b></span>" +
    '<span class="muted">' + esc(TREDO.disclaimer) + "</span>" +
    '<span><a href="#/home">Open the app</a> &nbsp; <a href="#/auth">Sign in</a></span>' +
  "</div></footer>";
}

function landCount(root) {
  var nums = root.querySelectorAll("[data-count]");
  Array.prototype.forEach.call(nums, function (el) {
    var n = Number(el.getAttribute("data-count")) || 0;
    var t0 = null, dur = 700;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

function landFX(root) {
  if (window.__landObs) { window.__landObs.disconnect(); window.__landObs = null; }
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var els = root.querySelectorAll(".reveal");
  if (reduce || !window.IntersectionObserver) {
    Array.prototype.forEach.call(els, function (e) { e.classList.add("vis"); });
    Array.prototype.forEach.call(root.querySelectorAll("[data-count]"), function (e) { e.textContent = e.getAttribute("data-count"); });
    return;
  }
  var ob = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("vis"); ob.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
  Array.prototype.forEach.call(els, function (e) { ob.observe(e); });
  window.__landObs = ob;
  landCount(root);
}

PAGES.start = function (el) {
  el.innerHTML = landingHTML(landMock(), "Live preview");
  landFX(el);
  // Pre-render feature/steps/FAQ text for immediate IntersectionObserver trigger
  var body = el.querySelector(".pbody");
  if (body) {
    // Small delay ensures DOM is up, then fetch data
    setTimeout(() => landRows().then(function (data) {
      if (!data) return;
      body.innerHTML = data.rows.map(landRow).join("");
      var t = el.querySelector(".asofdt");
      if (t) t.textContent = "As of " + data.asOf;
    }).catch(function () {}), 60);
  }
};

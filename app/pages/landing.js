/* tredo landing page (#/start) - marketing front for the app. Live data preview pulled from scores. */

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

PAGES.start = async function (el) {
  var data = await landRows();
  var rows = (data && data.rows) || landMock();
  var asOf = data ? "As of " + esc(data.asOf) : "Live example data";

  el.innerHTML =
  '<section class="hero">' +
    '<div class="kicker">Macro confluence engine for FX</div>' +
    '<h1>Know your macro bias <span class="ct">before every trade.</span></h1>' +
    '<p class="lede">tredo scores 28 instruments on central-bank rates, growth, inflation, labour data and event momentum -' +
    " with COT positioning, retail sentiment and seasonality alongside - so you only press when the inputs align.</p>" +
    '<div class="cta-row">' +
      '<a href="#/home" class="btn primary lg">Open the app</a>' +
      '<a href="#/auth" class="btn ghost lg">Sign in</a>' +
    "</div>" +
    '<div class="stats">' +
      '<span><b>28</b> instruments</span><span><b>9</b> signals</span><span><b>Daily</b> score updates</span><span><b>Weekly</b> COT &amp; report</span>' +
    "</div>" +
  "</section>" +

  '<section class="prev">' +
    '<div class="pcard">' +
      '<div class="phead"><span class="brand sm">' + esc(TREDO.name) + "<b>.</b></span><span class=\"muted\">" + asOf + "</span></div>" +
      '<div class="pbody">' +
        rows.map(function (r) {
          return '<div class="prow"><b class="ppair">' + esc(r.pair) + "</b>" +
            '<span class="pbias ' + (r.total > 0 ? "bpos" : "bneg") + '">' + esc(r.bias || "") + "</span>" +
            landChip(r.total) + "</div>";
        }).join("") +
      "</div>" +
      '<div class="pfoot muted">Every signal behind every score. The app opens on this.</div>' +
    "</div>" +
  "</section>" +

  '<section class="sect">' +
    '<div class="kicker">Four pillars, one workspace</div>' +
    '<h2>Everything you need. Nothing you don&rsquo;t.</h2>' +
    '<div class="pillars">' +
      "<div><h3>Confluence scoring</h3><p>Nine independent signals - macro inputs drive the bias score, COT, sentiment and seasonality shape conviction.</p></div>" +
      "<div><h3>COT positioning</h3><p>Track institutional net positioning with weekly change and 52-week extremes, updated every Friday.</p></div>" +
      "<div><h3>Retail sentiment</h3><p>Monitor crowd positioning in real time. When retail leans heavily one way, edge often lives on the other side.</p></div>" +
      "<div><h3>Seasonality &amp; macro</h3><p>Historical seasonal patterns overlaid with live macro indicators - per currency, per pair.</p></div>" +
    "</div>" +
  "</section>" +

  '<section class="sect">' +
    '<div class="kicker">Beyond the basics</div>' +
    '<h2>Built for decision-making</h2>' +
    '<div class="pillars">' +
      "<div><h3>Confluence alerts</h3><p>See instantly when sentiment, COT and macro align on an instrument - no watching charts all day.</p></div>" +
      "<div><h3>Currency strength</h3><p>All 8 majors ranked by real yield and data momentum, with divergence flags on every pair page.</p></div>" +
      "<div><h3>Correlations</h3><p>Intermarket correlation matrix across pairs and assets, so you never run three copies of the same trade.</p></div>" +
      "<div><h3>Calendar &amp; banks</h3><p>High-impact events per currency with filters, plus central bank bias and carry context.</p></div>" +
    "</div>" +
  "</section>" +

  '<section class="sect">' +
    '<div class="kicker">Questions</div>' +
    '<h2>Common questions</h2>' +
    '<div class="faq">' +
      "<details><summary>What is confluence scoring?</summary><p>Each score combines nine independent signals - growth, inflation, retail sales, consumer, labour, rates, COT, retail sentiment and seasonality. Independent signals agreeing is confluence; a single signal is just noise.</p></details>" +
      "<details><summary>Is it free?</summary><p>Yes. The app is free and open, no account needed. Signing in only enables saved preferences and alerts.</p></details>" +
      "<details><summary>How often is data updated?</summary><p>Scores refresh daily, COT weekly after the Friday CFTC release, sentiment and calendar live throughout the day.</p></details>" +
      "<details><summary>Are scores trade signals?</summary><p>No. Scores help prioritise attention. They are not trade entries or financial advice.</p></details>" +
    "</div>" +
  "</section>" +

  '<section class="sect ctafinal">' +
    '<h2>Trade with clarity.</h2>' +
    "<p>Stop guessing. Open the workspace and start reading the macro picture behind every pair.</p>" +
    '<div class="cta-row center"><a href="#/home" class="btn primary lg">Open the app</a></div>' +
  "</section>"
  ;
};

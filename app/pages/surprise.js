var SSM = {USD: "SPX500", GBP: "UK100", EUR: "DAX", JPY: "NIKKEI", NZD: "NZX50", CAD: "TSX", AUD: "AU200", CHF: "CH20"};

function ssRow(i, label, b, n, p) {
  var s = '<div class="brow">';
  s += '<span class="bnum">' + (i || "") + "</span>";
  s += '<span class="blab">' + esc(label) + "</span>";
  s += '<span class="btrack"><i class="acc" style="left:0;width:' + Math.max(0, Math.min(100, p)) + '%"></i></span>';
  s += '<span class="bval">' + p.toFixed(1) + "%</span>";
  if (n) s += '<span class="bsub">' + b + " of " + n + " readings Bullish</span>";
  return s + "</div>";
}

PAGES.surprise = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var r = await sb("heat_state_v?select=currency,ccy_impact,stocks_impact");
    var C = ["USD", "EUR", "GBP", "JPY", "AUD", "NZD", "CAD", "CHF", "CNY"];
    var draw = function (mode) {
      var col = mode === "stocks" ? "stocks_impact" : "ccy_impact";
      var m = {};
      C.forEach(function (c) { m[c] = { b: 0, r: 0 }; });
      r.forEach(function (x) {
        if (!m[x.currency]) return;
        if (x[col] === "Bullish") m[x.currency].b++;
        if (x[col] === "Bearish") m[x.currency].r++;
      });
      var list = C.filter(function (c) { return mode !== "stocks" || SSM[c]; }).map(function (c) {
        var n = m[c].b + m[c].r;
        return { c: c, b: m[c].b, n: n, p: n ? 100 * m[c].b / n : null };
      }).filter(function (x) { return x.n > 0; }).sort(function (a, b) { return b.p - a.p; });
      var chip = function (k, t) {
        return '<button class="fbtn' + (k === mode ? " on" : "") + '" data-m="' + k + '">' + t + "</button>";
      };
      var h = '<div class="pagehead"><div><div class="kicker">Sentiment</div><h1>Eco Surprise Index</h1></div>' +
        '<span class="asof">' + (mode === "stocks" ? "Stocks" : "Currency") + "</span></div>";
      h += '<p class="muted sub">' + (mode === "stocks" ? "Share of Bullish readings for each stock market, strongest first." : "Share of Bullish readings for each currency, strongest first.") + "</p>";
      h += '<div class="fbar">' + chip("ccy", "Currency") + chip("stocks", "Stocks") + "</div>";
      h += '<div class="gx">';
      list.forEach(function (x, i) { h += ssRow(i + 1, mode === "stocks" ? SSM[x.c] : x.c, x.b, x.n, x.p); });
      if (mode === "stocks" && list.length) {
        var avg = list.reduce(function (a, x) { return a + x.p; }, 0) / list.length;
        h += ssRow("", "AVG", 0, 0, avg);
      }
      h += "</div>";
      h += '<p class="note">Each market\'s latest readings are counted as Bullish or Bearish against forecast. Neutral readings are left out. This is context for the scores, not a forecast.</p>';
      el.innerHTML = h;
      Array.prototype.forEach.call(el.querySelectorAll("button[data-m]"), function (b) {
        b.onclick = function () { draw(b.getAttribute("data-m")); };
      });
    };
    draw("ccy");
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the index: ' + esc(e.message) + "</p>";
  }
};

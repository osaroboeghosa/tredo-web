var GCFG = {
  cut: { GDP: [0.2, 0.5], RETAIL: [0.3, 0.8], CPI: [0.1, 0.3], UE: [0.1, 0.3] },
  rel: [0.2, 0.5],
  pct: [80, 60, 40, 20],
  yld: [0.4, 1],
  crowd: [70, 60, 40, 30],
  yields: { USD: "US_YIELD_2Y", EUR: "EUR_Y2", GBP: "GBP_Y2", JPY: "JPY_Y2", AUD: "AUD_Y2", CAD: "CAD_Y2" }
};

function gcCell(t, k) {
  if (k == null) return '<div class="gcc gcn">n/a</div>';
  return '<div class="gcc gc' + (k === 0 ? "z" : (k > 0 ? "u" : "d") + Math.abs(k)) + '">' + t + "</div>";
}

function gcSg(v, d) { return (v > 0 ? "+" : "") + v.toFixed(d); }

function gcLvl(v, cut, inv) {
  var a = Math.abs(v), k = a >= cut[1] ? 2 : (a >= cut[0] ? 1 : 0);
  if (inv) v = -v;
  return v > 0 ? k : -k;
}

function gcRow(n, items) {
  var s = 0, c = 0, h = "";
  items.forEach(function (x) {
    h += gcCell(x[0], x[1]);
    if (x[1] != null) { s += x[1]; c++; }
  });
  return { n: n, s: c ? s / c : -99, h: h };
}

function gcTab(t, heads, rows, sort) {
  var st = ' style="grid-template-columns:72px repeat(' + heads.length + ',1fr)"';
  var h = "<h2>" + t + '</h2><div class="gcg"><div class="gcr"' + st + "><div></div>";
  heads.forEach(function (x) { h += '<div class="gch">' + x + "</div>"; });
  h += "</div>";
  if (sort) rows.sort(function (a, b) { return b.s - a.s; });
  rows.forEach(function (r) {
    h += '<div class="gcr"' + st + '><div class="gck">' + r.n + "</div>" + r.h + "</div>";
  });
  return h + "</div>";
}

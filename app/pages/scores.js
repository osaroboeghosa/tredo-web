var SIGS = [
  ["Momentum", "Mom"], ["Rates", "Rates"], ["GDP", "GDP"],
  ["Retail Sales", "Sales"], ["CPI", "CPI"], ["UE", "UE"],
  ["COT", "COT"], ["Retail", "Retail"], ["Season", "Season"]
];

function hcell(v) {
  if (v == null) return '<td class="na">n/a</td>';
  var n = Math.round(Number(v));
  var k = n > 0 ? "hp" : (n < 0 ? "hn" : "hz");
  return '<td class="' + k + Math.abs(n) + '">' + (n > 0 ? "+" : "") + n + "</td>";
}

function sdot(v, i) {
  var c = "dt" + (i === 6 ? " sp" : "");
  if (v == null) return '<i class="' + c + ' na"></i>';
  var n = Math.round(Number(v));
  return '<i class="' + c + " " + (n > 0 ? "hp" : (n < 0 ? "hn" : "hz")) + Math.abs(n) + '"></i>';
}

function scoreTable(s, m) {
  var h = '<div class="sl">';
  s.forEach(function (x) {
    var sc = Number(x.score);
    var c = Math.abs(sc) < 10 ? "muted" : (sc > 0 ? "up" : "down");
    var d = SIGS.map(function (n, i) { return sdot(m[x.pair] ? m[x.pair][n[0]] : null, i); }).join("");
    h += '<a class="sr" href="#/pair/' + esc(x.pair) + '"><div class="sm"><div class="sn">' + esc(x.pair) + '</div><div class="sd2">' + esc(x.label) + '</div></div>';
    h += '<div class="dots">' + d + '</div><div class="sv ' + c + '">' + (sc > 0 ? "+" : "") + sc + '</div><span class="sch">&#8250;</span></a>';
  });
  return h + "</div>";
}

PAGES.scores = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var s = await sb("scores_latest?select=pair,score,label,as_of");
    var g = await sb("signals_latest?select=pair,name,value");
    var m = {};
    g.forEach(function (r) {
      if (!m[r.pair]) m[r.pair] = {};
      m[r.pair][r.name] = r.value;
    });
    s.sort(function (a, b) { return Math.abs(b.score) - Math.abs(a.score); });
    var h = '<h1>Scores</h1>';
    if (s.length) h += '<p class="muted sub">As of ' + esc(s[0].as_of) + '</p>';
    h += filtBar() + '<div id="res"></div>';
    h += '<p class="note">Dots show the 9 signals, from -2 (red) to +2 (green). An empty circle means no fresh data. The first 6 dots are the headline signals, in this order: Momentum, Rates, GDP, Retail Sales, CPI, UE. The last 3 are context only: COT, Retail (trader positioning, read as contrarian) and Season.</p>';
    h += '<p class="note">The score uses only the 6 headline signals. Tap a row to open its detail page.</p>';
    el.innerHTML = h;
    var res = el.querySelector("#res");
    var draw = function () {
      var f = s.filter(function (x) { return filtMatch(x.pair); });
      res.innerHTML = f.length ? scoreTable(f, m) : filtEmpty();
    };
    filtWire(el, draw);
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load scores: ' + esc(e.message) + "</p>";
  }
};

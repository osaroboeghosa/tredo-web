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
    h += '<div class="tw"><table class="ht"><thead>';
    h += '<tr><th></th><th></th><th class="gh" colspan="6">Headline</th><th class="gh" colspan="3">Context only</th></tr>';
    h += '<tr><th></th><th>Score</th>';
    SIGS.forEach(function (x) { h += "<th>" + x[1] + "</th>"; });
    h += "</tr></thead><tbody>";
    s.forEach(function (x) {
      var sc = Number(x.score);
      var c = Math.abs(sc) < 10 ? "muted" : (sc > 0 ? "up" : "down");
      h += '<tr><td class="pr"><a href="#/pair/' + esc(x.pair) + '">' + esc(x.pair) + "</a><small>" + esc(x.label) + "</small></td>";
      h += '<td class="sc ' + c + '">' + (sc > 0 ? "+" : "") + sc + "</td>";
      SIGS.forEach(function (n) {
        h += hcell(m[x.pair] ? m[x.pair][n[0]] : null);
      });
      h += "</tr>";
    });
    h += "</tbody></table></div>";
    h += '<p class="note">Each signal runs from -2 (bearish) to +2 (bullish). n/a means no fresh data.</p>';
    h += '<p class="note">Sales = retail sales (economic data). Retail = trader positioning, read as a contrarian signal.</p>';
    h += '<p class="note">The score uses only the 6 headline signals. COT, Retail and Season are context.</p>';
    h += '<p class="note">Tap a pair name to open its detail page.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load scores: ' + esc(e.message) + "</p>";
  }
};

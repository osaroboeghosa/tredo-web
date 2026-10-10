var SIGS = [
  ["Momentum", "Mom"], ["COT", "COT"], ["Rates", "Rates"],
  ["GDP", "GDP"], ["Retail Sales", "Sales"], ["Retail", "Retail"],
  ["CPI", "CPI"], ["UE", "UE"], ["Season", "Season"]
];

async function loadScores() {
  var app = document.getElementById("app");
  try {
    var s = await sb("scores_latest?select=pair,score,label,direction,tier,as_of");
    var g = await sb("signals_latest?select=pair,name,value");
    var m = {};
    g.forEach(function (r) {
      if (!m[r.pair]) m[r.pair] = {};
      m[r.pair][r.name] = r.value;
    });
    s.sort(function (a, b) { return Math.abs(b.score) - Math.abs(a.score); });
    var h = "";
    if (s.length) h += '<p class="note">Scores as of ' + esc(s[0].as_of) + "</p>";
    h += '<div class="twrap"><table class="stbl"><thead><tr><th>Pair</th><th>Score</th>';
    SIGS.forEach(function (x) { h += "<th>" + x[1] + "</th>"; });
    h += "</tr></thead><tbody>";
    s.forEach(function (x) {
      var d = dirClass(x.direction);
      h += "<tr><td><b>" + esc(x.pair) + '</b><div class="tl ' + d + '">' + esc(x.label) + "</div></td>";
      h += '<td class="' + d + '"><b>' + fmtScore(x.score) + "</b></td>";
      SIGS.forEach(function (n) {
        var v = m[x.pair] ? m[x.pair][n[0]] : null;
        if (v === undefined) v = null;
        h += '<td class="' + signClass(v) + '">' + fmtScore(v) + "</td>";
      });
      h += "</tr>";
    });
    h += "</tbody></table></div>";
    h += '<p class="note">Each signal runs from -2 (bearish) to +2 (bullish). n/a means no data.</p>';
    h += '<p class="note">Sales = Retail Sales (economic data). Retail = retail trader positioning, read as a contrarian signal.</p>';
    h += '<p class="note">The headline score uses only Mom, Rates, GDP, Sales, CPI and UE. COT, Retail and Season are shown for context.</p>';
    app.innerHTML = h;
  } catch (e) {
    app.textContent = "Could not load scores: " + e.message;
  }
                   }

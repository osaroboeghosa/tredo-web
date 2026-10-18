var T3S = [["trend", "Trend"], ["season", "Season"], ["cot", "COT"], ["crowd", "Crowd"], ["gdp", "GDP"], ["retail_sales", "Sales"], ["consumer", "Consumer"], ["cpi", "CPI"], ["rates", "Rates"], ["ppi", "PPI"], ["pce", "PCE"], ["unemp", "Unemp"], ["nfp", "NFP"], ["claims", "Claims"], ["jolts", "JOLTS"]];
var T3G = [["Technical", 2], ["Sentiment", 2], ["Growth", 3], ["Inflation", 4], ["Jobs", 4]];
var t3k = "abs", t3d = -1, t3h = false;

function t3c(v) {
  if (v == null) return '<td class="na"></td>';
  var n = Math.round(Number(v)), k = n === 0 ? "hz0" : (n > 0 ? "hp" : "hn") + Math.min(2, Math.abs(n));
  return '<td class="' + k + '">' + (n > 0 ? "+" : "") + n + "</td>";
}

function t3v(x, k) {
  if (k === "abs") return Math.abs(Number(x.total));
  return x[k] == null ? -99 : Number(x[k]);
}

function t3row(x) {
  var f = Number(x.total), c = /Bull/.test(x.bias) ? "up" : /Bear/.test(x.bias) ? "down" : "muted";
  var h = '<tr><td class="pr"><a href="#/pair/' + esc(x.pair) + '">' + esc(x.pair) + "</a><small>" + esc(x.bias) + "</small></td>";
  h += '<td class="sc ' + c + '">' + (f > 0 ? "+" : "") + f + "</td>";
  T3S.forEach(function (n) { h += t3c(x[n[0]]); });
  return h + "</tr>";
}

function t3tab(f) {
  var h = '<div class="tw"><table class="ht"><thead><tr><th class="gh" colspan="2">Output</th>';
  T3G.forEach(function (g) { h += '<th class="gh" colspan="' + g[1] + '">' + g[0] + "</th>"; });
  h += "</tr><tr><th></th>";
  [["abs", "Score"]].concat(T3S).forEach(function (c) {
    h += '<th class="t2h" data-k="' + c[0] + '">' + c[1] + (t3k === c[0] ? (t3d < 0 ? " &#9660;" : " &#9650;") : "") + "</th>";
  });
  return h + "</tr></thead><tbody>" + f.map(t3row).join("") + "</tbody></table></div>";
}

PAGES.home = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var d = await sb("scores_v3?select=as_of&order=as_of.desc&limit=1");
    if (!d.length) { el.innerHTML = '<h1>Top Setups</h1><p class="muted">No scores yet.</p>'; return; }
    var day = d[0].as_of;
    var cols = "pair,total,bias," + T3S.map(function (n) { return n[0]; }).join(",");
    var rows = await sb("scores_v3?select=" + cols + "&as_of=eq." + day + "&limit=100");
    var h = '<h1>Top Setups</h1><p class="muted sub">Every signal behind every score. As of ' + esc(day) + ". Tap a heading to sort.</p>" + filtBar();
    h += '<div class="gx"><div class="gr"><span class="gl">Hide Neutral</span><button class="msw" id="hn" aria-label="Hide Neutral"><i></i></button></div></div><div id="res"></div>';
    h += '<p class="note">Each signal runs from -2 (red) to +2 (green). The score is the plain sum of all signals. Blank means no data for that pair. Accuracy is not proven. Scores rank where to look first. They are not forecasts.</p>';
    el.innerHTML = h;
    var res = el.querySelector("#res");
    var draw = function () {
      var f = rows.filter(function (x) { return filtMatch(x.pair) && (!t3h || x.bias !== "Neutral"); });
      f.sort(function (a, b) { return (t3v(b, t3k) - t3v(a, t3k)) * (t3d < 0 ? 1 : -1); });
      res.innerHTML = f.length ? t3tab(f) : filtEmpty();
    };
    res.addEventListener("click", function (e) {
      var t = e.target.closest(".t2h");
      if (!t) return;
      var k = t.getAttribute("data-k");
      if (k === t3k) t3d = -t3d; else { t3k = k; t3d = -1; }
      draw();
    });
    filtWire(el, draw);
    var b = el.querySelector("#hn");
    b.className = "msw" + (t3h ? " on" : "");
    b.onclick = function () { t3h = !t3h; b.className = "msw" + (t3h ? " on" : ""); draw(); };
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load scores: ' + esc(e.message) + "</p>";
  }
};

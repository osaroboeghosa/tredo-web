function s3g(v, key) {
  if (v == null) return '<td class="na"></td>';
  var n = Math.round(Number(v)), r = Math.abs(n) / S3CFG.max[key];
  var l = r >= S3CFG.strong ? 2 : (r >= S3CFG.mild ? 1 : 0);
  var k = l === 0 ? "hz0" : (n > 0 ? "hp" : "hn") + l;
  return '<td class="' + k + '">' + (n > 0 ? "+" : "") + n + "</td>";
}

function s3v(x, k) {
  if (k === "abs") return Math.abs(Number(x.total));
  return x[k] == null ? -99 : Number(x[k]);
}

function s3row(x) {
  var f = Number(x.total), c = /Bull/.test(x.bias) ? "up" : /Bear/.test(x.bias) ? "down" : "muted";
  var h = '<tr><td class="pr"><a href="#/scan/' + esc(x.pair) + '">' + esc(x.pair) + "</a><small>" + esc(x.bias) + "</small></td>";
  h += '<td class="sc ' + c + '">' + (f > 0 ? "+" : "") + f + "</td>";
  S3G.forEach(function (g) { h += s3g(x[g[0]], g[0]); });
  T3S.forEach(function (n) { h += t3c(x[n[0]]); });
  return h + "</tr>";
}

function s3tab(f) {
  var h = '<div class="tw"><table class="ht"><thead><tr><th class="gh" colspan="2">Output</th><th class="gh" colspan="6">Group totals</th><th class="gh" colspan="15">Signals</th></tr><tr><th></th>';
  [["abs", "Score"]].concat(S3G, T3S).forEach(function (c) {
    h += '<th class="t2h" data-k="' + c[0] + '">' + c[1] + (s3k === c[0] ? (s3d < 0 ? " &#9660;" : " &#9650;") : "") + "</th>";
  });
  return h + "</tr></thead><tbody>" + f.map(s3row).join("") + "</tbody></table></div>";
}

PAGES.scores = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var d = await sb("scores_v3?select=as_of&order=as_of.desc&limit=1");
    if (!d.length) { el.innerHTML = '<h1>Scores</h1><p class="muted">No scores yet.</p>'; return; }
    var day = d[0].as_of;
    var cols = "pair,total,bias," + S3G.map(function (g) { return g[0]; }).concat(T3S.map(function (n) { return n[0]; })).join(",");
    var rows = await sb("scores_v3?select=" + cols + "&as_of=eq." + day + "&limit=100");
    var h = '<h1>Scores</h1><p class="muted sub">Group totals and every signal behind them. As of ' + esc(day) + ". Tap a heading to sort.</p>" + filtBar();
    h += '<div class="gx"><div class="gr"><span class="gl">Hide Neutral</span><button class="msw" id="hn" aria-label="Hide Neutral"><i></i></button></div></div><div id="res"></div>';
    h += '<p class="note">Each signal runs from -2 (red) to +2 (green). A group total is the sum of its signals, coloured by its share of the most it could reach. Macro is Growth plus Inflation plus Jobs. Blank means no data. Accuracy is not proven. Scores rank where to look first. They are not forecasts.</p>';
    el.innerHTML = h;
    var res = el.querySelector("#res");
    var draw = function () {
      var f = rows.filter(function (x) { return filtMatch(x.pair) && (!s3h || x.bias !== "Neutral"); });
      f.sort(function (a, b) { return (s3v(b, s3k) - s3v(a, s3k)) * (s3d < 0 ? 1 : -1); });
      res.innerHTML = f.length ? s3tab(f) : filtEmpty();
    };
    res.addEventListener("click", function (e) {
      var t = e.target.closest(".t2h");
      if (!t) return;
      var k = t.getAttribute("data-k");
      if (k === s3k) s3d = -s3d; else { s3k = k; s3d = -1; }
      draw();
    });
    filtWire(el, draw);
    var b = el.querySelector("#hn");
    b.className = "msw" + (s3h ? " on" : "");
    b.onclick = function () { s3h = !s3h; b.className = "msw" + (s3h ? " on" : ""); draw(); };
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load scores: ' + esc(e.message) + "</p>";
  }
};

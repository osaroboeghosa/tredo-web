var T2S = [["Momentum", "Mom"], ["Trend", "Trend"], ["Season", "Season"], ["COT", "COT"], ["Retail", "Retail"], ["Rates", "Rates"], ["GDP", "GDP"], ["Retail Sales", "Sales"], ["CPI", "CPI"], ["UE", "UE"]];
var t2k = "abs", t2d = -1, t2h = false;

function t2td(v, lv) {
  if (v == null) return '<td class="na">n/a</td>';
  var n = Math.round(Number(v)), k = lv === 0 ? "hz0" : (n > 0 ? "hp" : "hn") + lv;
  return '<td class="' + k + '">' + (n > 0 ? "+" : "") + n + "</td>";
}

function t2s(v) { return t2td(v, v == null ? 0 : Math.min(2, Math.abs(Math.round(v)))); }

function t2c(v) { var a = v == null ? 0 : Math.abs(v); return t2td(v, a >= 50 ? 2 : a >= 15 ? 1 : 0); }

function t2v(x, k) {
  var d = x.detail || {};
  if (k === "abs") return Math.abs(Number(x.final));
  if (k.indexOf("s:") === 0) { var v = (d.signals || {})[k.slice(2)]; return v == null ? -99 : Number(v); }
  if (k === "vol") return d.vol20 == null ? -99 : Number(d.vol20);
  return x[k] == null ? -999 : Number(x[k]);
}

function t2row(x) {
  var d = x.detail || {}, g = d.signals || {}, f = Number(x.final);
  var c = Math.abs(f) < 15 ? "muted" : f > 0 ? "up" : "down";
  var h = '<tr><td class="pr"><a href="#/pair/' + esc(x.pair) + '">' + esc(x.pair) + "</a><small>" + esc(x.bias) + "</small></td>";
  h += '<td class="sc ' + c + '">' + (f > 0 ? "+" : "") + f + "</td>" + t2c(x.technical) + t2c(x.sentiment) + t2c(x.fundamentals);
  T2S.forEach(function (n) { h += t2s(g[n[0]] == null ? null : Number(g[n[0]])); });
  return h + '<td class="na">' + (d.vol20 == null ? "n/a" : d.vol20 + "%") + "</td></tr>";
}

function t2tab(f) {
  var hs = [["abs", "Score"], ["technical", "Tech"], ["sentiment", "Sent"], ["fundamentals", "Fund"]];
  T2S.forEach(function (n) { hs.push(["s:" + n[0], n[1]]); });
  hs.push(["vol", "Vol"]);
  var h = '<div class="tw"><table class="ht"><thead><tr><th></th><th></th><th class="gh" colspan="3">Categories</th><th class="gh" colspan="3">Technical</th><th class="gh" colspan="2">Sentiment</th><th class="gh" colspan="5">Fundamentals</th><th></th></tr><tr><th></th>';
  hs.forEach(function (c) {
    h += '<th class="t2h" data-k="' + c[0] + '">' + c[1] + (t2k === c[0] ? (t2d < 0 ? " &#9660;" : " &#9650;") : "") + "</th>";
  });
  return h + "</tr></thead><tbody>" + f.map(t2row).join("") + "</tbody></table></div>";
}

PAGES.scores = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var d = await sb("scores_v2?select=as_of&order=as_of.desc&limit=1");
    if (!d.length) { el.innerHTML = '<h1>Scores</h1><p class="muted">No scores yet.</p>'; return; }
    var day = d[0].as_of;
    var rows = await sb("scores_v2?select=pair,final,bias,technical,sentiment,fundamentals,detail&as_of=eq." + day + "&limit=100");
    var h = '<h1>Scores</h1><p class="muted sub">Every signal behind every score. As of ' + esc(day) + ". Tap a heading to sort.</p>" + filtBar();
    h += '<div class="gx"><div class="gr"><span class="gl">Hide Neutral</span><button class="msw" id="hn" aria-label="Hide Neutral"><i></i></button></div></div><div id="res"></div>';
    h += '<p class="note">Categories run from -100 to +100. Signals run from -2 (red) to +2 (green). Vol is the 20-day volatility. Scores rank where to look first. They are not forecasts.</p>';
    el.innerHTML = h;
    var res = el.querySelector("#res");
    var draw = function () {
      var f = rows.filter(function (x) { return filtMatch(x.pair) && (!t2h || x.bias !== "Neutral"); });
      f.sort(function (a, b) { return (t2v(b, t2k) - t2v(a, t2k)) * (t2d < 0 ? 1 : -1); });
      res.innerHTML = f.length ? t2tab(f) : filtEmpty();
    };
    res.addEventListener("click", function (e) {
      var t = e.target.closest(".t2h");
      if (!t) return;
      var k = t.getAttribute("data-k");
      if (k === t2k) t2d = -t2d; else { t2k = k; t2d = -1; }
      draw();
    });
    filtWire(el, draw);
    var b = el.querySelector("#hn");
    b.className = "msw" + (t2h ? " on" : "");
    b.onclick = function () { t2h = !t2h; b.className = "msw" + (t2h ? " on" : ""); draw(); };
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load scores: ' + esc(e.message) + "</p>";
  }
};

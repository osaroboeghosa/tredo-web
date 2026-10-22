function s3g(v, key) {
  if (v == null) return '<td class="na"></td>';
  var n = Math.round(Number(v)), r = Math.abs(n) / S3CFG.max[key];
  var l = r >= S3CFG.strong ? 2 : (r >= S3CFG.mild ? 1 : 0);
  var k = l === 0 ? "hz0" : (n > 0 ? "hp" : "hn") + l;
  return '<td class="' + k + '">' + (n > 0 ? "+" : "") + n + "</td>";
}

var s3m = false;

function s3lab(m) {
  if (m == null) return "";
  m = Number(m);
  return m >= 7 ? "Very Bullish" : m >= 4 ? "Bullish" : m >= -3 ? "Neutral" : m >= -6 ? "Bearish" : "Very Bearish";
}

function s3v(x, k) {
  if (k === "abs") return s3m ? (x.macro == null ? -99 : Math.abs(Number(x.macro))) : Math.abs(Number(x.total));
  return x[k] == null ? -99 : Number(x[k]);
}

function s3row(x) {
  var isA = x.asset != null;
  var nm = isA ? x.asset : x.pair;
  var lab = s3m ? s3lab(x.macro) : x.bias;
  var f = s3m ? Number(x.macro) : Number(x.total);
  var c = /Bull/.test(lab) ? "up" : /Bear/.test(lab) ? "down" : "muted";
  var h = "<tr><td class=\"pr\">" + (isA ? esc(nm) : '<a href="#/scan/' + esc(nm) + '">' + esc(nm) + "</a>") + "<small>" + esc(lab) + "</small></td>";
  h += isA && !s3m ? '<td class="na"></td>' : '<td class="sc ' + c + '">' + (f > 0 ? "+" : "") + f + "</td>";
  S3G.forEach(function (g) {
    h += isA && (g[0] === "technical" || g[0] === "sentiment") ? '<td class="na"></td>' : s3g(x[g[0]], g[0]);
  });
  T3S.forEach(function (n) { h += isA ? '<td class="na"></td>' : t3c(x[n[0]]); });
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
    var assets = [], aday = "";
    try {
      var ar = await sb("asset_scores?select=asset,as_of,growth,inflation,jobs,macro&order=as_of.desc&limit=20");
      if (ar.length) {
        aday = ar[0].as_of;
        assets = ar.filter(function (x) { return x.as_of === aday; });
      }
    } catch (e2) { assets = []; }
    var h = '<h1>Scores</h1><p class="muted sub">Group totals and every signal behind them. As of ' + esc(day) + ". Tap a heading to sort.</p>" + filtBar();
    h += '<div class="gx"><div class="gr"><span class="gl">Hide Neutral</span><button class="msw" id="hn" aria-label="Hide Neutral"><i></i></button></div>';
    h += '<div class="gr"><span class="gl">Macro only</span><span class="gs">Ranks by Growth + Inflation + Jobs and adds assets</span><button class="msw" id="mo" aria-label="Macro only"><i></i></button></div></div><div id="res"></div>';
    h += '<p class="note">Each signal runs from -2 (red) to +2 (green). A group total is the sum of its signals, coloured by its share of the most it could reach. Macro is Growth plus Inflation plus Jobs. Blank means no data. In Macro only, the label comes from the macro score alone (7 or more Very Bullish, 4 to 6 Bullish, -3 to 3 Neutral, -4 to -6 Bearish, -7 or lower Very Bearish) and assets show group totals only, when the filter is All. Accuracy is not proven. Scores rank where to look first. They are not forecasts.</p>';
    el.innerHTML = h;
    var res = el.querySelector("#res");
    var draw = function () {
      var base = s3m ? rows.concat(assets) : rows;
      var f = base.filter(function (x) {
        var nm = x.asset != null ? x.asset : x.pair;
        var ok = x.asset != null
          ? (FILT.mode === "all" && (!FILT.q || String(nm).toUpperCase().indexOf(FILT.q.toUpperCase()) !== -1))
          : filtMatch(nm);
        var lab = s3m ? s3lab(x.macro) : x.bias;
        return ok && (!s3h || lab !== "Neutral");
      });
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
    var m = el.querySelector("#mo");
    m.className = "msw" + (s3m ? " on" : "");
    m.onclick = function () {
      s3m = !s3m;
      s3k = s3m ? "macro" : "abs";
      s3d = -1;
      m.className = "msw" + (s3m ? " on" : "");
      draw();
    };
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load scores: ' + esc(e.message) + "</p>";
  }
};

/* tredo Intermarket Correlations (#/corr) - return correlation matrix from stored daily closes. */

var CORR_WIN = 60;
var CORR_MAJORS = ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "AUDUSD", "NZDUSD"];

function corrSeries(rows) {
  // rows are d desc; build ascending date->close and daily returns
  var arr = rows.slice().sort(function (a, b) { return a.d < b.d ? -1 : 1; });
  var out = {};
  for (var i = 1; i < arr.length; i++) {
    var p = Number(arr[i - 1].close), c = Number(arr[i].close);
    if (isFinite(p) && isFinite(c) && p) out[arr[i].d] = c / p - 1;
  }
  return out;
}

function pearson(a, b, n) {
  var dates = Object.keys(a).filter(function (d) { return b[d] != null; }).sort().slice(-n);
  if (dates.length < 12) return null;
  var sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0;
  dates.forEach(function (d) {
    var x = a[d], y = b[d];
    sx += x; sy += y; sxy += x * y; sxx += x * x; syy += y * y;
  });
  var k = dates.length;
  var num = k * sxy - sx * sy;
  var den = Math.sqrt((k * sxx - sx * sx) * (k * syy - sy * sy));
  return den ? num / den : null;
}

function corrCell(v) {
  if (v == null) return '<td class="cna">–</td>';
  var r = Math.round(v * 100);
  var cls = v > 0.25 ? "cpos" : v < -0.25 ? "cneg" : "cneu";
  var alpha = Math.min(0.55, Math.abs(v) * 0.62);
  return '<td class="c' + cls.replace("c", "") + '" style="background:rgba(' + (v > 0 ? "45,212,191" : "248,113,113") + ',' + alpha.toFixed(2) + ')">' + (v > 0 ? "+" : "") + v.toFixed(2) + "</td>";
}

PAGES.corr = function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  var cache = null;

  function draw() {
    if (!cache) return;
    var names = cache.names;
    var h = '<div class="pagehead"><div><div class="kicker">Intermarket</div><h1>Correlations</h1></div>' +
      '<span class="asof">' + (names.length > 7 ? names.length + " pairs" : "Majors") + "</span></div>" +
      '<p class="muted sub">Daily return correlation over the last ' + CORR_WIN + " days. Green means the pairs move together, red means they move opposite.</p>";
    h += '<div class="fbar">' +
      "<button class=\"fbtn" + (CORR_WIN === 30 ? " on" : "") + '" data-w="30">30 days</button>' +
      "<button class=\"fbtn" + (CORR_WIN === 60 ? " on" : "") + '" data-w="60">60 days</button>' +
      "<button class=\"fbtn" + (CORR_WIN === 90 ? " on" : "") + '" data-w="90">90 days</button>' +
      '<button class="fbtn" id="cscope">' + (names.length > 7 ? "Show majors" : "Show all pairs") + "</button></div>";

    var m = [];
    names.forEach(function (a) {
      m.push(names.map(function (b) {
        return a === b ? 1 : pearson(cache.s[a] || {}, cache.s[b] || {}, CORR_WIN);
      }));
    });
    h += '<div class="cwrap"><table class="ctab"><thead><tr><th></th>' + names.map(function (n) { return "<th>" + esc(n.slice(3)) + "</th>"; }).join("") + "</tr></thead><tbody>";
    names.forEach(function (n, i) {
      h += '<tr><th class="crh">' + esc(n) + "</th>" + m[i].map(corrCell).join("") + "</tr>";
    });
    h += "</tbody></table></div>";
    h += '<p class="note">Positive values mean the two pairs tended to move together over the window; negative means they moved apart. Correlation is measured, not predicted, and it drifts. Two heavily correlated positions are close to the same trade.</p>';
    el.innerHTML = h;

    el.querySelectorAll("[data-w]").forEach(function (b) {
      b.onclick = function () { CORR_WIN = Number(b.getAttribute("data-w")); draw(); };
    });
    var sc = el.querySelector("#cscope");
    sc.onclick = function () {
      cache.names = cache.names.length > 7 ? CORR_MAJORS.filter(function (p) { return cache.s[p]; }) : cache.all;
      draw();
    };
  }

  (async function () {
    try {
      var d = await sb("scores_v3?select=as_of&order=as_of.desc&limit=1");
      var all = [];
      if (d.length) {
        var pr = await sb("scores_v3?select=pair&as_of=eq." + d[0].as_of + "&limit=100");
        all = pr.map(function (x) { return x.pair; });
      }
      if (!all.length) all = CORR_MAJORS.concat(["EURGBP", "EURJPY", "GBPJPY", "AUDJPY", "EURAUD", "EURNZD", "EUCAD", "GBPCHF", "AUDNZD", "AUDCAD", "NZDJPY", "CADJPY"]);

      var results = await Promise.all(all.map(function (p) {
        return sb("prices?select=d,close&pair=eq." + encodeURIComponent(p) + "&order=d.desc&limit=95")
          .then(function (r) { return { p: p, s: corrSeries(r) }; })
          .catch(function () { return { p: p, s: {} }; });
      }));

      var s = {};
      results.forEach(function (r) { s[r.p] = r.s; });
      var withData = all.filter(function (p) { return Object.keys(s[p] || {}).length >= 12; });
      cache = { s: s, all: withData, names: CORR_MAJORS.filter(function (p) { return withData.indexOf(p) !== -1; }) };
      if (!cache.names.length) cache.names = withData.slice(0, 8);
      if (!cache.names.length) { el.innerHTML = "<h1>Correlations</h1><p class=\"muted\">Not enough price history yet.</p>"; return; }
      draw();
    } catch (e) {
      el.innerHTML = '<p class="down">Could not load correlations: ' + esc(e.message) + "</p>";
    }
  })();
};

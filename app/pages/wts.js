var WT_KEY = "tredo-weights";
var WT_DEF = { "Momentum": 1, "Rates": 1, "GDP": 1, "Retail Sales": 1, "CPI": 1, "UE": 1, "COT": 0, "Retail": 0, "Season": 0 };

function wtLoad() {
  var s = {};
  try { s = JSON.parse(localStorage.getItem(WT_KEY) || "{}") || {}; } catch (e) { s = {}; }
  var w = {};
  SIGS.forEach(function (n) {
    var v = s[n[0]];
    w[n[0]] = (typeof v === "number" && v >= 0 && v <= 3) ? v : WT_DEF[n[0]];
  });
  return w;
}

function wtSave(w) {
  try { localStorage.setItem(WT_KEY, JSON.stringify(w)); } catch (e) {}
}

function wtScore(m, w) {
  var a = 0, b = 0, n = 0;
  SIGS.forEach(function (x) {
    var v = m[x[0]], k = w[x[0]];
    if (v == null || !k) return;
    a += k * Number(v); b += k; n++;
  });
  return n < 3 ? null : Math.round(100 * a / (2 * b));
}

function wtCtl(n, v) {
  return '<button class="wb" data-s="' + n + '" data-d="-1">&minus;</button><b class="wn">' + v + '</b><button class="wb" data-s="' + n + '" data-d="1">+</button>';
}

function wtKey(x) { return x.c == null ? -1 : Math.abs(x.c); }

PAGES.weights = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var s = await sb("scores_latest?select=pair,score");
    var g = await sb("signals_latest?select=pair,name,value");
    var m = {}, w = wtLoad();
    g.forEach(function (r) {
      if (!m[r.pair]) m[r.pair] = {};
      m[r.pair][r.name] = r.value;
    });
    el.innerHTML = '<h1>Weights</h1><p class="muted sub">Your own ranking, on this phone only</p><h2>Signal weights</h2><div id="wg"></div><button class="wrs" id="wrs">Reset to default</button><h2>Ranking with your weights</h2><div id="res"></div>' +
      '<p class="note">Weight 0 turns a signal off. A score needs at least 3 signals with data. The default is 1 for the first six signals and 0 for the last three, which gives the published scores. Your weights are not tested and change nothing that is stored.</p>';
    var wg = el.querySelector("#wg"), res = el.querySelector("#res");
    var draw = function () {
      wg.innerHTML = gxg(SIGS.map(function (n) { return gxr(esc(n[0]), "", wtCtl(n[0], w[n[0]])); }));
      var r = s.map(function (x) { return { p: x.pair, o: Number(x.score), c: wtScore(m[x.pair] || {}, w) }; });
      r.sort(function (a, b) { return wtKey(b) - wtKey(a); });
      res.innerHTML = gxg(r.map(function (x) {
        var cls = (x.c == null || Math.abs(x.c) < 10) ? "muted" : (x.c > 0 ? "up" : "down");
        var v = x.c == null ? "n/a" : (x.c > 0 ? "+" : "") + x.c;
        return gxr('<a href="#/pair/' + esc(x.p) + '">' + esc(x.p) + '</a>', "Published " + (x.o > 0 ? "+" : "") + x.o, v, cls);
      }));
    };
    wg.onclick = function (e) {
      var t = e.target;
      if (t.className !== "wb") return;
      var n = t.getAttribute("data-s");
      w[n] = Math.max(0, Math.min(3, w[n] + Number(t.getAttribute("data-d"))));
      wtSave(w);
      draw();
    };
    el.querySelector("#wrs").onclick = function () {
      w = {};
      for (var k in WT_DEF) w[k] = WT_DEF[k];
      wtSave(w);
      draw();
    };
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load weights: ' + esc(e.message) + "</p>";
  }
};

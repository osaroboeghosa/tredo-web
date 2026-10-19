
var UC_MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ucNum(s) {
  if (s == null) return null;
  var m = String(s).replace(/,/g, "").match(/^(-?\d+(\.\d+)?)\s*([A-Za-z%]*)$/);
  return m ? { v: Number(m[1]), u: m[3] } : null;
}

function ucDate(ts) {
  var p = String(ts).slice(0, 10).split("-");
  return UC_MON[Number(p[1]) - 1] + " " + Number(p[2]);
}

function ucSg(v) { return (v > 0 ? "+" : "") + v; }

function ecTag(a, f) {
  if (!f || !f.forecast) return null;
  var u = a.unit === "%" ? "%" : "";
  var fv = ucNum(f.forecast);
  if (!fv || fv.u !== u) return null;
  var s = Math.round((Number(a.actual) - fv.v) * 100) / 100;
  var c = u ? ECFG.cutPct : ECFG.cutIdx;
  var m = Math.abs(s), k = m < c[0] ? 0 : (m >= c[1] ? 2 : 1);
  var d = s > 0 ? 1 : -1;
  if (ECFG.inverse.indexOf(a.title) >= 0) d = -d;
  return { s: s, v: k * d };
}

function ecRow(a, f) {
  var t = ecTag(a, f);
  var lab = "No forecast", cls = "", sur = "-";
  if (t) {
    lab = t.v >= 2 ? "Strong bullish" : t.v === 1 ? "Bullish" : t.v === 0 ? "Neutral" : t.v === -1 ? "Bearish" : "Strong bearish";
    cls = t.v > 0 ? "ecu" : (t.v < 0 ? "ecd" : "");
    sur = ucSg(t.s);
  }
  var act = esc(String(a.actual)) + (a.unit === "%" ? "%" : "");
  var h = '<div class="ecr"><div class="ect"><b>' + esc(a.title) + '</b><span class="muted">' + ucDate(a.release_ts) + "</span></div>";
  h += '<div class="ecn"><div><i>Actual</i><b>' + act + "</b></div>";
  h += "<div><i>Forecast</i><b>" + (f && f.forecast ? esc(f.forecast) : "-") + "</b></div>";
  h += "<div><i>Previous</i><b>" + (f && f.previous ? esc(f.previous) : "-") + "</b></div>";
  h += "<div><i>Surprise</i><b>" + sur + "</b></div></div>";
  h += '<div class="ecg ' + cls + '">' + lab + " for USD</div></div>";
  return { t: t, html: h };
}

PAGES.usecon = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var ac = await sb("release_actuals?select=title,release_ts,actual,unit&currency=eq.USD&order=release_ts.desc&limit=80");
    var rl = await sb("releases?select=title,release_ts,forecast,previous&currency=eq.USD&order=release_ts.desc&limit=400");
    var seen = {}, rows = [];
    ac.forEach(function (a) {
      if (rows.length >= ECFG.maxRows) return;
      if (seen[a.title] || a.actual == null || isNaN(Number(a.actual))) return;
      seen[a.title] = 1;
      var f = null;
      rl.forEach(function (r) {
        if (!f && r.title === a.title && String(r.release_ts).slice(0, 10) === String(a.release_ts).slice(0, 10)) f = r;
      });
      rows.push(ecRow(a, f));
    });
    var h = '<h1>US economy</h1><p class="muted sub">Latest releases against forecast</p>';
    if (!rows.length) {
      el.innerHTML = h + '<p class="muted">No releases yet.</p>';
      return;
    }
    var n = 0, sum = 0;
    rows.forEach(function (r) { if (r.t) { n++; sum += r.t.v; } });
    if (n) {
      var mean = sum / n;
      var word = mean >= ECFG.gauge ? "Leaning bullish" : (mean <= -ECFG.gauge ? "Leaning bearish" : "Mixed");
      var pos = Math.round((mean + 2) / 4 * 100);
      h += "<h2>USD reading</h2>" + '<div class="ecbx"><div class="ecbar"><div class="ecmk" style="left:' + pos + '%"></div></div>';
      h += '<div class="ecbl"><span>Bearish</span><b>' + word + "</b><span>Bullish</span></div>";
      h += '<p class="muted sub">Average of ' + n + " releases with a forecast</p></div>";
    }
    h += "<h2>Releases</h2>" + rows.map(function (r) { return r.html; }).join("");
    try {
      var sc = await sb("scores_v3?select=pair,as_of,total,bias&order=as_of.desc&limit=28");
      var d0 = sc.length ? sc[0].as_of : "";
      var us = sc.filter(function (p) { return p.as_of === d0 && p.pair.indexOf("USD") >= 0; });
      us.sort(function (x, y) { return y.total - x.total; });
      if (us.length) {
        h += "<h2>USD pairs ranked</h2>" + us.map(function (p) {
          var c = p.total > 0 ? "ecu" : (p.total < 0 ? "ecd" : "");
          return '<a class="ecp" href="#/scan/' + esc(p.pair) + '"><b>' + esc(p.pair) + '</b><span class="muted">' + esc(p.bias) + '</span><b class="' + c + '">' + ucSg(p.total) + "</b></a>";
        }).join("");
        h += '<p class="note">Pair scores combine every signal, not only these releases.</p>';
      }
    } catch (e2) {}
    h += '<p class="note">Surprise is the actual figure minus the forecast. A higher figure is read as bullish for the dollar, except unemployment and jobless claims. Releases without a stored forecast show no surprise. Figures can differ slightly from first-print values.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load US economy: ' + esc(e.message) + "</p>";
  }
};

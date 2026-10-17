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

function ucRow(a, f) {
  var fv = f ? ucNum(f.forecast) : null;
  var av = Number(a.actual);
  var s = (fv && fv.u !== "K" && fv.u !== "M" && fv.u !== "B") ? Math.round((av - fv.v) * 100) / 100 : null;
  var imp = s == null ? null : (s > 0 ? "Bullish" : (s < 0 ? "Bearish" : "Neutral"));
  var cls = imp === "Bullish" ? "up" : (imp === "Bearish" ? "down" : "muted");
  var sub = ucDate(a.release_ts);
  if (s != null) sub += " &middot; Surprise " + ucSg(s) + " &middot; " + imp + " for USD";
  if (f && f.forecast) sub += "<br>Forecast " + esc(f.forecast) + (f.previous ? " &middot; Previous " + esc(f.previous) : "");
  return { s: s, html: gxr(esc(a.title), sub, esc(String(a.actual)) + (a.unit === "%" ? "%" : ""), cls) };
}

PAGES.usecon = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var ac = await sb("release_actuals?select=title,release_ts,actual,unit&currency=eq.USD&order=release_ts.desc&limit=80");
    var rl = await sb("releases?select=title,release_ts,forecast,previous&currency=eq.USD&order=release_ts.desc&limit=400");
    var seen = {}, rows = [];
    ac.forEach(function (a) {
      if (seen[a.title] || a.actual == null || isNaN(Number(a.actual))) return;
      seen[a.title] = 1;
      var f = null;
      rl.forEach(function (r) {
        if (!f && r.title === a.title && String(r.release_ts).slice(0, 10) === String(a.release_ts).slice(0, 10)) f = r;
      });
      rows.push(ucRow(a, f));
    });
    var h = '<h1>US economy</h1><p class="muted sub">Latest releases against forecast</p>';
    if (!rows.length) {
      el.innerHTML = h + '<p class="muted">No releases yet.</p>';
      return;
    }
    var n = 0, b = 0;
    rows.forEach(function (r) {
      if (r.s != null) { n++; if (r.s > 0) b++; }
    });
    if (n) h += "<h2>Summary</h2>" + gxg([gxr("Beat the forecast", "Of releases with a forecast", b + " of " + n, b * 2 >= n ? "up" : "down")]);
    h += "<h2>Releases</h2>" + gxg(rows.map(function (r) { return r.html; }));
    h += '<p class="note">Surprise is the actual figure minus the forecast. A higher figure on these releases is read as bullish for the dollar. Releases without a stored forecast show no surprise. Figures can differ slightly from first-print values.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load US economy: ' + esc(e.message) + "</p>";
  }
};

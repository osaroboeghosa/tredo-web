function flowN(v) {
  return v == null ? "n/a" : Number(v).toLocaleString("en-US");
}

function flowSign(v) {
  return v == null || Number(v) === 0 ? "muted" : (Number(v) > 0 ? "up" : "down");
}

function flowBars(list) {
  var a = list.slice(0, 12).reverse();
  var mx = 1;
  a.forEach(function (x) { mx = Math.max(mx, Math.abs(Number(x.net))); });
  var s = '<svg class="fbars" viewBox="0 0 120 40" preserveAspectRatio="none">';
  s += '<line x1="0" y1="20" x2="120" y2="20" stroke="var(--line)" stroke-width="1"/>';
  a.forEach(function (x, i) {
    var v = Number(x.net);
    var h = Math.max(1, Math.abs(v) / mx * 18);
    var y = v >= 0 ? 20 - h : 20;
    var c = v >= 0 ? "var(--up)" : "var(--down)";
    s += '<rect x="' + (i * 10 + 1) + '" y="' + y.toFixed(1) + '" width="8" height="' + h.toFixed(1) + '" fill="' + c + '"/>';
  });
  return s + "</svg>";
}

function flowTag(p) {
  if (p == null) return ["n/a", "muted"];
  if (p >= 80) return ["Crowded long", "up"];
  if (p <= 20) return ["Crowded short", "down"];
  return ["Mid range", "muted"];
}

PAGES.flow = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var r = await sb("cot?select=currency,report_date,net,weekly_change,pct52&order=report_date.desc&limit=160");
    var g = {};
    r.forEach(function (x) {
      if (!g[x.currency]) g[x.currency] = [];
      g[x.currency].push(x);
    });
    var cur = Object.keys(g).map(function (k) { return g[k]; });
    cur.sort(function (a, b) {
      var p = a[0].pct52 == null ? -1 : Number(a[0].pct52);
      var q = b[0].pct52 == null ? -1 : Number(b[0].pct52);
      return q - p;
    });
    var h = '<h1>Flow</h1>';
    if (cur.length) h += '<p class="muted sub">Large speculator positioning. Report date ' + esc(cur[0][0].report_date) + '</p>';
    h += '<div class="grid">';
    cur.forEach(function (l) {
      var x = l[0];
      var p = x.pct52 == null ? null : Math.round(Number(x.pct52));
      var t = flowTag(p);
      h += '<div class="card fcard"><div class="frow"><span class="fcur">' + esc(x.currency) + '</span><span class="ftag ' + t[1] + '">' + t[0] + '</span></div>';
      h += flowBars(l);
      h += '<div class="fnum">Net <span class="' + flowSign(x.net) + '">' + flowN(x.net) + '</span></div>';
      h += '<div class="fnum">Week <span class="' + flowSign(x.weekly_change) + '">' + flowN(x.weekly_change) + '</span></div>';
      h += '<div class="fnum">52-week rank ' + (p == null ? "n/a" : p) + ' of 100</div></div>';
    });
    h += '</div>';
    h += '<p class="note">Bars show net positioning for the last 12 weeks, oldest on the left. 100 means the most bullish reading of the past 52 weeks.</p>';
    h += '<p class="note">Crowded means 80 or above, or 20 or below. It shows positioning, not a forecast. Our tests found no reliable edge from this data alone.</p>';
    h += '<p class="note">Data is released weekly, with a delay.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load flow: ' + esc(e.message) + '</p>';
  }
};

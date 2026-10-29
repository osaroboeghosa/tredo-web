var ryD = { "1Y": 365, "3Y": 1095 };
var ryK = "3Y";
var ryC = [["USD", "US_YIELD_2Y", "USD_CPI", "level", "#14b8a6"], ["EUR", "EUR_Y2", "EUR_CPI", "rate", "#2f5bea"], ["CAD", "CAD_Y2", "CAD_CPI", "level", "#f59e0b"]];
function ryQ(s, k) {
  return sb("raw_values?select=obs_date,value&series=eq." + s + "&key=eq." + k + "&order=obs_date.desc&limit=1000");
}
PAGES.realyield = async function (el) {
  el.innerHTML = "<h1>Real Yield History</h1><p>Loading...</p>";
  try {
    var jobs = [];
    ryC.forEach(function (c) { jobs.push(ryQ(c[1], "level")); jobs.push(ryQ(c[2], c[3])); });
    var res = await Promise.all(jobs);
    var data = ryC.map(function (c, i) {
      var y = res[i * 2] || [], p = res[i * 2 + 1] || [];
      var cm = {}, cy = {};
      p.forEach(function (x) { if (x.value != null) cm[String(x.obs_date).slice(0, 7)] = Number(x.value); });
      Object.keys(cm).forEach(function (m) {
        if (c[3] === "rate") { cy[m] = cm[m]; return; }
        var pm = (Number(m.slice(0, 4)) - 1) + m.slice(4);
        if (cm[pm]) cy[m] = (cm[m] / cm[pm] - 1) * 100;
      });
      var cms = Object.keys(cy).sort(), ym = {}, pts = [];
      y.forEach(function (x) {
        if (x.value == null) return;
        var d = String(x.obs_date).slice(0, 10), m = d.slice(0, 7);
        if (!ym[m] || d > ym[m].d) ym[m] = { d: d, v: Number(x.value) };
      });
      Object.keys(ym).sort().forEach(function (m) {
        var u = null;
        cms.forEach(function (k) { if (k < m) u = k; });
        if (u === null) return;
        pts.push({ m: m, d: ym[m].d, y: ym[m].v, c: cy[u], cm: u, r: ym[m].v - cy[u] });
      });
      return { n: c[0], col: c[4], pts: pts };
    });
    function draw() {
      var cut = new Date(Date.now() - ryD[ryK] * 864e5).toISOString().slice(0, 10);
      var S = data.map(function (s) { return { n: s.n, col: s.col, all: s.pts, pts: s.pts.filter(function (x) { return x.d >= cut; }) }; });
      var mm = {}, vals = [];
      S.forEach(function (s) { s.pts.forEach(function (x) { mm[x.m] = 1; vals.push(x.r); }); });
      var ms = Object.keys(mm).sort();
      if (ms.length < 2) { el.innerHTML = "<h1>Real Yield History</h1><p>No data yet.</p>"; return; }
      var W = 340, H = 190, L = 34, R = 6, T = 8, B = 20;
      var lo = Math.min(0, Math.min.apply(null, vals)), hi = Math.max(0, Math.max.apply(null, vals));
      if (hi - lo < 1) hi = lo + 1;
      var X = function (m) { return L + (W - L - R) * ms.indexOf(m) / (ms.length - 1); };
      var Y = function (v) { return T + (H - T - B) * (hi - v) / (hi - lo); };
      var t = 'fill="currentColor" opacity="0.6" font-size="10"';
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" class="chart">';
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="#8e8e93" stroke-dasharray="4 3"/>';
      S.forEach(function (q) {
        if (q.pts.length < 2) return;
        var d = q.pts.map(function (x, i) { return (i ? "L" : "M") + X(x.m).toFixed(1) + " " + Y(x.r).toFixed(1); }).join("");
        s += '<path d="' + d + '" fill="none" stroke="' + q.col + '" stroke-width="1.6"/>';
      });
      s += '<text x="2" y="' + (T + 8) + '" ' + t + ">" + hi.toFixed(1) + "</text>";
      s += '<text x="2" y="' + (Y(0) - 3) + '" ' + t + ">0</text>";
      if (lo < 0) s += '<text x="2" y="' + (H - B) + '" ' + t + ">" + lo.toFixed(1) + "</text>";
      s += '<text x="' + L + '" y="' + (H - 4) + '" ' + t + ">" + ms[0] + "</text>";
      s += '<text x="' + (W - R) + '" y="' + (H - 4) + '" text-anchor="end" ' + t + ">" + ms[ms.length - 1] + "</text></svg>";
      var h = "<h1>Real Yield History</h1>";
      h += '<p class="muted sub">2 year yield minus the latest known yearly inflation, month by month. Above zero means yields beat inflation.</p>';
      h += '<div class="fbar">';
      Object.keys(ryD).forEach(function (k) {
        var on = k === ryK;
        h += '<button class="fbtn' + (on ? " on" : "") + '" data-k="' + k + '">' + k + "</button>";
      });
      h += "</div>";
      h += '<div class="legend">';
      S.forEach(function (q) { h += '<span><i style="--c:' + q.col + '"></i>' + q.n + "</span>"; });
      h += "</div>" + s + "<h2>Latest</h2>";
      var rows = [];
      S.forEach(function (q) {
        var x = q.all[q.all.length - 1];
        if (!x) { rows.push(gxr(q.n, "", "n/a", "")); return; }
        rows.push(gxr(q.n, "2Y " + x.y.toFixed(2) + "% minus CPI " + x.c.toFixed(1) + "% (" + x.cm + ")", (x.r > 0 ? "+" : "") + x.r.toFixed(2) + "%", x.r < 0 ? "down" : "up"));
      });
      h += gxg(rows);
      h += '<p class="note">Uses the 2 year yield, not the policy rate, so it will not match Eco Strength. Each month uses the newest inflation reading from an earlier month. USD and CAD inflation is the change over 12 months of the index. AUD, GBP, JPY, CHF and NZD are left out for lack of history. This is context for the scores, not a forecast.</p>';
      el.innerHTML = h;
      el.querySelectorAll("button[data-k]").forEach(function (b) {
        b.onclick = function () { ryK = b.dataset.k; draw(); };
      });
    }
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load real yields: ' + esc(e.message) + "</p>";
  }
};

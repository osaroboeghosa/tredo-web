var ycD = { "6M": 182, "1Y": 365, "3Y": 1095, "Max": 99999 };
var ycK = "3Y";
PAGES.yieldcurve = async function (el) {
  el.innerHTML = "<h1>Yield curve</h1><p>Loading...</p>";
  var r = await sb("raw_values?select=obs_date,value&series=eq.US_YIELD_CURVE&key=eq.level&order=obs_date.desc&limit=1000");
  var all = (r || []).filter(function (x) { return x.value != null; }).map(function (x) { return { d: String(x.obs_date).slice(0, 10), v: Number(x.value) }; }).reverse();
  if (!all.length) { el.innerHTML = "<h1>Yield curve</h1><p>No data yet.</p>"; return; }
  function draw() {
    var cut = new Date(Date.now() - ycD[ycK] * 864e5).toISOString().slice(0, 10);
    var p = all.filter(function (x) { return x.d >= cut; });
    if (p.length < 2) p = all;
    var W = 340, H = 180, L = 34, R = 6, T = 8, B = 20;
    var lo = Math.min(0, Math.min.apply(null, p.map(function (x) { return x.v; })));
    var hi = Math.max(0, Math.max.apply(null, p.map(function (x) { return x.v; })));
    if (hi - lo < 0.5) hi = lo + 0.5;
    var X = function (i) { return L + (W - L - R) * i / (p.length - 1); };
    var Y = function (v) { return T + (H - T - B) * (hi - v) / (hi - lo); };
    var d = p.map(function (x, i) { return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(x.v).toFixed(1); }).join("");
    var z = Y(0);
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" class="chart">';
    s += '<defs><clipPath id="yca"><rect x="0" y="0" width="' + W + '" height="' + z + '"/></clipPath><clipPath id="ycb"><rect x="0" y="' + z + '" width="' + W + '" height="' + H + '"/></clipPath></defs>';
    s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + z + '" y2="' + z + '" stroke="#FF453A" stroke-dasharray="4 3"/>';
    s += '<path d="' + d + '" fill="none" stroke="var(--accent)" stroke-width="1.6" clip-path="url(#yca)"/>';
    s += '<path d="' + d + '" fill="none" stroke="#FF453A" stroke-width="1.6" clip-path="url(#ycb)"/>';
    var t = 'fill="currentColor" opacity="0.6" font-size="10"';
    s += '<text x="2" y="' + (T + 8) + '" ' + t + ">" + hi.toFixed(1) + "</text>";
    s += '<text x="2" y="' + (z - 3) + '" ' + t + ">0</text>";
    if (lo < 0) s += '<text x="2" y="' + (H - B) + '" ' + t + ">" + lo.toFixed(1) + "</text>";
    s += '<text x="' + L + '" y="' + (H - 4) + '" ' + t + ">" + p[0].d + "</text>";
    s += '<text x="' + (W - R) + '" y="' + (H - 4) + '" text-anchor="end" ' + t + ">" + p[p.length - 1].d + "</text></svg>";
    var last = p[p.length - 1], mn = p[0];
    p.forEach(function (x) { if (x.v < mn.v) mn = x; });
    var inv = p.filter(function (x) { return x.v < 0; }).length;
    var h = "<h1>Yield curve</h1>";
    h += '<p class="muted sub">US long-term minus short-term yield, daily. Red means inverted (below zero).</p>';
    h += '<div class="fbar">';
    Object.keys(ycD).forEach(function (k) {
      var on = k === ycK;
      h += '<button class="fbtn' + (on ? " on" : "") + '" data-k="' + k + '">' + k + "</button>";
    });
    h += "</div>" + s;
    h += "<h2>Summary</h2>" + gxg([
      gxr("Latest", last.d, last.v.toFixed(2) + "%", last.v < 0 ? "down" : "up"),
      gxr("Status", "", last.v < 0 ? "Inverted" : "Not inverted", last.v < 0 ? "down" : "up"),
      gxr("Lowest in range", mn.d, mn.v.toFixed(2) + "%", ""),
      gxr("Days inverted", "in this range", inv + " of " + p.length, "")
    ]);
    h += '<p class="note">Inversion has often come before slowdowns, but the timing varies. It is context, not a forecast.</p>';
    el.innerHTML = h;
    el.querySelectorAll("button[data-k]").forEach(function (b) {
      b.onclick = function () { ycK = b.dataset.k; draw(); };
    });
  }
  draw();
};

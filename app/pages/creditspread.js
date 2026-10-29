var csD = { "6M": 182, "1Y": 365, "3Y": 1095 };
var csK = "1Y";
PAGES.creditspread = async function (el) {
  el.innerHTML = "<h1>Credit Spreads</h1><p>Loading...</p>";
  var r = await sb("raw_values?select=obs_date,value&series=eq.US_HY_SPREAD&order=obs_date.desc&limit=1000");
  var all = (r || []).filter(function (x) { return x.value != null; }).map(function (x) { return { d: String(x.obs_date).slice(0, 10), v: Number(x.value) }; }).reverse();
  if (all.length < 2) { el.innerHTML = "<h1>Credit Spreads</h1><p>No data yet.</p>"; return; }
  var last = all[all.length - 1];
  function back(days) {
    var t = new Date(new Date(last.d).getTime() - days * 864e5).toISOString().slice(0, 10), f = null;
    all.forEach(function (x) { if (x.d <= t) f = x; });
    return f;
  }
  function chg(label, ref) {
    if (!ref) return gxr(label, "", "n/a", "");
    var c = last.v - ref.v;
    return gxr(label, "since " + ref.d, (c > 0 ? "+" : "") + c.toFixed(2), c > 0 ? "down" : c < 0 ? "up" : "");
  }
  var lo = all[0], hi = all[0], sum = 0;
  all.forEach(function (x) { if (x.v < lo.v) lo = x; if (x.v > hi.v) hi = x; sum += x.v; });
  var pos = hi.v > lo.v ? (last.v - lo.v) / (hi.v - lo.v) * 100 : 0;
  function draw() {
    var cut = new Date(Date.now() - csD[csK] * 864e5).toISOString().slice(0, 10);
    var p = all.filter(function (x) { return x.d >= cut; });
    if (p.length < 2) p = all;
    var W = 340, H = 180, L = 34, R = 6, T = 8, B = 20;
    var a = Math.min.apply(null, p.map(function (x) { return x.v; }));
    var b = Math.max.apply(null, p.map(function (x) { return x.v; }));
    if (b - a < 0.2) b = a + 0.2;
    var X = function (i) { return L + (W - L - R) * i / (p.length - 1); };
    var Y = function (v) { return T + (H - T - B) * (b - v) / (b - a); };
    var d = p.map(function (x, i) { return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(x.v).toFixed(1); }).join("");
    var t = 'fill="currentColor" opacity="0.6" font-size="10"';
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" class="chart">';
    s += '<path d="' + d + '" fill="none" stroke="var(--accent)" stroke-width="1.6"/>';
    s += '<text x="2" y="' + (T + 8) + '" ' + t + ">" + b.toFixed(2) + "</text>";
    s += '<text x="2" y="' + (H - B) + '" ' + t + ">" + a.toFixed(2) + "</text>";
    s += '<text x="' + L + '" y="' + (H - 4) + '" ' + t + ">" + p[0].d + "</text>";
    s += '<text x="' + (W - R) + '" y="' + (H - 4) + '" text-anchor="end" ' + t + ">" + p[p.length - 1].d + "</text></svg>";
    var h = "<h1>Credit Spreads</h1>";
    h += '<p class="muted sub">US high-yield credit spread, daily. A wider spread means more stress in credit markets.</p>';
    h += '<div class="fbar">';
    Object.keys(csD).forEach(function (k) {
      var on = k === csK;
      h += '<button class="fbtn' + (on ? " on" : "") + '" data-k="' + k + '">' + k + "</button>";
    });
    h += "</div>" + s + "<h2>Summary</h2>" + gxg([
      gxr("Latest", last.d, last.v.toFixed(2), ""),
      chg("1 day", all[all.length - 2]),
      chg("1 week", back(7)),
      chg("1 month", back(30)),
      gxr("Highest", hi.d, hi.v.toFixed(2), ""),
      gxr("Lowest", lo.d, lo.v.toFixed(2), ""),
      gxr("Average", "all " + all.length + " days", (sum / all.length).toFixed(2), ""),
      gxr("Position in range", "0 is the low, 100 the high", pos.toFixed(0), "")
    ]);
    h += '<p class="note">Red means the spread widened, green means it narrowed. The latest reading can lag by a day or two. This is context for the scores, not a forecast.</p>';
    el.innerHTML = h;
    el.querySelectorAll("button[data-k]").forEach(function (x) {
      x.onclick = function () { csK = x.dataset.k; draw(); };
    });
  }
  draw();
};

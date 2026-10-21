PAGES.marketmap = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var from = new Date(Date.now() - 12 * 864e5).toISOString().slice(0, 10);
    var r = await sb("prices?select=pair,d,close&d=gte." + from + "&order=d.desc&limit=1000");
    var m = {}, L = [], day = "";
    r.forEach(function (x) {
      if (!m[x.pair]) m[x.pair] = [];
      if (m[x.pair].length < 2) m[x.pair].push(x);
    });
    Object.keys(m).forEach(function (p) {
      var a = m[p];
      if (a.length < 2) return;
      var c = Number(a[0].close), q = Number(a[1].close);
      if (!isFinite(c) || !isFinite(q) || !q) return;
      if (a[0].d > day) day = a[0].d;
      L.push({ p: p, c: c, ch: c - q, pc: (c / q - 1) * 100 });
    });
    L.sort(function (a, b) { return b.pc - a.pc; });
    var mx = Math.max.apply(null, L.map(function (x) { return Math.abs(x.pc); })) || 1;
    var col = function (v) { return v > 0.005 ? "#34c759" : v < -0.005 ? "#e5534b" : "#8e8e93"; };
    var sg = function (v) { return v > 0 ? "+" : ""; };
    var h = '<h1>Market Heatmap</h1><p class="muted sub">1 day change of each currency pair' + (day ? ", latest close " + esc(day) : "") + ".</p>";
    if (!L.length) { el.innerHTML = h + '<p class="muted">No price data yet.</p>'; return; }
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0">';
    L.forEach(function (x) {
      var k = col(x.pc), d = x.p.slice(3) === "JPY" ? 3 : 4;
      h += '<div style="border:1px solid #374151;border-left:4px solid ' + k + ';border-radius:10px;padding:8px 10px">' +
        '<div style="font-size:12px;opacity:.7">' + esc(x.p) + '</div>' +
        '<div style="font-size:17px;font-weight:600">' + x.c.toFixed(d) + '</div>' +
        '<div style="font-size:12px;color:' + k + '">' + sg(x.ch) + x.ch.toFixed(d) + " &middot; " + sg(x.pc) + x.pc.toFixed(2) + "%</div></div>";
    });
    h += "</div><h2>Ranked by daily change</h2>";
    L.forEach(function (x) {
      var k = col(x.pc), w = Math.max(2, Math.abs(x.pc) / mx * 100);
      h += '<div style="display:flex;align-items:center;gap:8px;margin:5px 0;font-size:13px">' +
        '<span style="width:62px">' + esc(x.p) + '</span>' +
        '<span style="flex:1"><i style="display:block;height:10px;border-radius:5px;width:' + w.toFixed(1) + "%;background:" + k + '"></i></span>' +
        '<span style="width:58px;text-align:right;color:' + k + '">' + sg(x.pc) + x.pc.toFixed(2) + "%</span></div>";
    });
    h += '<p class="note">Change compares the latest close with the one before it. Currency pairs only. This is context for the scores, not a forecast.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the market heatmap: ' + esc(e.message) + "</p>";
  }
};

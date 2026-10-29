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
    var cls = function (v) { return v > 0.005 ? "pos" : v < -0.005 ? "neg" : "neu"; };
    var sg = function (v) { return v > 0 ? "+" : ""; };

    var h = '<div class="pagehead"><div><div class="kicker">Live market</div><h1>Market Heatmap</h1></div>' +
      '<span class="asof">' + (day ? esc(day) : "No data") + "</span></div>";
    h += '<p class="muted sub">1 day change of each currency pair' + (day ? ", latest close " + esc(day) : "") + ".</p>";
    if (!L.length) { el.innerHTML = h + '<p class="muted">No price data yet.</p>'; return; }

    h += '<div class="tilegrid">';
    L.forEach(function (x) {
      var k = cls(x.pc), d = x.p.slice(3) === "JPY" ? 3 : 4;
      h += '<div class="tile ' + k + '">' +
        '<div class="tp">' + esc(x.p) + "</div>" +
        '<div class="tv">' + x.c.toFixed(d) + "</div>" +
        '<div class="tc2">' + sg(x.ch) + x.ch.toFixed(d) + " &middot; " + sg(x.pc) + x.pc.toFixed(2) + "%</div></div>";
    });
    h += '</div><h2>Ranked by daily change</h2><div class="gx">';
    L.forEach(function (x, i) {
      var k = cls(x.pc), w = Math.max(2, Math.abs(x.pc) / mx * 100);
      h += '<div class="brow">' +
        '<span class="bnum">' + (i + 1) + "</span>" +
        '<span class="blab">' + esc(x.p) + "</span>" +
        '<span class="btrack"><i class="' + (k === "neg" ? "neg" : "pos") + '" style="left:0;width:' + w.toFixed(1) + '%"></i></span>' +
        '<span class="bval ' + (k === "pos" ? "up" : k === "neg" ? "down" : "muted") + '">' + sg(x.pc) + x.pc.toFixed(2) + "%</span></div>";
    });
    h += "</div>";
    h += '<p class="note">Change compares the latest close with the one before it. Currency pairs only. This is context for the scores, not a forecast.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the market heatmap: ' + esc(e.message) + "</p>";
  }
};

PAGES.surprise = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var r = await sb("heat_state_v?select=currency,ccy_impact");
    var C = ["USD", "EUR", "GBP", "JPY", "AUD", "NZD", "CAD", "CHF", "CNY"], m = {};
    C.forEach(function (c) { m[c] = { b: 0, r: 0 }; });
    r.forEach(function (x) {
      if (!m[x.currency]) return;
      if (x.ccy_impact === "Bullish") m[x.currency].b++;
      if (x.ccy_impact === "Bearish") m[x.currency].r++;
    });
    var list = C.map(function (c) {
      var n = m[c].b + m[c].r;
      return { c: c, b: m[c].b, n: n, p: n ? 100 * m[c].b / n : null };
    }).filter(function (x) { return x.n > 0; }).sort(function (a, b) { return b.p - a.p; });
    var h = '<h1>Eco Surprise Index</h1><p class="muted sub">Share of Bullish readings for each currency, strongest first.</p>';
    h += '<div class="gx">';
    list.forEach(function (x, i) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-top:1px solid #374151">';
      h += '<span style="width:18px;opacity:.6">' + (i + 1) + '</span>';
      h += '<span style="width:42px;font-weight:600">' + esc(x.c) + '</span>';
      h += '<div style="flex:1;min-width:0"><div style="height:8px;border-radius:4px;background:#e5534b;overflow:hidden"><div style="height:8px;width:' + x.p + '%;background:#2f5bea"></div></div>';
      h += '<div style="font-size:11px;opacity:.7;margin-top:3px">' + x.b + " of " + x.n + " readings Bullish</div></div>";
      h += '<span style="width:62px;text-align:right;font-weight:600">' + x.p.toFixed(1) + "%</span></div>";
    });
    h += "</div>";
    h += '<p class="note">Each currency\'s latest readings are counted as Bullish or Bearish against forecast. Neutral readings are left out. This is context for the scores, not a forecast.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the index: ' + esc(e.message) + "</p>";
  }
};

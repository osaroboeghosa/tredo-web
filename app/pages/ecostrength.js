PAGES.ecostrength = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var cb = await sb("central_banks?select=currency,policy_rate");
    var hs = await sb("heat_state_v?select=currency,a1_name,actual");
    var C = ["USD", "EUR", "GBP", "JPY", "AUD", "NZD", "CAD", "CHF"];
    var rate = {}, cpi = {};
    cb.forEach(function (k) { if (k.policy_rate != null) rate[k.currency] = Number(k.policy_rate); });
    hs.forEach(function (x) {
      if (x.actual == null || String(x.a1_name).toLowerCase().indexOf("cpi") < 0) return;
      if (cpi[x.currency] === undefined) cpi[x.currency] = Number(x.actual);
    });
    var list = C.map(function (c) {
      var r = rate[c], p = cpi[c];
      return { c: c, r: r, p: p, y: r != null && p != null ? r - p : null };
    }).sort(function (a, b) { return (b.y == null ? -99 : b.y) - (a.y == null ? -99 : a.y); });
    var f = function (v) { return v == null ? "n/a" : v.toFixed(2) + "%"; };
    var h = '<h1>Eco Strength</h1><p class="muted sub">Policy rate, inflation and real yield for each currency, ranked by real yield.</p>';
    h += '<div class="gx">';
    list.forEach(function (x, i) {
      var col = x.y == null ? "inherit" : x.y > 0 ? "#34c759" : x.y < 0 ? "#e5534b" : "inherit";
      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-top:1px solid #374151">';
      h += '<span style="width:18px;opacity:.6">' + (i + 1) + "</span>";
      h += '<span style="width:42px;font-weight:600">' + esc(x.c) + "</span>";
      h += '<div style="flex:1;min-width:0;font-size:12px;opacity:.8">Rate ' + f(x.r) + "<br>CPI " + f(x.p) + "</div>";
      h += '<span style="width:70px;text-align:right;font-weight:600;color:' + col + '">' + (x.y == null ? "n/a" : (x.y > 0 ? "+" : "") + x.y.toFixed(2) + "%") + "</span></div>";
    });
    h += "</div>";
    h += '<p class="note">Real yield here is the policy rate minus the latest CPI reading. Rates are updated by hand after each central bank meeting. This is context for the scores, not a forecast.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the page: ' + esc(e.message) + "</p>";
  }
};

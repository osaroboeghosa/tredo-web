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
    var mx = Math.max.apply(null, list.map(function (x) { return Math.abs(x.y || 0); })) || 1;

    var h = '<div class="pagehead"><div><div class="kicker">Real yields</div><h1>Eco Strength</h1></div><span class="asof">8 majors</span></div>';
    h += '<p class="muted sub">Policy rate, inflation and real yield for each currency, ranked by real yield.</p>';
    h += '<div class="gx">';
    list.forEach(function (x, i) {
      var w = x.y == null ? 0 : Math.min(50, Math.abs(x.y) / mx * 50);
      var left = x.y == null ? 50 : x.y >= 0 ? 50 : 50 - w;
      h += '<div class="brow">' +
        '<span class="bnum">' + (i + 1) + "</span>" +
        '<span class="blab">' + esc(x.c) + "</span>" +
        '<span><span class="btrack" style="display:block"><i class="' + (x.y != null && x.y < 0 ? "neg" : "pos") + '" style="left:' + left + '%;width:' + w + '%"></i></span>' +
        '<span class="bsub" style="display:block;margin-top:4px">Rate ' + f(x.r) + " &middot; CPI " + f(x.p) + "</span></span>" +
        '<span class="bval ' + (x.y == null ? "muted" : x.y > 0 ? "up" : x.y < 0 ? "down" : "muted") + '">' + (x.y == null ? "n/a" : (x.y > 0 ? "+" : "") + x.y.toFixed(2) + "%") + "</span></div>";
    });
    h += "</div>";
    h += '<p class="note">Real yield here is the policy rate minus the latest CPI reading. Rates are updated by hand after each central bank meeting. This is context for the scores, not a forecast.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the page: ' + esc(e.message) + "</p>";
  }
};

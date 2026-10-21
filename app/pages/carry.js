PAGES.carry = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var r = await sb("central_banks?select=currency,policy_rate");
    var ord = ["EUR", "GBP", "AUD", "NZD", "USD", "CAD", "CHF", "JPY"];
    var c = r.filter(function (k) { return k.policy_rate != null; }).map(function (k) { return { n: k.currency, v: Number(k.policy_rate) }; });
    var p = [];
    for (var i = 0; i < c.length; i++) {
      for (var j = i + 1; j < c.length; j++) {
        var a = c[i], b = c[j];
        if (a.v === b.v) continue;
        var hi = a.v > b.v ? a : b, lo = a.v > b.v ? b : a;
        var ih = ord.indexOf(hi.n), il = ord.indexOf(lo.n);
        var baseHi = (ih < 0 ? 99 : ih) < (il < 0 ? 99 : il);
        p.push({ hi: hi, lo: lo, d: hi.v - lo.v, base: baseHi ? hi : lo, quote: baseHi ? lo : hi, long: baseHi });
      }
    }
    p.sort(function (x, y) { return y.d - x.d; });
    var rows = p.map(function (x) {
      var sub = (x.long ? "Buy " : "Sell ") + x.base.n + "/" + x.quote.n + ": " + x.hi.n + " " + x.hi.v + "% vs " + x.lo.n + " " + x.lo.v + "%";
      return gxr(x.base.n + " / " + x.quote.n, sub, "+" + x.d.toFixed(2) + "%", "up");
    });
    var h = '<h1>Carry Trade Scanner</h1><p class="muted sub">Every pair ranked by policy rate difference. Hold the higher-rate currency, fund in the lower.</p>';
    h += gxg(rows);
    h += '<p class="note">Rate difference is only the carry. It says nothing about price direction or risk. Rates are updated by hand after each central bank meeting.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load carry: ' + esc(e.message) + "</p>";
  }
};

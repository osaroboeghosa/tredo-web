/* tredo Currency Strength (#/strength) - each currency scored from every pair score that contains it. */

var CCY = ["USD", "EUR", "GBP", "JPY", "AUD", "NZD", "CAD", "CHF"];

function stBars(rows) {
  var mx = Math.max.apply(null, rows.map(function (r) { return Math.abs(r.v); })) || 1;
  return rows.map(function (r) {
    var w = Math.abs(r.v) / mx * 50;
    var left = r.v >= 0 ? 50 : 50 - w;
    return '<div class="strrow">' +
      '<b class="strccy">' + esc(r.c) + "</b>" +
      '<span class="strbar"><i class="' + (r.v > 0 ? "pos" : r.v < 0 ? "neg" : "neu") + '" style="left:' + left + '%;width:' + w + '%"></i></span>' +
      '<span class="strval ' + (r.v > 0 ? "up" : r.v < 0 ? "down" : "muted") + '">' + (r.v > 0 ? "+" : "") + r.v.toFixed(1) + "</span>" +
      '<span class="strn muted">' + r.n + " pairs</span>" +
      "</div>";
  }).join("");
}

PAGES.strength = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var d = await sb("scores_v3?select=as_of&order=as_of.desc&limit=1");
    if (!d.length) { el.innerHTML = "<h1>Currency Strength</h1><p class=\"muted\">No scores yet.</p>"; return; }
    var day = d[0].as_of;
    var rows = await sb("scores_v3?select=pair,total,bias&as_of=eq." + day + "&limit=100");

    var acc = {};
    CCY.forEach(function (c) { acc[c] = { sum: 0, n: 0 }; });
    rows.forEach(function (x) {
      var p = String(x.pair), b = p.slice(0, 3), q = p.slice(3), t = Number(x.total);
      if (!isFinite(t) || !acc[b] || !acc[q]) return;
      acc[b].sum += t; acc[b].n++;
      acc[q].sum -= t; acc[q].n++;
    });

    var list = CCY.map(function (c) {
      var a = acc[c];
      return { c: c, v: a.n ? a.sum / a.n : 0, n: a.n };
    });
    list.sort(function (a, b) { return b.v - a.v; });

    // divergences: a pair moving against its base currency's strength
    var div = [];
    rows.forEach(function (x) {
      var p = String(x.pair), b = p.slice(0, 3), t = Number(x.total);
      var base = list.filter(function (r) { return r.c === b; })[0];
      if (!base || base.n < 3 || Math.abs(base.v) < 1.5) return;
      if (Math.sign(base.v) !== Math.sign(t) && Math.abs(t) >= 4) {
        div.push({ pair: p, base: b, bv: base.v, total: t, bias: x.bias });
      }
    });
    div.sort(function (a, b) { return Math.abs(b.total) - Math.abs(a.total); });

    var h = '<div class="pagehead"><div><div class="kicker">Relative value</div><h1>Currency Strength</h1></div>' +
      '<span class="asof">As of ' + esc(day) + "</span></div>" +
      '<p class="muted sub">Each currency is scored by averaging every pair score it appears in - positive when it is the base of a bullish pair, inverted when it is the quote.</p>';

    h += '<div class="strwrap"><div class="strhead"><span>Currency</span><span>Strength</span><span>Score</span><span>Coverage</span></div>' + stBars(list) + "</div>";
    h += '<div class="statsrow" style="grid-template-columns:repeat(2,1fr)">' +
      '<div class="stat"><span>Strongest</span><b class="up">' + esc(list[0].c) + " " + (list[0].v > 0 ? "+" : "") + list[0].v.toFixed(1) + "</b></div>" +
      '<div class="stat"><span>Weakest</span><b class="down">' + esc(list[list.length - 1].c) + " " + (list[list.length - 1].v > 0 ? "+" : "") + list[list.length - 1].v.toFixed(1) + "</b></div>" +
      "</div>";

    h += "<h2>Divergences</h2>";
    h += div.length
      ? '<div class="sl">' + div.slice(0, 8).map(function (x) {
          return '<a class="sr" href="#/pair/' + esc(x.pair) + '">' +
            '<div class="sm"><div class="sn">' + esc(x.pair) + '</div><div class="sd2">' + esc(x.bias) + " vs " + esc(x.base) + " strength</div></div>" +
            '<div class="dvg">' + esc(x.base) + " " + (x.bv > 0 ? "+" : "") + x.bv.toFixed(1) + '</div>' +
            '<div class="sv ' + (x.total > 0 ? "up" : "down") + '">' + tsN(x.total) + "</div>" +
            '<span class="sch">&#8250;</span></a>';
        }).join("") + "</div>"
      : '<p class="muted">No pair is moving against its currency strength right now.</p>';
    h += '<p class="note">A divergence flags a pair whose direction fights its own base currency. It is context for the score, not a reversal call.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load strength: ' + esc(e.message) + "</p>";
  }
};

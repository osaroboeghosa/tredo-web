var PSIG = ["Momentum", "Rates", "GDP", "Retail Sales", "CPI", "UE", "COT", "Retail", "Season"];

function ptext(n, d, c) {
  d = d || {};
  if (n === "Momentum") return d.z == null ? "" : "Trend strength z = " + pn(d.z);
  if (n === "Rates") {
    var a = c.banks[c.b], b = c.banks[c.q];
    var t = (a == null || b == null) ? "" : c.b + " " + pn(a) + "% vs " + c.q + " " + pn(b) + "%. ";
    return t + (d.diff == null ? "" : "Gap " + pn(d.diff));
  }
  if (n === "COT") return cotLine(c, d);
  if (n === "Retail") return d.long_pct == null ? "" : d.long_pct + "% of retail traders are long (read as contrarian)";
  if (n === "Season") return d.avg2y == null ? "" : "2Y avg " + pn(d.avg2y) + ", 5Y avg " + pn(d.avg5y);
  if (d.base_info && d.quote_info) return pfig(c.b, d.base_info, d.base) + ". " + pfig(c.q, d.quote_info, d.quote);
  if (d.base != null) return "Base step " + ps(d.base) + ", quote step " + ps(d.quote);
  return "";
}

PAGES.pair = async function (el, p) {
  if (!/^[A-Z]{6}$/.test(p || "")) {
    el.innerHTML = '<p class="muted">Pick a pair from <a href="#/scores">Scores</a>.</p>';
    return;
  }
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var b0 = p.slice(0, 3), q0 = p.slice(3);
    var r = await sb("scores_latest?pair=eq." + p + "&select=*");
    var g = await sb("signals_latest?pair=eq." + p + "&select=name,value,detail");
    var cb = await sb("central_banks?currency=in.(" + b0 + "," + q0 + ")&select=currency,policy_rate").catch(function () { return []; });
    var cot = await pairCot(b0, q0);
    if (!r.length) { el.innerHTML = '<p class="muted">No score for ' + esc(p) + ' yet.</p>'; return; }
    var x = r[0], sc = Number(x.score), m = {}, banks = {};
    g.forEach(function (s) { m[s.name] = s; });
    cb.forEach(function (k) { banks[k.currency] = k.policy_rate; });
    var c = { b: b0, q: q0, banks: banks, cot: cot };
    var lc = Math.abs(sc) < 10 ? "muted" : pc(sc);
    var h = '<p class="sub"><a href="#/scores">&larr; Scores</a></p>';
    h += '<div class="card ph">' + ring(sc) + '<div><div class="pname">' + esc(p) + '</div>';
    h += '<div class="plab ' + lc + '">' + esc(x.label) + '</div></div></div>';
    h += '<div class="badges"><span class="badge">Tier ' + esc(x.tier) + '</span>';
    h += '<span class="badge">' + esc(x.conviction) + ' conviction</span>';
    h += '<span class="badge">Data confidence: ' + esc(x.confidence) + '</span>';
    h += '<span class="badge">' + esc(x.band) + ' size</span></div>';
    h += '<p class="reason">' + esc(x.reason) + '</p>';
    h += '<p class="note">As of ' + esc(x.as_of) + '. ' + esc(x.aligned) + ' of 9 signals align with the headline. Headline uses ' + esc(x.n_headline) + ' of 6.</p>';
    h += '<h2>Blocks</h2><div class="strip">';
    var b = x.blocks || {};
    Object.keys(b).forEach(function (k) {
      var mn = b[k].mean;
      var cl = mn == null ? "muted" : (mn >= 0.5 ? "up" : (mn <= -0.5 ? "down" : "muted"));
      h += '<div class="card chip"><b>' + esc(k) + '</b><span class="' + cl + '">' + (mn == null ? "n/a" : ps(Number(mn).toFixed(2))) + '</span></div>';
    });
    h += '</div><p class="note">' + esc(x.agreement) + ' of 3 blocks match the headline.</p>';
    h += '<h2>Signals</h2>';
    PSIG.forEach(function (n) {
      var s = m[n], v = s ? s.value : null;
      h += '<div class="card srow"><div class="sh"><b>' + esc(n) + '</b><span class="sv ' + pc(v) + '">' + ps(v) + '</span></div>';
      h += '<p class="reason">' + esc(s ? ptext(n, s.detail, c) : "") + '</p></div>';
    });
    h += pairExtra(c, m);
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load ' + esc(p) + ': ' + esc(e.message) + '</p>';
  }
};

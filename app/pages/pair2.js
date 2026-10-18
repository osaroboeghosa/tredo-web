var P2C = [["Technical", "technical", ["Momentum", "Trend", "Season"]], ["Sentiment", "sentiment", ["COT", "Retail"]], ["Fundamentals", "fundamentals", ["Rates", "GDP", "Retail Sales", "CPI", "UE"]]];

function p2n(v) { return v == null ? "n/a" : (v > 0 ? "+" : "") + v; }

function p2c(v) { return v == null ? "muted" : v >= 15 ? "up" : v <= -15 ? "down" : "muted"; }

function p2sub(names, sig) {
  return names.map(function (n) { return n + " " + p2n(sig[n] == null ? null : Number(sig[n])); }).join(" · ");
}

function p2chart(h) {
  if (h.length < 2) return gxg([gxr("Score history", "Adds one point each day", "", "muted")]);
  var n = h.length;
  var pts = h.map(function (x, i) {
    return (i / (n - 1) * 300).toFixed(1) + "," + (40 - Number(x.final) / 100 * 36).toFixed(1);
  }).join(" ");
  return '<div class="gx gp"><b>Score history</b><svg class="p2l" viewBox="0 0 300 80" preserveAspectRatio="none"><line x1="0" y1="40" x2="300" y2="40" stroke="var(--line)"/><polyline fill="none" stroke="var(--accent)" stroke-width="2" points="' + pts + '"/></svg><div class="gs">' + esc(h[0].as_of) + " to " + esc(h[n - 1].as_of) + "</div></div>";
}

async function p2load(p) {
  var r = await sb("scores_v2?select=final,bias,technical,sentiment,fundamentals,detail,as_of&pair=eq." + p + "&order=as_of.desc&limit=1");
  if (!r.length) return '<h2>Scoring 2.0</h2><p class="note">No score yet.</p><h2>Version 1</h2>';
  var x = r[0], d = x.detail || {}, sig = d.signals || {}, f = Number(x.final);
  var h = await sb("scores_v2?select=as_of,final&pair=eq." + p + "&order=as_of&limit=120");
  var o = '<h2>Scoring 2.0</h2><div class="p2h">' + ring(f) + '<div class="p2b ' + p2c(f) + '">' + esc(x.bias) + "</div></div>";
  o += gxg(P2C.map(function (c) {
    var v = x[c[1]];
    v = v == null ? null : Number(v);
    return gxr(esc(c[0]), esc(p2sub(c[2], sig)), p2n(v), p2c(v));
  }));
  var ex = [], ma = d.ma || {}, ks = Object.keys(ma);
  if (ks.length) ex.push(gxr("Moving averages", esc(ks.map(function (k) { return k + ": " + ma[k]; }).join(" · ")), ""));
  if (d.vol20 != null) ex.push(gxr("Volatility", "20-day " + d.vol20 + "% · 1-year average " + (d.vol_avg == null ? "n/a" : d.vol_avg + "%"), ""));
  if (ex.length) o += "<h2>Technical detail</h2>" + gxg(ex);
  var w = d.weights;
  o += '<p class="note">Each category runs from -100 to +100. The numbers under it are its signals, from -2 to +2.' + (w ? " Final score: Technical " + Math.round(w.Technical * 100) + "%, Sentiment " + Math.round(w.Sentiment * 100) + "%, Fundamentals " + Math.round(w.Fundamentals * 100) + "%." : "") + "</p>";
  return o + p2chart(h) + "<h2>Version 1</h2>";
}

var p2Base = PAGES.pair;
PAGES.pair = async function (el, p) {
  await p2Base(el, p);
  var ph = el.querySelector(".ph");
  if (!ph) return;
  try {
    var h = await p2load(p);
    if (location.hash.indexOf(p) > -1) ph.insertAdjacentHTML("beforebegin", h);
  } catch (e) {
    if (location.hash.indexOf(p) > -1) ph.insertAdjacentHTML("beforebegin", '<p class="note">Could not load Scoring 2.0.</p>');
  }
};

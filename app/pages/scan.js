function scnN(v) { return v == null ? "n/a" : (v > 0 ? "+" : "") + v; }
function scnV(v) { return v == null ? null : Number(v); }
function scnC(v) { return v == null || v === 0 ? "muted" : v > 0 ? "up" : "down"; }
function scnT(s) { return s === "Bullish" ? "up" : s === "Bearish" ? "down" : "muted"; }
function scnF(v) { return v == null ? "n/a" : v + "%"; }
function scnR(l, s, v) { v = scnV(v); return gxr(l, s, scnN(v), scnC(v)); }

function scnG(t, n) {
  var C = 163.4, a = Math.min(1, Math.abs(t) / (2 * Math.max(n, 1))) * C;
  var col = t === 0 ? "var(--muted)" : t > 0 ? "var(--up)" : "var(--down)";
  return '<svg class="ring" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="var(--line)" stroke-width="6"/><circle cx="32" cy="32" r="26" fill="none" stroke="' + col + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + a.toFixed(1) + ' ' + C + '" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" font-size="16" font-weight="700" fill="var(--text)">' + scnN(t) + "</text></svg>";
}

function scnTop(x, t) {
  var h = "<h1>" + esc(x.pair) + '</h1><p class="muted sub">Data last updated ' + esc(x.as_of) + "</p>";
  h += '<div class="p2h">' + scnG(Number(x.total), x.n_signals) + '<div class="p2b ' + scnC(Number(x.total)) + '">' + esc(x.bias) + "</div></div>";
  if (!t) return h;
  var rows = [20, 50, 100, 200].map(function (n) {
    var s = t["sma" + n];
    return gxr(n + "-day average", "Price against its " + n + "-day average", s ? esc(s) : "n/a", scnT(s));
  });
  rows.push(gxr("Recent volatility", "Last 7 days against the 90-day norm", esc(t.vol || "n/a"), "muted"));
  rows.push(gxr("Average daily move", "7 days " + scnF(t.move7) + " · 90 days " + scnF(t.move90), ""));
  return h + "<h2>Technical levels</h2>" + gxg(rows);
}

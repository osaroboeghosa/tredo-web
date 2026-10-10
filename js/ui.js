function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dirClass(d) {
  if (d === "bullish") return "bull";
  if (d === "bearish") return "bear";
  return "neu";
}

function tierName(t) {
  if (t === 1) return "Tier 1 High Conviction";
  if (t === 2) return "Tier 2 Watch";
  return "Tier 3 Noise";
}

function fmtScore(n) {
  if (n == null) return "n/a";
  return (n > 0 ? "+" : "") + n;
}

function fmtVal(n) {
  if (n == null) return "n/a";
  var r = Math.round(Number(n));
  return (r > 0 ? "+" : "") + r;
}

function signClass(n) {
  if (n == null) return "neu";
  if (n > 0) return "bull";
  if (n < 0) return "bear";
  return "neu";
}

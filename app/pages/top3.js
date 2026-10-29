var T3S = [["trend", "Trend"], ["season", "Season"], ["cot", "COT"], ["crowd", "Crowd"], ["gdp", "GDP"], ["retail_sales", "Sales"], ["consumer", "Consumer"], ["cpi", "CPI"], ["rates", "Rates"], ["ppi", "PPI"], ["pce", "PCE"], ["unemp", "Unemp"], ["nfp", "NFP"], ["claims", "Claims"], ["jolts", "JOLTS"]];
var T3G = [["Technical", 2], ["Sentiment", 2], ["Growth", 3], ["Inflation", 4], ["Jobs", 4]];
var t3k = "abs", t3d = -1, t3h = false;

function t3c(v) {
  if (v == null) return '<td class="na"></td>';
  var n = Math.round(Number(v)), k = n === 0 ? "hz0" : (n > 0 ? "hp" : "hn") + Math.min(2, Math.abs(n));
  return '<td class="' + k + '">' + (n > 0 ? "+" : "") + n + "</td>";
}

function t3v(x, k) {
  if (k === "abs") return Math.abs(Number(x.total));
  return x[k] == null ? -99 : Number(x[k]);
}

function t3row(x) {
  var f = Number(x.total), c = /Bull/.test(x.bias) ? "up" : /Bear/.test(x.bias) ? "down" : "muted";
  var h = '<tr><td class="pr"><a href="#/scan/' + esc(x.pair) + '">' + esc(x.pair) + "</a><small>" + esc(x.bias) + "</small></td>";
  h += '<td class="sc ' + c + '">' + (f > 0 ? "+" : "") + f + "</td>";
  T3S.forEach(function (n) { h += t3c(x[n[0]]); });
  return h + "</tr>";
}

function t3tab(f) {
  var h = '<div class="tw"><table class="ht"><thead><tr><th class="gh" colspan="2">Output</th>';
  T3G.forEach(function (g) { h += '<th class="gh" colspan="' + g[1] + '">' + g[0] + "</th>"; });
  h += "</tr><tr><th></th>";
  [["abs", "Score"]].concat(T3S).forEach(function (c) {
    h += '<th class="t2h" data-k="' + c[0] + '">' + c[1] + (t3k === c[0] ? (t3d < 0 ? " &#9660;" : " &#9650;") : "") + "</th>";
  });
  return h + "</tr></thead><tbody>" + f.map(t3row).join("") + "</tbody></table></div>";
}

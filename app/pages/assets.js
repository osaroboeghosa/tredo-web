var ASN = {SPX500: "S&P 500", RUSSELL: "Russell 2000", USOIL: "US Oil", GOLD: "Gold", SILVER: "Silver"};

function asChip(v) {
  var c = v == null ? "#4b5563" : v > 0 ? "#2f5bea" : v < 0 ? "#e5534b" : "#4b5563";
  var t = v == null ? "n/a" : (v > 0 ? "+" : "") + v;
  return '<span style="display:inline-block;min-width:34px;padding:2px 6px;border-radius:6px;background:' + c + ';color:#fff;text-align:center">' + t + "</span>";
}

PAGES.assets = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var all = await sb("asset_scores?select=asset,as_of,growth,inflation,jobs,macro&order=as_of.desc,asset.asc&limit=50");
    var h = "<h1>Asset Scorecard</h1>";
    h += '<p class="muted sub">Macro readings for indices, oil, gold and silver. Technical, positioning and sentiment are not included yet.</p>';
    if (!all.length) {
      h += '<p class="muted">No data yet.</p>';
    } else {
      var d = all[0].as_of;
      var rows = all.filter(function (x) { return x.as_of === d; });
      var P = "padding:8px 4px;white-space:nowrap";
      h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">';
      h += '<tr style="text-align:left;opacity:.7"><th style="' + P + '">Asset</th><th style="' + P + '">Growth</th><th style="' + P + '">Infl.</th><th style="' + P + '">Jobs</th><th style="' + P + '">Macro</th></tr>';
      rows.forEach(function (x) {
        h += '<tr style="border-top:1px solid #374151"><td style="' + P + '">' + esc(ASN[x.asset] || x.asset) + "</td>";
        h += '<td style="' + P + '">' + asChip(x.growth) + '</td><td style="' + P + '">' + asChip(x.inflation) + '</td><td style="' + P + '">' + asChip(x.jobs) + '</td><td style="' + P + '">' + asChip(x.macro) + "</td></tr>";
      });
      h += "</table></div>";
      h += '<p class="note">Macro is Growth plus Inflation plus Jobs, as of ' + esc(String(d)) + ". Each row counts +1 for a Bullish reading and -1 for a Bearish one.</p>";
    }
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the scorecard: ' + esc(e.message) + "</p>";
  }
};

var ASN = {SPX500: "S&P 500", RUSSELL: "Russell 2000", USOIL: "US Oil", GOLD: "Gold", SILVER: "Silver"};

function asChip(v) {
  var k = v == null ? "neu" : v > 0 ? "pos" : v < 0 ? "neg" : "neu";
  var t = v == null ? "n/a" : (v > 0 ? "+" : "") + v;
  return '<span class="chip ' + k + '">' + t + "</span>";
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
      h += '<div class="tw2"><table class="dtable"><thead><tr><th>Asset</th><th>Growth</th><th>Inflation</th><th>Jobs</th><th>Macro</th></tr></thead><tbody>';
      rows.forEach(function (x) {
        h += '<tr><td class="name">' + esc(ASN[x.asset] || x.asset) + "</td>" +
          "<td>" + asChip(x.growth) + "</td><td>" + asChip(x.inflation) + "</td>" +
          "<td>" + asChip(x.jobs) + "</td><td>" + asChip(x.macro) + "</td></tr>";
      });
      h += "</tbody></table></div>";
      h += '<p class="note">Macro is Growth plus Inflation plus Jobs, as of ' + esc(String(d)) + ". Each row counts +1 for a Bullish reading and -1 for a Bearish one.</p>";
    }
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the scorecard: ' + esc(e.message) + "</p>";
  }
};

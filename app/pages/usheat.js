var UHS = {Bullish: "Bull", Bearish: "Bear", Neutral: "Neut"};

function uhChip(v) {
  var k = v || "Neutral";
  var cls = k === "Bullish" ? "pos" : k === "Bearish" ? "neg" : "neu";
  return '<span class="chip ' + cls + '">' + esc(UHS[k] || "Neut") + "</span>";
}

function uhNum(v, d) {
  if (v == null) return "n/a";
  return Number(v).toFixed(d);
}

function uhGauge(label, pct) {
  var p = pct == null ? null : Number(pct);
  var w = p == null ? 0 : Math.max(0, Math.min(100, p));
  return '<div class="gauge"><div class="gl2">' + esc(label) + "</div>" +
    '<div class="gv2">' + (p == null ? "n/a" : p.toFixed(2) + "%") + "</div>" +
    '<div class="gtrack"><i style="width:' + w + '%"></i></div></div>';
}

PAGES.usheat = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var rows = await sb("us_heatmap_latest_v?select=row_order,a1_name,release_ts,actual,forecast,previous,surprise,usd_impact,stocks_impact&order=row_order.asc");
    var g = await sb("us_heatmap_gauge_v?select=usd_pct,stocks_pct,rows_used");
    var gg = g.length ? g[0] : {};
    var h = "<h1>US Economic Heatmap</h1>";
    h += '<p class="muted sub">Latest release of each US indicator: actual against forecast, and what it means for the dollar and for stocks.</p>';
    h += '<div class="gauges">' + uhGauge("USD impact", gg.usd_pct) + uhGauge("US stocks impact", gg.stocks_pct) + "</div>";
    if (!rows.length) {
      h += '<p class="muted">No releases with both an actual and a forecast yet.</p>';
    } else {
      h += '<div class="tw2"><table class="dtable"><thead><tr><th>Economic data</th><th>Date</th><th>Surprise</th><th>Actual</th><th>Forecast</th><th>Previous</th><th>USD</th><th>Stocks</th></tr></thead><tbody>';
      rows.forEach(function (x) {
        var n = x.surprise == null ? null : Number(x.surprise);
        h += "<tr><td class=\"name\">" + esc(x.a1_name) + "</td>" +
          "<td>" + esc(String(x.release_ts).slice(5, 10)) + "</td>" +
          "<td><span class=\"chip " + (n == null ? "neu" : n > 0 ? "pos" : n < 0 ? "neg" : "neu") + '">' + uhNum(x.surprise, 2) + "</span></td>" +
          "<td class=\"num\">" + uhNum(x.actual, 1) + "</td>" +
          "<td class=\"num\">" + uhNum(x.forecast, 1) + "</td>" +
          "<td class=\"num\">" + uhNum(x.previous, 1) + "</td>" +
          "<td>" + uhChip(x.usd_impact) + "</td>" +
          "<td>" + uhChip(x.stocks_impact) + "</td></tr>";
      });
      h += "</tbody></table></div>";
    }
    h += '<p class="note">Surprise is actual minus forecast. The gauges show the share of Bullish readings among Bullish and Bearish ones, neutral readings left out.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the US heatmap: ' + esc(e.message) + "</p>";
  }
};

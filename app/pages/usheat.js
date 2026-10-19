var UHC = {Bullish: "#2f5bea", Bearish: "#e5534b", Neutral: "#4b5563"};

function uhChip(v) {
  var k = v || "Neutral";
  var c = UHC[k] || UHC.Neutral;
  return '<span style="display:inline-block;min-width:64px;padding:3px 8px;border-radius:6px;background:' + c + ';color:#fff;font-size:12px;text-align:center">' + esc(k) + "</span>";
}

function uhNum(v, d) {
  if (v == null) return "n/a";
  return Number(v).toFixed(d);
}

function uhGauge(label, pct) {
  var p = pct == null ? null : Number(pct);
  var w = p == null ? 0 : Math.max(0, Math.min(100, p));
  var h = '<div style="flex:1;min-width:140px;padding:10px;border-radius:10px;border:1px solid #374151">';
  h += '<div style="font-size:12px;opacity:.7">' + esc(label) + "</div>";
  h += '<div style="font-size:24px;font-weight:600;margin:4px 0">' + (p == null ? "n/a" : p.toFixed(2) + "%") + "</div>";
  h += '<div style="height:8px;border-radius:4px;background:' + UHC.Bearish + ';overflow:hidden"><div style="height:8px;width:' + w + "%;background:" + UHC.Bullish + '"></div></div>';
  return h + "</div>";
}

PAGES.usheat = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var rows = await sb("us_heatmap_latest_v?select=row_order,a1_name,release_ts,actual,forecast,previous,surprise,usd_impact,stocks_impact&order=row_order.asc");
    var g = await sb("us_heatmap_gauge_v?select=usd_pct,stocks_pct,rows_used");
    var gg = g.length ? g[0] : {};
    var h = '<h1>US Economic Heatmap</h1>';
    h += '<p class="muted sub">Latest release of each US indicator: actual against forecast, and what it means for the dollar and for stocks.</p>';
    h += '<div style="display:flex;gap:10px;margin:12px 0">' + uhGauge("USD impact", gg.usd_pct) + uhGauge("US stocks impact", gg.stocks_pct) + "</div>";
    if (!rows.length) {
      h += '<p class="muted">No releases with both an actual and a forecast yet.</p>';
    } else {
      h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">';
      h += '<tr style="text-align:left;opacity:.7"><th style="padding:6px">Economic data</th><th style="padding:6px">Date</th><th style="padding:6px">Surprise</th><th style="padding:6px">Actual</th><th style="padding:6px">Forecast</th><th style="padding:6px">Previous</th><th style="padding:6px">USD</th><th style="padding:6px">Stocks</th></tr>';
      rows.forEach(function (x) {
        var c = UHC[x.usd_impact] || UHC.Neutral;
        h += '<tr style="border-top:1px solid #374151">';
        h += '<td style="padding:8px 6px">' + esc(x.a1_name) + "</td>";
        h += '<td style="padding:8px 6px">' + esc(String(x.release_ts).slice(0, 10)) + "</td>";
        h += '<td style="padding:8px 6px"><span style="padding:2px 8px;border-radius:6px;background:' + c + ';color:#fff">' + uhNum(x.surprise, 2) + "</span></td>";
        h += '<td style="padding:8px 6px">' + uhNum(x.actual, 1) + "</td>";
        h += '<td style="padding:8px 6px">' + uhNum(x.forecast, 1) + "</td>";
        h += '<td style="padding:8px 6px">' + uhNum(x.previous, 1) + "</td>";
        h += '<td style="padding:8px 6px">' + uhChip(x.usd_impact) + "</td>";
        h += '<td style="padding:8px 6px">' + uhChip(x.stocks_impact) + "</td></tr>";
      });
      h += "</table></div>";
    }
    h += '<p class="note">Surprise is actual minus forecast. The gauges show the share of Bullish readings among Bullish and Bearish ones, neutral readings left out.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the US heatmap: ' + esc(e.message) + "</p>";
  }
};

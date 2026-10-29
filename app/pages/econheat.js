var HZS = {Bullish: "Bull", Bearish: "Bear", Neutral: "Neut"};
var HZN = {USD: "US", EUR: "EU", GBP: "UK", JPY: "JP", CAD: "CA", AUD: "AU", NZD: "NZ", CHF: "CH", CNY: "CN"};

function hzChip(v) {
  var k = v || "Neutral";
  var cls = k === "Bullish" ? "pos" : k === "Bearish" ? "neg" : "neu";
  return '<span class="chip ' + cls + '">' + esc(HZS[k] || "Neut") + "</span>";
}

function hzVal(v) {
  if (v == null) return '<span class="muted">n/a</span>';
  var n = Number(v);
  return '<span class="chip ' + (n > 0 ? "pos" : n < 0 ? "neg" : "neu") + '">' + String(parseFloat(n.toFixed(2))) + "</span>";
}

function hzNum(v) {
  if (v == null) return "n/a";
  return String(parseFloat(Number(v).toFixed(2)));
}

function hzPct(rows, key) {
  var b = 0, r = 0;
  rows.forEach(function (x) {
    if (x[key] === "Bullish") b++;
    if (x[key] === "Bearish") r++;
  });
  return b + r ? (100 * b) / (b + r) : null;
}

function hzGauge(label, pct) {
  var p = pct == null ? null : Number(pct);
  var w = p == null ? 0 : Math.max(0, Math.min(100, p));
  return '<div class="gauge"><div class="gl2">' + esc(label) + "</div>" +
    '<div class="gv2">' + (p == null ? "n/a" : p.toFixed(2) + "%") + "</div>" +
    '<div class="gtrack"><i style="width:' + w + '%"></i></div></div>';
}

PAGES.econheat = async function (el, arg) {
  var cur = String(arg || "EUR").toUpperCase();
  var nm = HZN[cur] || cur;
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var q = "&currency=eq." + encodeURIComponent(cur);
    var rows = await sb("heat_state_v?select=row_order,a1_name,release_date,actual,forecast,previous,surprise,ccy_impact,stocks_impact" + q + "&order=row_order.asc");
    var h = "<h1>" + esc(nm) + " Economic Heatmap</h1>";
    h += '<p class="muted sub">Latest release of each indicator: actual against forecast, and what it means for the currency and for stocks.</p>';
    h += '<div class="gauges">' + hzGauge(cur + " impact", hzPct(rows, "ccy_impact")) + hzGauge("Stocks impact", hzPct(rows, "stocks_impact")) + "</div>";
    if (!rows.length) {
      h += '<p class="muted">No data for this currency yet.</p>';
    } else {
      h += '<div class="tw2"><table class="dtable"><thead><tr><th>Economic data</th><th>Date</th><th>Surprise</th><th>Actual</th><th>Forecast</th><th>Previous</th><th>' + esc(cur) + "</th><th>Stocks</th></tr></thead><tbody>";
      rows.forEach(function (x) {
        var d = x.release_date ? String(x.release_date).slice(5, 10) : "n/a";
        h += "<tr><td class=\"name\">" + esc(x.a1_name) + "</td>" +
          "<td>" + esc(d) + "</td>" +
          "<td>" + hzVal(x.surprise) + "</td>" +
          "<td class=\"num\">" + hzNum(x.actual) + "</td>" +
          "<td class=\"num\">" + hzNum(x.forecast) + "</td>" +
          "<td class=\"num\">" + hzNum(x.previous) + "</td>" +
          "<td>" + hzChip(x.ccy_impact) + "</td>" +
          "<td>" + hzChip(x.stocks_impact) + "</td></tr>";
      });
      h += "</tbody></table></div>";
    }
    h += '<p class="note">Surprise is actual minus forecast. The gauges show the share of Bullish readings among Bullish and Bearish ones, neutral readings left out.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the heatmap: ' + esc(e.message) + "</p>";
  }
};

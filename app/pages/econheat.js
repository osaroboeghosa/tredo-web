var HZC = {Bullish: "#2f5bea", Bearish: "#e5534b", Neutral: "#4b5563"};
var HZS = {Bullish: "Bull", Bearish: "Bear", Neutral: "Neut"};
var HZN = {USD: "US", EUR: "EU", GBP: "UK", JPY: "JP", CAD: "CA", AUD: "AU", NZD: "NZ", CHF: "CH", CNY: "CN"};
var HZP = "padding:7px 4px;white-space:nowrap";

function hzChip(v) {
  var k = v || "Neutral";
  var c = HZC[k] || HZC.Neutral;
  return '<span style="display:inline-block;min-width:38px;padding:2px 6px;border-radius:6px;background:' + c + ';color:#fff;font-size:11px;text-align:center">' + esc(HZS[k] || "Neut") + "</span>";
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
  var h = '<div style="flex:1;min-width:0;padding:10px;border-radius:10px;border:1px solid #374151">';
  h += '<div style="font-size:12px;opacity:.7">' + esc(label) + "</div>";
  h += '<div style="font-size:22px;font-weight:600;margin:4px 0">' + (p == null ? "n/a" : p.toFixed(2) + "%") + "</div>";
  h += '<div style="height:8px;border-radius:4px;background:' + HZC.Bearish + ';overflow:hidden"><div style="height:8px;width:' + w + "%;background:" + HZC.Bullish + '"></div></div>';
  return h + "</div>";
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
    h += '<div style="display:flex;gap:10px;margin:12px 0">' + hzGauge(cur + " impact", hzPct(rows, "ccy_impact")) + hzGauge("Stocks impact", hzPct(rows, "stocks_impact")) + "</div>";
    if (!rows.length) {
      h += '<p class="muted">No data for this currency yet.</p>';
    } else {
      var th = function (t) { return '<th style="' + HZP + '">' + t + "</th>"; };
      var td = function (t) { return '<td style="' + HZP + '">' + t + "</td>"; };
      h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">';
      h += '<tr style="text-align:left;opacity:.7">' + th("Economic data") + th("Date") + th("Surp.") + th("Actual") + th("Fcst") + th("Prev") + th(esc(cur)) + th("Stocks") + "</tr>";
      rows.forEach(function (x) {
        var c = HZC[x.ccy_impact] || HZC.Neutral;
        var d = x.release_date ? String(x.release_date).slice(5, 10) : "n/a";
        h += '<tr style="border-top:1px solid #374151">';
        h += '<td style="padding:7px 4px;min-width:84px">' + esc(x.a1_name) + "</td>";
        h += td(esc(d));
        h += td('<span style="padding:2px 6px;border-radius:6px;background:' + c + ';color:#fff">' + hzNum(x.surprise) + "</span>");
        h += td(hzNum(x.actual));
        h += td(hzNum(x.forecast));
        h += td(hzNum(x.previous));
        h += td(hzChip(x.ccy_impact));
        h += td(hzChip(x.stocks_impact)) + "</tr>";
      });
      h += "</table></div>";
    }
    h += '<p class="note">Surprise is actual minus forecast. The gauges show the share of Bullish readings among Bullish and Bearish ones, neutral readings left out.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the heatmap: ' + esc(e.message) + "</p>";
  }
};

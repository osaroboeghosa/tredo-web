var MCUR = ["USD","EUR","GBP","JPY","AUD","NZD","CAD","CHF"];
var MMET = [["GDP","GDP"],["RETAIL","Retail sales"],["CPI","CPI"],["UE","Unemployment"]];

function mcCls(v, inv) {
  if (v == null || Number(v) === 0) return "muted";
  var u = Number(v) > 0;
  if (inv) u = !u;
  return u ? "up" : "down";
}

function mcRow(rows, c, k, label) {
  var a = rows[c + "_" + k];
  if (!a || !a.length) return gxr(label, "", "n/a", "muted");
  var x = a[0], p = a[1], lv = x.key === "level";
  var f = function (o) {
    return lv ? Number(o.value).toLocaleString("en-US", { maximumFractionDigits: 1 }) : Number(o.value).toFixed(2) + "%";
  };
  var ch = null;
  if (p) {
    ch = lv ? (Number(x.value) / Number(p.value) - 1) * 100 : Number(x.value) - Number(p.value);
    ch = Math.round(ch * 100) / 100;
  }
  var t = ch == null ? "n/a" : (ch > 0 ? "+" : "") + ch.toFixed(2) + (lv ? "%" : " pt");
  return gxr(label, f(x) + " (" + esc(String(x.obs_date).slice(0, 7)) + ")" + (p ? " &middot; before " + f(p) : ""), t, mcCls(ch, k === "UE"));
}

function mcBank(k) {
  if (!k) return "";
  return gxr(esc(k.rate_label || "Policy rate"), esc(k.bank) + " &middot; next meeting " + esc(k.next_meeting || "n/a"), k.policy_rate == null ? "n/a" : Number(k.policy_rate) + "%");
}

PAGES.macro = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var ser = [];
    MCUR.forEach(function (c) { MMET.forEach(function (m) { ser.push(c + "_" + m[0]); }); });
    var r = await sb("raw_values?select=series,key,obs_date,value&series=in.(" + ser.join(",") + ")&order=obs_date.desc&limit=1000");
    var b = await sb("central_banks?select=currency,bank,policy_rate,rate_label,stance,trend,next_meeting");
    var rows = {}, bk = {};
    r.forEach(function (x) {
      if (!rows[x.series]) rows[x.series] = [];
      if (rows[x.series].length < 2) rows[x.series].push(x);
    });
    b.forEach(function (x) { bk[x.currency] = x; });
    var h = '<h1>Macro</h1><p class="muted sub">Latest economic readings and policy rate for each currency.</p>';
    MCUR.forEach(function (c) {
      var k = bk[c];
      var st = k && k.stance ? " &middot; " + esc(k.stance) + (k.trend ? ", " + esc(k.trend) : "") : "";
      var a = MMET.map(function (m) { return mcRow(rows, c, m[0], m[1]); });
      a.push(mcBank(k));
      h += "<h2>" + c + st + "</h2>" + gxg(a);
    });
    h += '<p class="note">Each change compares the latest release with the one before it. Index and level series show the percent change. Rate series show the change in percentage points.</p>';
    h += '<p class="note">For unemployment, a fall is shown in green. These readings feed the headline score, but a reading alone is not a forecast.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load macro: ' + esc(e.message) + "</p>";
  }
};

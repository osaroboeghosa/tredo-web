var HMC = ["USD","EUR","GBP","JPY","AUD","NZD","CAD","CHF"];
var HMM = [["GDP",0.2,0.5,0],["RETAIL",0.3,0.8,0],["CPI",0.1,0.3,0],["UE",0.1,0.3,1]];

function hmChg(a) {
  if (!a || a.length < 2) return null;
  var x = a[0], p = a[1];
  var c = x.key === "level" ? (Number(x.value) / Number(p.value) - 1) * 100 : Number(x.value) - Number(p.value);
  return isFinite(c) ? c : null;
}

function hmCell(v, m) {
  if (v == null) return '<div class="hmc hmn">n/a</div>';
  var s = m[3] ? -v : v, a = Math.abs(v);
  var k = a >= m[2] ? 2 : a >= m[1] ? 1 : 0;
  var c = k === 0 ? "hmz" : "hm" + (s > 0 ? "u" : "d") + k;
  return '<div class="hmc ' + c + '">' + (v > 0 ? "+" : "") + v.toFixed(2) + "</div>";
}

function hmStr(v) {
  if (v == null) return '<div class="hmc hmn">n/a</div>';
  var a = Math.abs(v), k = a >= 50 ? 2 : a >= 25 ? 1 : 0;
  var c = k === 0 ? "hmz" : "hm" + (v > 0 ? "u" : "d") + k;
  return '<div class="hmc hms ' + c + '">' + (v > 0 ? "+" : "") + Math.round(v) + "</div>";
}

PAGES.heatmap = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var ser = [];
    HMC.forEach(function (c) { HMM.forEach(function (m) { ser.push(c + "_" + m[0]); }); });
    var r = await sb("raw_values?select=series,key,obs_date,value&series=in.(" + ser.join(",") + ")&order=obs_date.desc&limit=1000");
    var cs = await sb("currency_strength?select=currency,as_of,value&order=as_of.desc&limit=100");
    var rows = {}, st = {}, day = "";
    r.forEach(function (x) {
      if (!rows[x.series]) rows[x.series] = [];
      if (rows[x.series].length < 2) rows[x.series].push(x);
    });
    cs.forEach(function (x) {
      if (st[x.currency] === undefined) { st[x.currency] = Number(x.value); if (!day) day = x.as_of; }
    });
    var list = HMC.slice().sort(function (a, b) {
      var p = st[a] === undefined ? -999 : st[a], q = st[b] === undefined ? -999 : st[b];
      return q - p;
    });
    var h = '<h1>Heatmap</h1><p class="muted sub">Change in each economic reading since the previous release' + (day ? ". Strength as of " + esc(day) : "") + ".</p>";
    h += '<div class="hmg"><div class="hmr"><div></div><div class="hmh">GDP</div><div class="hmh">Sales</div><div class="hmh">CPI</div><div class="hmh">Unemp</div><div class="hmh">Strength</div></div>';
    list.forEach(function (c) {
      h += '<div class="hmr"><div class="hmk">' + c + "</div>";
      HMM.forEach(function (m) { h += hmCell(hmChg(rows[c + "_" + m[0]]), m); });
      h += hmStr(st[c]) + "</div>";
    });
    h += "</div>";
    h += '<p class="note">GDP and Sales show the percent change since the previous release. CPI and Unemp show the change in percentage points. Green means the reading moved in the currency\'s favour, so a fall in unemployment is green. Darker means a bigger move.</p>';
    h += '<p class="note">Strength averages these readings from -100 to +100. Currencies are sorted strongest first. This is context for the scores, not a forecast.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the heatmap: ' + esc(e.message) + "</p>";
  }
};

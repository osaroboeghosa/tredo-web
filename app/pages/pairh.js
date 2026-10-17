var pkM = [["GDP", "Growth", 0.05, 0], ["RETAIL", "Retail sales", 0.1, 0], ["CPI", "Inflation", 0.05, 0], ["UE", "Jobs (unemployment)", 0.05, 1]];

function pkChg(a) {
  if (!a || a.length < 2) return null;
  var c = a[0].key === "level" ? (Number(a[0].value) / Number(a[1].value) - 1) * 100 : Number(a[0].value) - Number(a[1].value);
  return isFinite(c) ? { v: c, lv: a[0].key === "level" } : null;
}

function pkTxt(o) {
  return (o.v > 0 ? "+" : "") + o.v.toFixed(2) + (o.lv ? "%" : " pt");
}

function pkRow(label, b, q, ob, oq, tol, inv) {
  if (ob == null || oq == null) return gxr(esc(label), "", "n/a", "muted");
  var sub = esc(b.t + " " + b.s + " · " + q.t + " " + q.s);
  if (ob.lv !== oq.lv) return gxr(esc(label), sub, "Not comparable", "muted");
  var d = ob.v - oq.v;
  if (Math.abs(d) < tol) return gxr(esc(label), sub, "Even", "muted");
  var win = (inv ? -d : d) > 0;
  return gxr(esc(label), sub, win ? b.t + " ahead" : q.t + " ahead", win ? "up" : "down");
}

async function pkLoad(p) {
  var b = p.slice(0, 3), q = p.slice(3), ser = [];
  pkM.forEach(function (m) { ser.push(b + "_" + m[0], q + "_" + m[0]); });
  var res = await Promise.all(ser.map(function (s) {
    return sb("raw_values?select=series,key,obs_date,value&series=eq." + s + "&order=obs_date.desc&limit=2");
  }));
  var m = {};
  ser.forEach(function (s, i) { m[s] = res[i]; });
  var cb = await sb("central_banks?currency=in.(" + b + "," + q + ")&select=currency,policy_rate").catch(function () { return []; });
  var rt = {};
  cb.forEach(function (k) { rt[k.currency] = k.policy_rate == null ? null : Number(k.policy_rate); });
  var a = pkM.map(function (x) {
    var ob = pkChg(m[b + "_" + x[0]]), oq = pkChg(m[q + "_" + x[0]]);
    return pkRow(x[1], { t: b, s: ob ? pkTxt(ob) : "n/a" }, { t: q, s: oq ? pkTxt(oq) : "n/a" }, ob, oq, x[2], x[3]);
  });
  var rb = rt[b], rq = rt[q];
  if (rb != null && rq != null) {
    a.push(pkRow("Policy rate", { t: b, s: rb + "%" }, { t: q, s: rq + "%" }, { v: rb, lv: 0 }, { v: rq, lv: 0 }, 0.1, 0));
  }
  return '<h2>Head to head</h2>' + gxg(a) +
    '<p class="note">Green means ' + b + ' is ahead, red means ' + q + ' is ahead. Growth, sales, inflation and jobs compare the change since the previous release. Policy rate compares the level. Rows where the two currencies are measured differently say Not comparable. Context only, not a forecast.</p>';
}

var pkBase = PAGES.pair;
PAGES.pair = async function (el, p) {
  await pkBase(el, p);
  if (!el.querySelector(".ph")) return;
  try {
    var h = await pkLoad(p);
    if (location.hash.indexOf(p) > -1) el.insertAdjacentHTML("beforeend", h);
  } catch (e) {
    if (location.hash.indexOf(p) > -1) el.insertAdjacentHTML("beforeend", '<p class="note">Could not load head to head.</p>');
  }
};

var pmBase = PAGES.pair;
var PM_N = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function pmIs(m, cm) {
  if (Number(m) === cm) return true;
  return String(m).toLowerCase().slice(0, 3) === PM_N[cm - 1].toLowerCase().slice(0, 3);
}
function pmPct(v) {
  if (v === null || v === undefined || v === "") return '<span class="muted">no data</span>';
  var n = Number(v);
  return '<span class="' + (n > 0 ? "up" : n < 0 ? "down" : "") + '">' + (n > 0 ? "+" : "") + n.toFixed(2) + '%</span>';
}
async function pmLoad(p) {
  var cm = new Date().getUTCMonth() + 1;
  var r = await sb("seasonality?select=month,avg2y,avg5y,pattern,trend&pair=eq." + p);
  var x = null;
  r.forEach(function (q) { if (pmIs(q.month, cm)) x = q; });
  var h = '<h2>This month: ' + PM_N[cm - 1] + '</h2><div class="card">';
  if (!x) return h + '<div class="rtn"><span class="muted">None stored yet</span></div></div>';
  var pat = x.pattern;
  if (typeof pat === "string") { try { pat = JSON.parse(pat); } catch (e) { pat = []; } }
  pat = pat || [];
  var up = 0;
  pat.forEach(function (o) { if (Number(o.r) > 0) up++; });
  h += '<div class="rtn"><span>2-year average return</span>' + pmPct(x.avg2y) + '</div>';
  h += '<div class="rtn"><span>5-year average return</span>' + pmPct(x.avg5y) + '</div>';
  if (pat.length) h += '<div class="rtn"><span>Years with a rise</span><span>' + up + ' of ' + pat.length + '</span></div>';
  if (x.trend) h += '<div class="rtn"><span>Trend</span><span>' + esc(x.trend) + '</span></div>';
  return h + '</div><p class="note">Average return of this pair in the current calendar month. Context only.</p>';
}
PAGES.pair = async function (el, p) {
  await pmBase(el, p);
  if (!el.querySelector(".ph")) return;
  try {
    var h = await pmLoad(p);
    if (location.hash.indexOf(p) > -1) el.insertAdjacentHTML("beforeend", h);
  } catch (e) {
    if (location.hash.indexOf(p) > -1) el.insertAdjacentHTML("beforeend", '<p class="note">Could not load seasonality.</p>');
  }
};

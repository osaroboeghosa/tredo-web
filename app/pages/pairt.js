var ptBase = PAGES.pair;
var PT_S = {USD:["US_YIELD_2Y","2-year"],EUR:["EUR_Y2","2-year"],CAD:["CAD_Y2","2-year"],AUD:["AUD_Y2","2-year"],JPY:["JPY_Y2","2-year"],GBP:["GBP_Y2","2-year"],NZD:["NZD_Y10","10-year"],CHF:["CHF_Y10","10-year"]};
function ptD(s) { return new Date(s + "T00:00:00Z").getTime(); }
async function ptRow(c) {
  var s = PT_S[c];
  var r = await sb("raw_values?select=obs_date,value&series=eq." + s[0] + "&order=obs_date.desc&limit=60");
  var lab = c + " " + s[1] + " yield";
  if (!r || !r.length) return '<div class="rtn"><span>' + lab + '</span><span class="muted">no data</span></div>';
  var v = Number(r[0].value);
  var t = ptD(r[0].obs_date) - 28 * 864e5;
  var old = null;
  for (var i = 1; i < r.length; i++) { if (ptD(r[i].obs_date) <= t) { old = r[i]; break; } }
  var h = '<div class="rtn"><span>' + lab + '<br><small class="muted">' + esc(r[0].obs_date) + '</small></span><span>' + v.toFixed(2) + '%</span></div>';
  if (old) {
    var d = v - Number(old.value);
    h += '<div class="rtn"><span class="muted">Change since ' + esc(old.obs_date) + '</span><span class="' + (d > 0 ? "up" : d < 0 ? "down" : "") + '">' + (d > 0 ? "+" : "") + d.toFixed(2) + ' pp</span></div>';
  } else {
    h += '<div class="rtn"><span class="muted">Change over 4 weeks</span><span class="muted">not enough history</span></div>';
  }
  return h;
}
PAGES.pair = async function (el, p) {
  await ptBase(el, p);
  if (!el.querySelector(".ph")) return;
  try {
    var a = await ptRow(p.slice(0, 3));
    var b = await ptRow(p.slice(3, 6));
    var h = '<div class="card"><h2>Rate context</h2>' + a + b + '<p class="note">Yields are in percent. pp = percentage points. NZD and CHF show 10-year yields.</p></div>';
    if (location.hash.indexOf(p) > -1) el.insertAdjacentHTML("beforeend", h);
  } catch (e) {
    if (location.hash.indexOf(p) > -1) el.insertAdjacentHTML("beforeend", '<div class="card"><h2>Rate context</h2><p class="note">Could not load.</p></div>');
  }
};

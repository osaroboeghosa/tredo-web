function pvN(v) {
  v = Number(v);
  return (v > 0 ? "+" : "") + Math.round(v).toLocaleString("en-US");
}

function pvWord(p) {
  if (p >= 80) return "Near 52-week high";
  if (p <= 20) return "Near 52-week low";
  return "Mid-range";
}

function pvCard(c, x) {
  var p = Number(x.pct52), ex = p >= 80 || p <= 20;
  var h = '<div class="card"><div class="rtr"><b>' + esc(c) + '</b><span class="' + (ex ? "warn" : "muted") + '">' + pvWord(p) + '</span></div>';
  h += '<div class="rtbar"><i class="rtl" style="width:' + p + '%"></i><i class="rts" style="width:' + (100 - p) + '%"></i></div>';
  h += '<div class="rtn"><span>Position in 52-week range</span><span>' + Math.round(p) + '%</span></div>';
  h += '<div class="rtn"><span>Net position</span><span>' + pvN(x.net) + '</span></div>';
  h += '<div class="rtn"><span>Change, 1 week</span><span class="' + (x.weekly_change >= 0 ? "up" : "down") + '">' + pvN(x.weekly_change) + '</span></div>';
  h += '<div class="rtn"><span>Change, 4 weeks</span><span class="' + (x.chg_4w >= 0 ? "up" : "down") + '">' + pvN(x.chg_4w) + '</span></div>';
  h += '<div class="rtn"><span>Change, 13 weeks</span><span class="' + (x.chg_13w >= 0 ? "up" : "down") + '">' + pvN(x.chg_13w) + '</span></div>';
  return h + '<p class="note">Report of ' + esc(x.report_date) + '</p></div>';
}

async function pvLoad(cs) {
  var r = await sb("cot?currency=in.(" + cs.join(",") + ")&select=currency,report_date,net,weekly_change,pct52,chg_4w,chg_13w&order=report_date.desc&limit=6");
  var by = {};
  r.forEach(function (x) { if (!by[x.currency]) by[x.currency] = x; });
  var h = '<h2>Positioning extremes</h2>';
  cs.forEach(function (c) {
    if (by[c]) h += pvCard(c, by[c]);
  });
  return h + '<p class="note">Large trader positioning, compared with its own last 52 weeks. Readings near the top or bottom of the range are extremes. Context only.</p>';
}

var pvBase = PAGES.pair;
PAGES.pair = async function (el, p) {
  await pvBase(el, p);
  if (!el.querySelector(".ph")) return;
  try {
    var h = await pvLoad([p.slice(0, 3), p.slice(3)]);
    if (location.hash.indexOf(p) > -1) el.insertAdjacentHTML("beforeend", h);
  } catch (e) {
    el.insertAdjacentHTML("beforeend", '<p class="note">Could not load positioning extremes.</p>');
  }
};

var RTC = {s: "#e5534b", l: "#2f5bea", n: "#4b5563"};

function rtNum(v) {
  return String(parseFloat(Number(v).toFixed(2)));
}

function rtTag(p) {
  return p >= 60 ? RTC.s : p <= 40 ? RTC.l : RTC.n;
}

function rtSeg(w, c, t) {
  return '<div style="width:' + w + "%;background:" + c + ';display:flex;align-items:center;justify-content:flex-end;padding-right:4px;overflow:hidden">' + t + "%</div>";
}

function rtRow(x) {
  var p = Number(x.long_pct);
  var w = Math.max(0, Math.min(100, p));
  var h = '<div style="display:flex;align-items:center;gap:6px;margin:3px 0;font-size:11px">';
  h += '<span style="width:58px;padding:3px 0;text-align:center;border-radius:4px;background:' + rtTag(p) + ';color:#fff">' + esc(x.pair) + "</span>";
  h += '<div style="flex:1;display:flex;height:20px;border-radius:4px;overflow:hidden;color:#fff">';
  h += rtSeg(w, RTC.l, rtNum(p)) + rtSeg(100 - w, RTC.s, rtNum(100 - p));
  return h + "</div></div>";
}

PAGES.retail = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var all = await sb("retail?select=pair,long_pct,as_of&order=as_of.desc,long_pct.desc&limit=40");
    var d = all.length ? all[0].as_of : null;
    var rows = all.filter(function (x) { return x.as_of === d && x.long_pct != null; });
    var h = "<h1>Retail Sentiment</h1>";
    h += '<p class="muted sub">Share of retail traders long (blue) and short (red), read as a contrarian signal. As of ' + esc(d || "n/a") + ".</p>";
    h += '<p class="note">Label red: crowd 60% or more long. Label blue: 40% or less long. Grey: in between.</p>';
    h += rows.length ? rows.map(rtRow).join("") : '<p class="muted">No data yet.</p>';
    h += '<p class="note">Crowd positioning is a contrarian input, not a trade entry.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load retail sentiment: ' + esc(e.message) + "</p>";
  }
};

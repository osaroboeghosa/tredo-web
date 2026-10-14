function puNum(s) {
  if (s === null || s === undefined || s === "") return null;
  var m = String(s).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

function puRow(x, act) {
  var d = String(x.release_ts).slice(5, 10);
  var h = '<div class="rtn"><span>' + esc(x.currency) + ' ' + esc(x.title) + '</span><span>' + esc(d) + '</span></div>';
  var t = [];
  if (x.forecast) t.push("Forecast " + x.forecast);
  if (x.previous) t.push("previous " + x.previous);
  var tag = "";
  if (act) {
    t.push("actual " + act.actual + (act.unit && act.unit !== "%" ? " " + act.unit : act.unit || ""));
    var a = Number(act.actual), f = puNum(x.forecast);
    if (f !== null && isFinite(a)) {
      if (Math.abs(a - f) < 0.0001) tag = ' <span class="muted">In line</span>';
      else if (a > f) tag = ' <span class="up">Above forecast</span>';
      else tag = ' <span class="down">Below forecast</span>';
    }
  }
  if (t.length) h += '<div class="rtn"><span class="muted">' + esc(t.join(", ")) + '</span><span>' + tag + '</span></div>';
  return h;
}

async function puLoad(cs) {
  var now = new Date().toISOString();
  var cl = "currency=in.(" + cs.join(",") + ")";
  var r = await sb("releases?" + cl + "&impact=eq.High&release_ts=lte." + now + "&select=currency,title,release_ts,forecast,previous&order=release_ts.desc&limit=30");
  var a = await sb("release_actuals?" + cl + "&select=currency,title,release_ts,actual,unit&order=release_ts.desc&limit=40");
  var am = {};
  a.forEach(function (x) { am[x.currency + "|" + x.title + "|" + new Date(x.release_ts).getTime()] = x; });
  var seen = {}, rows = [];
  r.forEach(function (x) {
    var k = x.currency + "|" + x.title + "|" + new Date(x.release_ts).getTime();
    if (seen[k] || rows.length >= 6) return;
    seen[k] = 1;
    rows.push(puRow(x, am[k]));
  });
  var h = '<h2>Last releases</h2><div class="card">';
  h += rows.length ? rows.join("") : '<div class="rtn"><span class="muted">None stored yet</span></div>';
  return h + '</div><p class="note">Latest high-impact releases for both currencies. Actual values are stored for the US only so far, so other currencies show forecast and previous. Dates are UTC.</p>';
}

var puBase = PAGES.pair;
PAGES.pair = async function (el, p) {
  await puBase(el, p);
  if (!el.querySelector(".ph")) return;
  try {
    var h = await puLoad([p.slice(0, 3), p.slice(3)]);
    if (location.hash.indexOf(p) > -1) el.insertAdjacentHTML("beforeend", h);
  } catch (e) {
    el.insertAdjacentHTML("beforeend", '<p class="note">Could not load releases.</p>');
  }
};

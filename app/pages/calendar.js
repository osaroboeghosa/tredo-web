var clOn = { High: 1, Medium: 1, Holiday: 1 };
var clCol = { High: "var(--down)", Medium: "var(--warn)", Low: "var(--muted)", Holiday: "var(--accent)" };
function clK(d) { return new Date(d).toISOString().slice(0, 10); }

PAGES.calendar = async function (el) {
  el.innerHTML = "<h1>Calendar</h1><p>Loading...</p>";
  var t = new Date();
  var td = clK(t);
  t.setUTCHours(0, 0, 0, 0);
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
  var f = t.toISOString();
  var r = await Promise.all([
    sb("releases?select=currency,title,release_ts,impact,forecast,previous&release_ts=gte." + f + "&order=release_ts.asc&limit=500"),
    sb("release_actuals?select=currency,title,release_ts,actual,unit&release_ts=gte." + f)
  ]);
  var ev = r[0] || [], act = {};
  (r[1] || []).forEach(function (a) { act[a.currency + "|" + a.title + "|" + new Date(a.release_ts).getTime()] = a; });

  function draw() {
    var h = '<div class="pagehead"><div><div class="kicker">Economic events</div><h1>Calendar</h1></div>' +
      '<span class="asof">This week</span></div>';
    h += '<div class="fbar">';
    ["High", "Medium", "Low", "Holiday"].forEach(function (k) {
      h += '<button class="fbtn' + (clOn[k] ? " on" : "") + '" data-k="' + k + '">' + k + "</button>";
    });
    h += "</div>";
    var days = {}, order = [];
    ev.forEach(function (e) {
      if (!clOn[e.impact]) return;
      var d = clK(e.release_ts);
      if (!days[d]) { days[d] = []; order.push(d); }
      var a = act[e.currency + "|" + e.title + "|" + new Date(e.release_ts).getTime()];
      var tm = new Date(e.release_ts).toISOString().slice(11, 16);
      var sub = tm + " UTC";
      if (e.forecast) sub += " · Forecast " + esc(e.forecast);
      if (e.previous) sub += " · Previous " + esc(e.previous);
      var dot = '<span class="dot" style="display:inline-block;background:' + (clCol[e.impact] || "var(--muted)") + ';margin-right:6px"></span>';
      days[d].push(gxr(dot + esc(e.currency) + " " + esc(e.title), sub, a ? esc(a.actual + (a.unit || "")) : "", ""));
    });
    if (!order.length) h += '<p class="muted">No events for these filters.</p>';
    order.forEach(function (d) {
      var nm = new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" });
      h += "<h2" + (d === td ? ' class="today"' : "") + ">" + nm + (d === td ? " · Today" : "") + "</h2>" + gxg(days[d]);
    });
    el.innerHTML = h;
    el.querySelectorAll("button[data-k]").forEach(function (b) {
      b.onclick = function () { clOn[b.dataset.k] = clOn[b.dataset.k] ? 0 : 1; draw(); };
    });
  }
  draw();
};

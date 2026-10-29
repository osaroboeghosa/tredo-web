var UPR = [
  ["Scores", "scores_v3", "as_of", "Daily, weekdays 22:00 UTC", 72],
  ["Score signals", "signals", "as_of", "Daily, weekdays", 72],
  ["Currency strength", "currency_strength", "as_of", "Daily, weekdays", 72],
  ["Retail sentiment", "retail", "as_of", "Daily, weekdays", 72],
  ["COT positioning", "cot", "report_date", "Weekly", 216],
  ["Market and macro data", "raw_values", "fetched_at", "Daily, weekdays", 72],
  ["Economic calendar", "releases", "fetched_at", "Daily, weekdays", 72],
  ["Release actuals", "release_actuals", "fetched_at", "Daily, weekdays", 72],
  ["Economic heatmaps", "heat_state", "updated_at", "Daily, weekdays", 72]
];
var UPM = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function upRow(x, v) {
  var dot = "", when = "n/a", ago = "n/a";
  if (v) {
    var dateOnly = String(v).length === 10;
    var t = Date.parse(dateOnly ? v + "T00:00:00Z" : v);
    var d = new Date(t);
    var h = (Date.now() - t) / 3600000;
    when = UPM[d.getUTCMonth()] + " " + d.getUTCDate();
    if (!dateOnly) when += ", " + ("0" + d.getUTCHours()).slice(-2) + ":" + ("0" + d.getUTCMinutes()).slice(-2) + " UTC";
    if (dateOnly) ago = Math.floor(h / 24) === 0 ? "today" : Math.floor(h / 24) + " d ago";
    else ago = h < 1 ? "under 1 h ago" : h < 48 ? Math.round(h) + " h ago" : Math.floor(h / 24) + " d ago";
    dot = h <= x[4] ? "ok" : h <= 2 * x[4] ? "warn" : "bad";
  }
  var s = '<div class="row2">';
  s += '<span class="dot ' + dot + '"></span>';
  s += '<div class="grow"><div class="r1">' + esc(x[0]) + '</div><div class="r2">' + esc(x[3]) + "</div></div>";
  s += '<div class="rend"><div class="r1">' + esc(ago) + '</div><div class="r2">' + esc(when) + "</div></div></div>";
  return s;
}

PAGES.updates = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var res = await Promise.all(UPR.map(function (x) {
      return sb(x[1] + "?select=" + x[2] + "&order=" + x[2] + ".desc&limit=1").then(function (r) {
        return r && r[0] ? r[0][x[2]] : null;
      }).catch(function () { return null; });
    }));
    var h = '<div class="pagehead"><div><div class="kicker">Freshness</div><h1>Data Updates Log</h1></div><span class="asof">UTC</span></div>';
    h += '<p class="muted sub">When each dataset was last updated. Times are UTC.</p>';
    h += '<div class="gx">' + UPR.map(function (x, i) { return upRow(x, res[i]); }).join("") + "</div>";
    h += '<p class="note">Green means updated within the expected window, amber means late, red means well overdue. Weekend gaps are allowed for daily data.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the log: ' + esc(e.message) + "</p>";
  }
};

var SURV = {
  USD: [["US_SENTIMENT", "Consumer sentiment (UMich)"]],
  EUR: [["EUR_CONS", "Consumer confidence"], ["EUR_BUS", "Industry confidence"], ["EUR_RCI", "Retail confidence"], ["EUR_SCI", "Services confidence"], ["EUR_ESI", "Economic sentiment"]],
  GBP: [["GBP_CONS", "Consumer confidence"], ["GBP_BUS", "Business confidence"]],
  JPY: [["JPY_CONS", "Consumer confidence"]],
  AUD: [["AUD_CONS", "Consumer confidence"]],
  CHF: [["CHF_CONS", "Consumer confidence"], ["CHF_BUS", "Business confidence"]]
};

async function loadSurveys(cs) {
  var names = [], m = {};
  cs.forEach(function (c) { (SURV[c] || []).forEach(function (s) { names.push(s[0]); }); });
  if (names.length) {
    var d = new Date(Date.now() - 200 * 864e5).toISOString().slice(0, 10);
    var r = await sb("raw_values?series=in.(" + names.join(",") + ")&key=eq.level&obs_date=gte." + d + "&select=series,obs_date,value&order=obs_date.desc&limit=1000");
    r.forEach(function (x) { (m[x.series] = m[x.series] || []).push(x); });
  }
  var h = '<h2>Business and consumer confidence</h2><p class="note">Surveys are context only. They are not part of the score. Scales differ between series.</p>';
  cs.forEach(function (c) {
    var L = SURV[c];
    h += '<div class="card srow"><div class="sh"><b>' + esc(c) + '</b></div>';
    if (!L) h += '<p class="reason">No free survey source for ' + esc(c) + '.</p>';
    (L || []).forEach(function (s) {
      var a = m[s[0]] || [], x = a[0], y = a[1];
      if (!x) { h += '<p class="reason">' + esc(s[1]) + ': n/a</p>'; return; }
      var t = s[1] + ": " + pn(x.value);
      if (y) t += " (" + ps(Math.round((x.value - y.value) * 100) / 100) + " vs " + y.obs_date.slice(0, 7) + ")";
      h += '<p class="reason">' + esc(t + ", " + x.obs_date.slice(0, 7)) + '</p>';
    });
    h += '</div>';
  });
  return h;
}

async function loadEvents(cs) {
  var now = new Date().toISOString();
  var r = await sb("releases?currency=in.(" + cs.join(",") + ")&impact=eq.High&release_ts=gte." + now + "&select=currency,title,release_ts&order=release_ts&limit=8");
  var h = '<h2>Upcoming high-impact events</h2>';
  if (!r.length) return h + '<p class="note">No high-impact events stored for the coming days.</p>';
  r.forEach(function (x) {
    var t = new Date(x.release_ts).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    h += '<div class="card srow"><div class="sh"><b>' + esc(x.title) + '</b><span class="muted">' + esc(x.currency) + '</span></div><p class="reason">' + esc(t) + '</p></div>';
  });
  return h + '<p class="note">Times are in your phone time zone. The calendar holds only recent and upcoming days.</p>';
        }

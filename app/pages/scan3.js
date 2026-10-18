PAGES.scan = async function (el, p) {
  if (!/^[A-Z]{6}$/.test(p)) { el.innerHTML = '<p class="down">Unknown pair.</p>'; return; }
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var b = p.slice(0, 3), q = p.slice(3);
    var a = await Promise.all([
      sb("scores_v3?select=*&pair=eq." + p + "&order=as_of.desc&limit=1"),
      sb("tech?select=*&pair=eq." + p + "&order=as_of.desc&limit=1"),
      sb("central_banks?select=currency,policy_rate&currency=in.(" + b + "," + q + ")"),
      sb("cot?select=currency,report_date,net,weekly_change,pct52&currency=eq." + b + "&order=report_date.desc&limit=1"),
      sb("cot?select=currency,report_date,net,weekly_change,pct52&currency=eq." + q + "&order=report_date.desc&limit=1"),
      sb("retail?select=long_pct&pair=eq." + p + "&order=as_of.desc&limit=1")
    ]);
    if (!a[0].length) { el.innerHTML = "<h1>" + esc(p) + '</h1><p class="muted">No score yet.</p>'; return; }
    var h = scnTop(a[0][0], a[1][0]) + scnPanels(a[0][0], a[1][0], a[2], [a[3][0], a[4][0]], a[5][0]);
    h += '<p class="note">Each signal runs from -2 (red) to +2 (green). A panel score is the sum of its signals. Rows marked US only are filled on USD pairs. Accuracy is not proven. Scores rank where to look first. They are not forecasts.</p>';
    h += '<p class="note"><a href="#/pair/' + p + '">Open the full detail page</a></p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load this page: ' + esc(e.message) + "</p>";
  }
};

async function loadSources(p, cs) {
  var L = [], mac = 0, h = '<h2>Data sources</h2><div class="card srow">';
  var a = await sb("prices?pair=eq." + p + "&select=d&order=d.desc&limit=1");
  if (a.length) L.push("Prices (Yahoo): " + a[0].d);
  a = await sb("retail?pair=eq." + p + "&select=as_of&order=as_of.desc&limit=1");
  if (a.length) L.push("Retail positioning (Myfxbook): " + a[0].as_of);
  a = await sb("cot?currency=in.(" + cs.join(",") + ")&select=currency,report_date&order=report_date.desc&limit=6");
  var seen = {};
  a.forEach(function (k) {
    if (!seen[k.currency]) { seen[k.currency] = 1; L.push(k.currency + " COT (CFTC): " + k.report_date); }
  });
  a = await sb("central_banks?currency=in.(" + cs.join(",") + ")&select=currency,last_meeting,next_meeting");
  a.forEach(function (k) {
    L.push(k.currency + " policy rate: last meeting " + k.last_meeting + ", next " + k.next_meeting + " (updated by hand)");
  });
  a = await sb("signals_latest?pair=eq." + p + "&name=in.(GDP,Retail%20Sales,CPI,UE)&select=name,detail");
  a.forEach(function (k) {
    var d = k.detail || {}, t = [];
    [[cs[0], d.base_info], [cs[1], d.quote_info]].forEach(function (x) {
      if (x[1] && x[1].obs) t.push(x[0] + " " + x[1].obs + " (" + x[1].source + ")");
    });
    if (t.length) { mac++; L.push(k.name + ": " + t.join(", ")); }
  });
  if (!mac) L.push("Macro dates appear after the next daily run.");
  L.forEach(function (t) { h += '<p class="reason">' + esc(t) + '</p>'; });
  return h + '</div><p class="note">Each source has its own delay. Dates are the latest data point, not today.</p>';
}

var basePair = PAGES.pair;
PAGES.pair = async function (el, p) {
  await basePair(el, p);
  if (!el.querySelector(".ph")) return;
  var cs = [p.slice(0, 3), p.slice(3)], h = "";
  try { h += await loadSurveys(cs); } catch (e) { h += '<p class="note">Could not load surveys.</p>'; }
  try { h += await loadEvents(cs); } catch (e) { h += '<p class="note">Could not load events.</p>'; }
  try { h += await loadSources(p, cs); } catch (e) { h += '<p class="note">Could not load sources.</p>'; }
  if (location.hash.indexOf(p) > -1) el.insertAdjacentHTML("beforeend", h);
};

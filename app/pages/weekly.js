function wkD(s) { return new Date(s + "T00:00:00Z").getTime(); }

function wkCmp(rows, k, v) {
  var o = { L: rows[0].as_of, cur: {}, old: {} };
  var cut = wkD(o.L) - 7 * 86400000;
  rows.forEach(function (x) {
    if (x.as_of === o.L) o.cur[x[k]] = Number(x[v]);
    else if (wkD(x.as_of) >= cut) o.old[x[k]] = Number(x[v]);
  });
  return o;
}

function wkList(o, withOld) {
  var a = [];
  Object.keys(o.cur).forEach(function (k) {
    if (withOld && o.old[k] === undefined) return;
    a.push({ k: k, n: o.cur[k], d: o.old[k] === undefined ? 0 : o.cur[k] - o.old[k] });
  });
  return a;
}

function wkS(n) { return (n > 0 ? "+" : "") + Math.round(n); }

function wkR(l, n, d, pair) {
  var c = d > 0 ? "up" : d < 0 ? "down" : "muted";
  var v = wkS(n) + ' <span class="' + c + '">(' + wkS(d) + ')</span>';
  if (!pair) return gxr(esc(l), "", v);
  return '<a class="gr" style="color:var(--text)" href="#/pair/' + esc(l) + '"><div class="gl">' + esc(l) + '</div><span class="gv">' + v + '</span><span class="sch">&#8250;</span></a>';
}

function wkG(t, a, f) {
  return "<h2>" + t + "</h2>" + gxg(a.length ? a.map(f) : [gxr("None yet", "", "", "muted")]);
}

PAGES.weekly = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var sc = await sb("scores?select=pair,as_of,score&order=as_of.desc&limit=1000");
    var cs = await sb("currency_strength?select=currency,as_of,value&order=as_of.desc&limit=200");
    var ev = await sb("releases?select=currency,title,release_ts,forecast,previous&impact=eq.High&release_ts=gte." + new Date().toISOString() + "&order=release_ts.asc&limit=40");
    var h = '<h1>Weekly report</h1>';
    if (!sc.length) { el.innerHTML = h + '<p class="muted">No stored scores yet.</p>'; return; }
    var a = wkCmp(sc, "pair", "score"), L = wkList(a, true);
    h += '<p class="muted sub">Changes since the earliest stored day in the last 7 days. Latest scores: ' + esc(a.L) + '</p>';
    var up = L.filter(function (x) { return x.d > 0; }).sort(function (p, q) { return q.d - p.d; }).slice(0, 5);
    var dn = L.filter(function (x) { return x.d < 0; }).sort(function (p, q) { return p.d - q.d; }).slice(0, 5);
    var rp = function (x) { return wkR(x.k, x.n, x.d, 1); };
    var rc = function (x) { return wkR(x.k, x.n, x.d, 0); };
    h += wkG("Biggest score rises", up, rp) + wkG("Biggest score falls", dn, rp);
    if (cs.length) {
      var c = wkList(wkCmp(cs, "currency", "value"), false).sort(function (p, q) { return q.n - p.n; });
      h += wkG("Currency strength", c, rc);
    }
    h += wkG("Upcoming high-impact events (UTC)", ev, function (x) {
      var t = String(x.release_ts).slice(5, 16).replace("T", " ");
      var f = (x.forecast ? "Forecast " + x.forecast : "") + (x.previous ? (x.forecast ? ", " : "") + "previous " + x.previous : "");
      return gxr(esc(x.currency) + " " + esc(x.title), esc(f), esc(t));
    });
    h += '<p class="note">Figures in brackets are the change in score points. Tap a pair to open its detail page. Scores are an attention ranking, not forecasts.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load the weekly report: ' + esc(e.message) + '</p>';
  }
};

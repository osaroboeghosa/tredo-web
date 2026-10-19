PAGES.groups = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var ser = [], M = ["GDP", "RETAIL", "CPI", "UE"];
    HMC.forEach(function (c) { M.forEach(function (m) { ser.push(c + "_" + m); }); });
    var r = await sb("raw_values?select=series,key,obs_date,value&series=in.(" + ser.join(",") + ")&order=obs_date.desc&limit=1000");
    var rows = {};
    r.forEach(function (x) {
      if (!rows[x.series]) rows[x.series] = [];
      if (rows[x.series].length < 2) rows[x.series].push(x);
    });
    var yc = Object.keys(GCFG.yields);
    var yl = await Promise.all(yc.map(function (c) {
      return sb("raw_values?select=value&series=eq." + GCFG.yields[c] + "&order=obs_date.desc&limit=1");
    }));
    var yv = {}, ys = 0, yn = 0;
    yc.forEach(function (c, i) {
      if (yl[i].length) { yv[c] = Number(yl[i][0].value); ys += yv[c]; yn++; }
    });
    var ct = await sb("cot?select=currency,report_date,net,weekly_change,pct52&order=report_date.desc&limit=40");
    var cot = {}, mn = 1, mw = 1, pm = 0;
    ct.forEach(function (x) { if (!cot[x.currency]) cot[x.currency] = x; });
    HMC.forEach(function (c) {
      var x = cot[c];
      if (!x) return;
      mn = Math.max(mn, Math.abs(Number(x.net)));
      mw = Math.max(mw, Math.abs(Number(x.weekly_change)));
      pm = Math.max(pm, Number(x.pct52));
    });
    var rt = await sb("retail?select=pair,as_of,long_pct&order=as_of.desc&limit=28");
    function mc(c, m) {
      var v = hmChg(rows[c + "_" + m]);
      if (v == null) return ["n/a", null];
      return [gcSg(v, 2), gcLvl(v, GCFG.cut[m], m === "UE")];
    }
    function rel(v, mx) {
      return [Math.round(v).toLocaleString("en-US"), gcLvl(v, [mx * GCFG.rel[0], mx * GCFG.rel[1]])];
    }
    var g = [], f = [], j = [], p = [];
    HMC.forEach(function (c) {
      g.push(gcRow(c, [mc(c, "GDP"), mc(c, "RETAIL")]));
      var y = ["n/a", null];
      if (yv[c] !== undefined) y = [yv[c].toFixed(2) + "%", gcLvl(yv[c] - ys / yn, GCFG.yld)];
      f.push(gcRow(c, [mc(c, "CPI"), y]));
      j.push(gcRow(c, [mc(c, "UE")]));
      var x = cot[c];
      if (!x) { p.push(gcRow(c, [["n/a", null], ["n/a", null], ["n/a", null]])); return; }
      var q = Number(x.pct52) * (pm <= 1 ? 100 : 1), w = GCFG.pct;
      var k = q >= w[0] ? 2 : q >= w[1] ? 1 : q <= w[3] ? -2 : q <= w[2] ? -1 : 0;
      p.push(gcRow(c, [rel(Number(x.net), mn), rel(Number(x.weekly_change), mw), [Math.round(q) + "%", k]]));
    });
    var cr = [], d0 = rt.length ? rt[0].as_of : "", cc = GCFG.crowd;
    rt.forEach(function (x) {
      if (x.as_of !== d0) return;
      var l = Number(x.long_pct);
      var k = l >= cc[0] ? -2 : l >= cc[1] ? -1 : l <= cc[3] ? 2 : l <= cc[2] ? 1 : 0;
      var w = k > 0 ? "Bullish" : k < 0 ? "Bearish" : "Neutral";
      cr.push({ n: esc(x.pair), s: l, h: gcCell(Math.round(l) + "%", k) + gcCell(Math.round(100 - l) + "%", 0) + gcCell(w, k) });
    });
    var h = '<h1>Groups</h1><p class="muted sub">One heatmap per data group. Green is favourable, red is unfavourable.</p>';
    h += gcTab("Growth", ["GDP", "Sales"], g, 1) + gcTab("Inflation", ["CPI", "2Y yield"], f, 1);
    h += gcTab("Jobs", ["Unemp"], j, 1) + gcTab("Positioning", ["Net", "Weekly", "Pctile"], p, 1);
    h += gcTab("Crowd", ["Long", "Short", "Lean"], cr, 0);
    h += '<p class="note">Growth, CPI and Unemp show the change since the previous release, so a fall in unemployment is green. Positioning shows net positions, the weekly change and where the net sits in its one-year range. Crowd lean treats heavy long positioning as a contrary signal. This is context for the scores, not a forecast.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load groups: ' + esc(e.message) + "</p>";
  }
};

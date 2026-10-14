var pfNames = ["Strong (50+)", "Moderate (25 to 49)", "Lean (10 to 24)"];

function pfB(a) { return a >= 50 ? 0 : a >= 25 ? 1 : 2; }

function pfRow(name, o) {
  var h = '<div class="card"><div class="rtr"><b>' + esc(name) + '</b><span class="muted">' + o.n + ' measured</span></div>';
  if (!o.n) return h + '<div class="rtn"><span class="muted">Nothing measured yet</span></div></div>';
  var hit = Math.round(100 * o.h / o.n), avg = o.sum / o.n;
  h += '<div class="rtn"><span>Moved the way the score pointed</span><span>' + hit + '%</span></div>';
  h += '<div class="rtn"><span>Average move in that direction</span><span class="' + (avg >= 0 ? "up" : "down") + '">' + (avg > 0 ? "+" : "") + avg.toFixed(2) + '%</span></div>';
  return h + '</div>';
}

PAGES.performance = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var sc = await sb("scores?select=pair,as_of,score&order=as_of.desc&limit=1000");
    if (!sc.length) { el.innerHTML = '<h1>Performance</h1><p class="muted">No stored scores yet.</p>'; return; }
    var min = sc[sc.length - 1].as_of;
    var pr = await sb("prices?select=pair,d,close&d=gte." + min + "&order=d.desc&limit=1000");
    var px = {}, last = "";
    pr.forEach(function (x) {
      if (!px[x.pair]) px[x.pair] = [];
      px[x.pair].push({ d: x.d, c: Number(x.close) });
      if (x.d > last) last = x.d;
    });
    var B = [{ n: 0, h: 0, sum: 0 }, { n: 0, h: 0, sum: 0 }, { n: 0, h: 0, sum: 0 }];
    var D = {}, tot = 0;
    sc.forEach(function (x) {
      var s = Number(x.score), a = Math.abs(s), l = px[x.pair];
      if (!l || a < 10) return;
      var en = null;
      for (var i = 0; i < l.length; i++) { if (l[i].d <= x.as_of) { en = l[i]; break; } }
      if (!en || l[0].d <= en.d) return;
      var ret = (l[0].c / en.c - 1) * 100 * (s > 0 ? 1 : -1);
      var b = B[pfB(a)];
      b.n++; b.sum += ret; if (ret > 0) b.h++;
      if (!D[x.as_of]) D[x.as_of] = { n: 0, h: 0 };
      D[x.as_of].n++; if (ret > 0) D[x.as_of].h++;
      tot++;
    });
    var h = '<h1>Performance</h1><p class="muted sub">Stored scores compared with what price did afterwards' + (last ? ', measured to ' + esc(last) : '') + '.</p>';
    h += pfRow(pfNames[0], B[0]) + pfRow(pfNames[1], B[1]) + pfRow(pfNames[2], B[2]);
    var days = Object.keys(D).sort().reverse();
    if (days.length) {
      h += '<div class="card"><b>By score day</b>';
      days.forEach(function (d) {
        h += '<div class="rtn"><span>' + esc(d) + '</span><span>' + D[d].h + ' of ' + D[d].n + ' moved the right way</span></div>';
      });
      h += '</div>';
    }
    if (tot < 100) h += '<p class="note">Only ' + tot + ' scores are measured so far. That is too few to read anything into. The record grows with every daily run.</p>';
    h += '<p class="note">Each score is measured from the close on its score day to the latest close. A hit rate near 50% is a coin flip. Neutral scores (under 10) are left out.</p>';
    h += '<p class="note">Past results do not predict future results.</p>';
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load performance: ' + esc(e.message) + '</p>';
  }
};

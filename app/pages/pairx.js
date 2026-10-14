function pn(v) { return v == null ? "n/a" : String(Math.round(Number(v) * 100) / 100); }
function ps(v) { return v == null ? "n/a" : (v > 0 ? "+" : "") + v; }
function pc(v) { return v == null || v === 0 ? "muted" : (v > 0 ? "up" : "down"); }
function n0(v) { return v == null ? "n/a" : Number(v).toLocaleString("en-US"); }

function pfig(c, i, st) {
  if (!i) return "";
  return c + " " + pn(i.now) + " vs " + pn(i.before) + (st == null ? "" : " (step " + ps(st) + ")");
}

async function pairCot(a, b) {
  var o = {}, cs = [a, b];
  for (var i = 0; i < 2; i++) {
    try {
      var r = await sb("cot?currency=eq." + cs[i] + "&select=report_date,net,weekly_change,pct52&order=report_date.desc&limit=12");
      o[cs[i]] = r.reverse();
    } catch (e) { o[cs[i]] = []; }
  }
  return o;
}

function cotLine(c, d) {
  d = d || {};
  var out = [], k = [[c.b, d.base], [c.q, d.quote]];
  k.forEach(function (x) {
    var r = c.cot[x[0]] || [], l = r[r.length - 1];
    if (!l) return;
    out.push(x[0] + " net " + n0(l.net) + ", 52w pct " + (l.pct52 == null ? "n/a" : Math.round(l.pct52)) + " (step " + ps(x[1]) + ")");
  });
  return out.join(". ");
}

function cotChart(code, r) {
  if (!r.length) return "";
  var W = 300, H = 100, mid = H / 2, mx = 1, svg = "";
  r.forEach(function (x) { mx = Math.max(mx, Math.abs(x.net)); });
  var bw = W / r.length;
  r.forEach(function (x, i) {
    var h = Math.max(1, Math.abs(x.net) / mx * (mid - 4));
    var y = x.net >= 0 ? mid - h : mid;
    svg += '<rect x="' + (i * bw + 3).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw - 6).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="var(' + (x.net >= 0 ? "--up" : "--down") + ')"/>';
  });
  var l = r[r.length - 1];
  return '<div class="card srow"><div class="sh"><b>' + esc(code) + '</b><span class="sv ' + pc(l.net) + '">' + n0(l.net) + '</span></div>' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="100" preserveAspectRatio="none"><line x1="0" x2="' + W + '" y1="' + mid + '" y2="' + mid + '" stroke="var(--line)"/>' + svg + '</svg>' +
    '<p class="reason">' + esc(r[0].report_date) + ' to ' + esc(l.report_date) + '</p></div>';
}

function pairExtra(c, m) {
  var h = '<h2>COT, last 12 weeks</h2><p class="note">Net speculator positions (longs minus shorts). Above the line is net long, below is net short. Weekly and delayed.</p>';
  h += cotChart(c.b, c.cot[c.b] || []) + cotChart(c.q, c.cot[c.q] || []);
  var d = m["Retail"] && m["Retail"].detail, lp = d ? d.long_pct : null;
  if (lp != null) {
    h += '<h2>Retail positioning</h2><div class="rbar"><div class="rl" style="width:' + Number(lp) + '%"></div></div>';
    h += '<p class="note">Long ' + Number(lp) + '% | Short ' + (100 - Number(lp)) + '%. Crowds are often wrong at extremes, so this is read as contrarian.</p>';
  }
  return h;
      }

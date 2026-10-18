function scnD(s) {
  var m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return s ? m[Number(s.slice(5, 7)) - 1] + " " + s.slice(0, 4) : "";
}

function scnI(i, cur) {
  if (!i || i.now == null) return cur + " n/a";
  var r = function (v) { return Math.round(Number(v) * 100) / 100; };
  return cur + " " + r(i.now) + "%" + (i.before == null ? "" : " (before " + r(i.before) + "%)") + (i.obs ? " · " + scnD(i.obs) : "");
}

function scnS(d, b, q, fb) {
  if (!d) return fb;
  return scnI(d.base_info, b) + " — " + scnI(d.quote_info, q);
}

function scnHist(h) {
  if (h.length < 2) return "<h2>Score history</h2>" + gxg([gxr("Adds one point each day", "", "", "muted")]);
  var n = h.length, pts = h.map(function (x, i) {
    var v = Math.max(-15, Math.min(15, Number(x.total)));
    return (i / (n - 1) * 300).toFixed(1) + "," + (40 - v / 15 * 36).toFixed(1);
  }).join(" ");
  return '<h2>Score history</h2><div class="gx gp"><svg class="p2l" viewBox="0 0 300 80" preserveAspectRatio="none"><line x1="0" y1="40" x2="300" y2="40" stroke="var(--line)"/><polyline fill="none" stroke="var(--accent)" stroke-width="2" points="' + pts + '"/></svg><div class="gs">' + esc(h[0].as_of) + " to " + esc(h[n - 1].as_of) + "</div></div>";
}

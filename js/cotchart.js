function n0(v) { return v == null ? "n/a" : Number(v).toLocaleString("en-US"); }

function cotBars(c, r) {
  if (!r.length) return "";
  var W = 300, H = 110, mid = H / 2, mx = 1;
  r.forEach(function (x) { mx = Math.max(mx, Math.abs(x.net)); });
  var bw = W / r.length, svg = "";
  r.forEach(function (x, i) {
    var h = Math.max(1, Math.abs(x.net) / mx * (mid - 4));
    var y = x.net >= 0 ? mid - h : mid;
    var f = x.net >= 0 ? "var(--up,#2ecc9a)" : "var(--down,#ff6b6b)";
    svg += '<rect x="' + (i * bw + 3).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw - 6).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + f + '"/>';
  });
  var last = r[r.length - 1];
  var h2 = '<div class="card"><div class="ptop"><span class="pname">' + esc(c) + '</span><span class="pscore ' + signClass(last.net) + '">' + n0(last.net) + "</span></div>";
  h2 += '<svg viewBox="0 0 ' + W + " " + H + '" width="100%" height="110" preserveAspectRatio="none"><line x1="0" x2="' + W + '" y1="' + mid + '" y2="' + mid + '" stroke="var(--line,#333)"/>' + svg + "</svg>";
  h2 += '<p class="reason">' + esc(r[0].report_date) + " to " + esc(last.report_date);
  if (last.pct52 != null) h2 += ". 52-week percentile: " + Math.round(last.pct52);
  return h2 + "</p></div>";
}

async function loadCot() {
  var host = document.getElementById("cotbox");
  var p = new URLSearchParams(location.search).get("p") || "";
  if (!host || !/^[A-Z]{6}$/.test(p)) return;
  try {
    var out = '<h2>COT, last 12 weeks</h2><p class="note">Net speculator positioning (longs minus shorts). Bars above the line are net long, below are net short. Data is weekly and delayed.</p>';
    var cs = [p.slice(0, 3), p.slice(3)];
    for (var i = 0; i < 2; i++) {
      var r = await sb("cot?currency=eq." + cs[i] + "&select=report_date,net,pct52&order=report_date.desc&limit=12");
      r.reverse();
      out += cotBars(cs[i], r);
    }
    host.innerHTML = out;
  } catch (e) {
    host.textContent = "Could not load COT: " + e.message;
  }
         }

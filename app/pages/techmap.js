function tmhN(v) { return v == null ? null : Number(v); }
function tmhSg(v) { return v == null ? "n/a" : (v > 0 ? "+" : "") + v; }
function tmhMa(f) { return f == null ? null : (f === "Bullish" ? 2 : -2); }

function tmhC(t, k) {
  if (k == null) return '<td class="tmn">n/a</td>';
  return '<td class="tm' + (k === 0 ? "z" : (k > 0 ? "u" : "d") + Math.abs(k)) + '">' + t + "</td>";
}

function tmhCnt(x) {
  var n = 0, s = 0;
  [x.sma20, x.sma50, x.sma100, x.sma200].forEach(function (f) { if (f != null) { s++; if (f === "Bullish") n++; } });
  return s ? n : null;
}

function tmhVal(x, k) {
  var t = tmhN(x.trend), s = tmhN(x.season10);
  if (k === "pair") return x.pair;
  if (k === "trend") return t;
  if (k === "season") return s;
  if (k === "ma") return tmhCnt(x);
  if (k === "m7") return tmhN(x.move7);
  if (k === "m90") return tmhN(x.move90);
  return (t == null && s == null) ? null : Math.abs((t || 0) + (s || 0));
}

function tmhMv(v) { v = tmhN(v); return v == null ? '<td class="tmn">n/a</td>' : "<td>" + v.toFixed(2) + "%</td>"; }

function tmhVol(v) {
  if (!v) return '<td class="tmn">n/a</td>';
  return '<td class="' + (v === "High" ? "tmw2" : (v === "Low" ? "tmz" : "")) + '">' + esc(v) + "</td>";
}

function tmhRow(x) {
  var t = tmhN(x.trend), s = tmhN(x.season10);
  var h = '<tr><td class="tmk"><a href="#/scan/' + esc(x.pair) + '">' + esc(x.pair) + "</a></td>";
  h += tmhC(tmhSg(t), t) + tmhC(tmhSg(s), s);
  [x.sma20, x.sma50, x.sma100, x.sma200].forEach(function (f) {
    h += tmhC(f == null ? "" : (f === "Bullish" ? "Up" : "Down"), tmhMa(f));
  });
  return h + tmhMv(x.move7) + tmhMv(x.move90) + tmhVol(x.vol) + "</tr>";
}

function tmhHead() {
  var c = [["pair", "Pair"], ["trend", "Trend"], ["season", "Season"], ["", "20"], ["", "50"], ["", "100"], ["", "200"], ["m7", "7d move"], ["m90", "90d move"], ["", "Vol"]];
  var h = "<tr>";
  c.forEach(function (x) {
    var a = x[0] && TMH.key === x[0] ? (TMH.dir > 0 ? " &#9650;" : " &#9660;") : "";
    h += '<th data-k="' + x[0] + '">' + x[1] + a + "</th>";
  });
  return h + "</tr>";
}

PAGES.technical = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var r = await sb("tech?select=pair,as_of,trend,season10,sma20,sma50,sma100,sma200,move7,move90,vol&order=as_of.desc&limit=28");
    if (!r.length) {
      el.innerHTML = '<h1>Technical</h1><p class="muted">No data yet.</p>';
      return;
    }
    var day = r[0].as_of;
    r = r.filter(function (x) { return x.as_of === day; });
    var vb = '<div class="tmv">';
    TMHV.forEach(function (v) {
      vb += '<button type="button" class="tmb' + (TMH.vol === v ? " on" : "") + '" data-v="' + v + '">' + (v === "all" ? "Any volatility" : v) + "</button>";
    });
    vb += "</div>";
    var h = '<h1>Technical</h1><p class="muted sub">As of ' + esc(day) + "</p>" + filtBar() + vb + '<div id="res"></div>';
    h += '<p class="note">Trend and Season run from -2 to +2. The four average columns show whether price is above (Up, green) or below (Down, red) that many-day average. Moves are the average daily move in percent over 7 and 90 days. Volatility compares the two. Tap a heading to sort.</p>';
    el.innerHTML = h;
    var res = el.querySelector("#res");
    var draw = function () {
      var f = r.filter(function (x) { return filtMatch(x.pair) && (TMH.vol === "all" || x.vol === TMH.vol); });
      f.sort(function (a, b) {
        var p = tmhVal(a, TMH.key), q = tmhVal(b, TMH.key);
        if (p == null && q == null) return 0;
        if (p == null) return 1;
        if (q == null) return -1;
        return (p < q ? -1 : (p > q ? 1 : 0)) * TMH.dir;
      });
      if (!f.length) { res.innerHTML = filtEmpty(); return; }
      res.innerHTML = '<div class="tmw"><table class="tmt">' + tmhHead() + f.map(tmhRow).join("") + "</table></div>";
      res.querySelectorAll("th").forEach(function (th) {
        var k = th.getAttribute("data-k");
        if (!k) return;
        th.onclick = function () {
          if (TMH.key === k) TMH.dir = -TMH.dir;
          else { TMH.key = k; TMH.dir = k === "pair" ? 1 : -1; }
          draw();
        };
      });
    };
    filtWire(el, draw);
    var vbs = el.querySelectorAll(".tmb");
    vbs.forEach(function (b) {
      b.onclick = function () {
        TMH.vol = b.getAttribute("data-v");
        vbs.forEach(function (x) { x.className = "tmb" + (x === b ? " on" : ""); });
        draw();
      };
    });
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load technical data: ' + esc(e.message) + "</p>";
  }
};

var ssSel = "";
var ssMon = ["J","F","M","A","M","J","J","A","S","O","N","D"];
var ssNm = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function ssF(v) {
  v = Number(v);
  return (v > 0 ? "+" : "") + v.toFixed(2) + "%";
}

function ssCl(v) {
  v = Number(v);
  return v > 0 ? "up" : v < 0 ? "down" : "";
}

function ssChart(by, cm) {
  var mx = 1, i, r;
  for (i = 1; i <= 12; i++) {
    r = by[i];
    if (r) mx = Math.max(mx, Math.abs(Number(r.avg2y)), Math.abs(Number(r.avg5y)));
  }
  var s = '<svg class="ssv" viewBox="0 0 336 210">';
  s += '<line class="ssz" x1="0" y1="95" x2="336" y2="95"/>';
  for (i = 1; i <= 12; i++) {
    var x = (i - 1) * 28;
    if (i === cm) s += '<rect class="ssc" x="' + x + '" y="0" width="28" height="190"/>';
    r = by[i];
    if (r) {
      [["ss2", r.avg2y, x + 4], ["ss5", r.avg5y, x + 14]].forEach(function (b) {
        var h = Math.abs(Number(b[1])) / mx * 85;
        var y = Number(b[1]) >= 0 ? 95 - h : 95;
        s += '<rect class="' + b[0] + '" x="' + b[2] + '" y="' + y + '" width="10" height="' + h.toFixed(1) + '"/>';
      });
    }
    s += '<text class="ssl" x="' + (x + 14) + '" y="206" text-anchor="middle">' + ssMon[i - 1] + '</text>';
  }
  return s + '</svg>';
}

function ssDetail(by, cm) {
  var r = by[cm];
  if (!r) return "";
  var a = [gxr("2-year average", "", ssF(r.avg2y), ssCl(r.avg2y)), gxr("5-year average", "", ssF(r.avg5y), ssCl(r.avg5y))];
  if (typeof r.trend === "string" || typeof r.trend === "number") a.push(gxr("Trend", "", esc(String(r.trend))));
  var p = r.pattern;
  if (typeof p === "string") { try { p = JSON.parse(p); } catch (e) { p = null; } }
  if (p && p.length) a.push(gxr("Past years", p.map(function (q) { return esc(String(q.y)) + " " + ssF(q.r); }).join(", "), ""));
  return "<h2>This month: " + ssNm[cm - 1] + "</h2>" + gxg(a);
}

PAGES.seasonality = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var r = await sb("seasonality?select=pair,month,avg2y,avg5y,pattern,trend&limit=400");
    var all = {};
    r.forEach(function (x) {
      if (!all[x.pair]) all[x.pair] = {};
      all[x.pair][x.month] = x;
    });
    var pairs = Object.keys(all).sort();
    var cm = new Date().getMonth() + 1;
    var h = '<h1>Seasonality</h1><p class="muted sub">Average return of each calendar month, in percent. Current month is shaded.</p>';
    h += filtBar() + '<div id="res"></div>';
    h += '<p class="note">Seasonality is context only. It describes the past and is not a forecast.</p>';
    h += '<p class="note">Teal bars are the 2-year average, grey bars the 5-year average.</p>';
    el.innerHTML = h;
    var res = el.querySelector("#res");
    var draw = function () {
      var f = pairs.filter(function (p) { return filtMatch(p); });
      if (!f.length) { res.innerHTML = filtEmpty(); return; }
      if (f.indexOf(ssSel) < 0) ssSel = f[0];
      var o = '<div class="ssbs">' + f.map(function (p) {
        return '<button class="ssb' + (p === ssSel ? ' on' : '') + '" data-p="' + esc(p) + '">' + esc(p) + '</button>';
      }).join("") + '</div>';
      o += '<div class="gx gp"><b>' + esc(ssSel) + '</b>' + ssChart(all[ssSel], cm) + '</div>';
      o += ssDetail(all[ssSel], cm);
      o += '<p class="note"><a href="#/pair/' + esc(ssSel) + '">Open ' + esc(ssSel) + ' detail page</a></p>';
      res.innerHTML = o;
    };
    res.addEventListener("click", function (e) {
      var b = e.target.closest(".ssb");
      if (b) { ssSel = b.getAttribute("data-p"); draw(); }
    });
    filtWire(el, draw);
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load seasonality: ' + esc(e.message) + '</p>';
  }
};

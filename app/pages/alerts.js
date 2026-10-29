/* tredo Confluence Alerts (#/alerts) - instruments where technical, sentiment and macro agree. */

var alMode = "all";

function alClass(v) { return v > 0 ? "pos" : v < 0 ? "neg" : "neu"; }

function alCard(x) {
  var t = Number(x.technical), s = Number(x.sentiment), m = Number(x.macro), tot = Number(x.total);
  var dir = tot > 0 ? "Bullish" : tot < 0 ? "Bearish" : "Neutral";
  var dirCls = tot > 0 ? "up" : tot < 0 ? "down" : "muted";
  var agree = [t, s, m].filter(function (v) { return Math.sign(v) === Math.sign(tot) && v !== 0; }).length;
  return '<a class="alcard" href="#/pair/' + esc(x.pair) + '">' +
    '<div class="alhead"><b>' + esc(x.pair) + '</b>' +
    '<span class="alpills"><span class="altag ' + (agree === 3 ? "full" : "part") + '">' + agree + "/3 aligned</span>" +
    '<span class="' + dirCls + '">' + dir + "</span></span></div>" +
    '<div class="albody">' +
      '<div class="albar"><span>Technical</span><span class="htr"><i class="' + alClass(t) + '" style="left:' + (t >= 0 ? 50 : 50 - Math.min(50, Math.abs(t) * 12.5)) + '%;width:' + Math.min(50, Math.abs(t) * 12.5) + '%"></i></span><b class="' + (t > 0 ? "up" : t < 0 ? "down" : "muted") + '">' + tsN(t) + "</b></div>" +
      '<div class="albar"><span>Sentiment</span><span class="htr"><i class="' + alClass(s) + '" style="left:' + (s >= 0 ? 50 : 50 - Math.min(50, Math.abs(s) * 12.5)) + '%;width:' + Math.min(50, Math.abs(s) * 12.5) + '%"></i></span><b class="' + (s > 0 ? "up" : s < 0 ? "down" : "muted") + '">' + tsN(s) + "</b></div>" +
      '<div class="albar"><span>Macro</span><span class="htr"><i class="' + alClass(m) + '" style="left:' + (m >= 0 ? 50 : 50 - Math.min(50, Math.abs(m) / S3CFG.max.macro * 50)) + '%;width:' + Math.min(50, Math.abs(m) / S3CFG.max.macro * 50) + '%"></i></span><b class="' + (m > 0 ? "up" : m < 0 ? "down" : "muted") + '">' + tsN(m) + "</b></div>" +
    "</div>" +
    '<div class="alfoot"><span class="muted">Score</span><b class="' + dirCls + '">' + tsN(tot) + "</b></div>" +
    "</a>";
}

PAGES.alerts = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var d = await sb("scores_v3?select=as_of&order=as_of.desc&limit=1");
    if (!d.length) { el.innerHTML = "<h1>Confluence Alerts</h1><p class=\"muted\">No scores yet.</p>"; return; }
    var day = d[0].as_of;
    var rows = await sb("scores_v3?select=pair,total,bias,technical,sentiment,macro&as_of=eq." + day + "&limit=100");

    var rows2 = rows.filter(function (x) { return x.technical != null && x.sentiment != null && x.macro != null; });
    var agreeing = rows2.filter(function (x) {
      var s = Math.sign(Number(x.total));
      return s !== 0 && Math.sign(Number(x.technical)) === s && Math.sign(Number(x.sentiment)) === s && Math.sign(Number(x.macro)) === s;
    });
    agreeing.sort(function (a, b) { return Math.abs(Number(b.total)) - Math.abs(Number(a.total)); });

    var full = agreeing.filter(function (x) {
      return Math.abs(Number(x.total)) >= 8;
    });

    var h = '<div class="pagehead"><div><div class="kicker">Signal alignment</div><h1>Confluence Alerts</h1></div>' +
      '<span class="asof">As of ' + esc(day) + "</span></div>" +
      '<p class="muted sub">Instruments where technical, sentiment and macro agree. The more groups align, the stronger the confluence.</p>';

    h += '<div class="statsrow">' +
      '<div class="stat"><span>3 of 3 aligned</span><b class="up">' + agreeing.length + "</b></div>" +
      '<div class="stat"><span>High conviction</span><b>' + full.length + "</b></div>" +
      '<div class="stat"><span>Scanned</span><b>' + rows2.length + "</b></div>" +
      '<div class="stat"><span>Updated</span><b>Daily</b></div>' +
      "</div>";

    h += '<div class="fbar">' +
      ["all", "up", "down"].map(function (m) {
        return '<button class="fbtn' + (alMode === m ? " on" : "") + '" data-m="' + m + '">' + (m === "all" ? "All" : m === "up" ? "Bullish" : "Bearish") + "</button>";
      }).join("") + "</div><div id=\"alres\"></div>";
    h += '<p class="note">Alignment means all three groups point the same way. It is not a forecast and not a trade entry - it only says the independent inputs are not fighting each other.</p>';
    el.innerHTML = h;

    var res = el.querySelector("#alres");
    var draw = function () {
      var f = agreeing.filter(function (x) {
        return alMode === "all" || (alMode === "up" ? Number(x.total) > 0 : Number(x.total) < 0);
      });
      res.innerHTML = f.length
        ? '<div class="algrid">' + f.map(alCard).join("") + "</div>"
        : '<p class="muted">No instruments align on all three groups right now.</p>';
    };
    el.querySelectorAll(".fbtn").forEach(function (b) {
      b.onclick = function () {
        alMode = b.getAttribute("data-m");
        el.querySelectorAll(".fbtn").forEach(function (x) { x.className = "fbtn" + (x === b ? " on" : ""); });
        draw();
      };
    });
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load alerts: ' + esc(e.message) + "</p>";
  }
};

function ring(score) {
  var C = 163.4;
  var a = Math.min(100, Math.abs(score)) / 100 * C;
  var col = Math.abs(score) < 10 ? "var(--muted)" : (score > 0 ? "var(--up)" : "var(--down)");
  return '<svg class="ring" viewBox="0 0 64 64">' +
    '<circle cx="32" cy="32" r="26" fill="none" stroke="var(--line)" stroke-width="6"/>' +
    '<circle cx="32" cy="32" r="26" fill="none" stroke="' + col + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + a.toFixed(1) + ' ' + C + '" transform="rotate(-90 32 32)"/>' +
    '<text x="32" y="37" text-anchor="middle" font-size="16" font-weight="700" fill="var(--text)">' + (score > 0 ? "+" : "") + score + '</text></svg>';
}

function pairCard(x) {
  var s = Number(x.score);
  return '<a class="card pair" href="#/pair/' + esc(x.pair) + '">' + ring(s) +
    '<div class="sym">' + esc(x.pair) + '</div><div class="lab">' + esc(x.label) + '</div></a>';
}

function tsCl(v) { return v == null ? "muted" : v >= 15 ? "up" : v <= -15 ? "down" : "muted"; }

function tsN(v) { return v == null ? "–" : (v > 0 ? "+" : "") + v; }

function tsC(l, v) {
  v = v == null ? null : Number(v);
  return "<span>" + l + '<b class="' + tsCl(v) + '">' + tsN(v) + "</b></span>";
}

function tsRow(x) {
  var f = Number(x.final), c = tsCl(f);
  return '<a class="sr" href="#/pair/' + esc(x.pair) + '"><div class="sm"><div class="sn">' + esc(x.pair) + '</div><div class="sd2 ' + c + '">' + esc(x.bias) + "</div></div>" +
    '<div class="tcs">' + tsC("T", x.technical) + tsC("S", x.sentiment) + tsC("F", x.fundamentals) + '</div><div class="sv ' + c + '">' + tsN(f) + '</div><span class="sch">&#8250;</span></a>';
}

/* centered bar scaled to the maximum the group total can reach */
function hbBar(l, v, max) {
  var n = v == null ? null : Number(v);
  var cls = n == null || n === 0 ? "neu" : n > 0 ? "pos" : "neg";
  var w = n == null ? 0 : Math.min(50, Math.abs(n) / max * 50);
  var left = n == null ? 50 : n >= 0 ? 50 : 50 - w;
  return '<div class="hbb"><span class="hl">' + l + '</span>' +
    '<span class="htr"><i class="' + cls + '" style="left:' + left + '%;width:' + w + '%"></i></span>' +
    '<b class="' + (n == null ? "muted" : n > 0 ? "up" : n < 0 ? "down" : "muted") + '">' + tsN(n) + "</b></div>";
}

PAGES.home = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var d = await sb("scores_v3?select=as_of&order=as_of.desc&limit=1");
    if (!d.length) { el.innerHTML = "<h1>Top Setups</h1><p class=\"muted\">No scores yet.</p>"; return; }
    var day = d[0].as_of;
    var cols = "pair,total,bias,technical,sentiment,macro,growth,inflation,jobs," + T3S.map(function (n) { return n[0]; }).join(",");
    var rows = await sb("scores_v3?select=" + cols + "&as_of=eq." + day + "&limit=100");

    var bulls = rows.filter(function (x) { return /Bull/.test(x.bias || ""); }).length;
    var bears = rows.filter(function (x) { return /Bear/.test(x.bias || ""); }).length;
    var neut = rows.length - bulls - bears;
    var top = rows.slice().sort(function (a, b) { return Math.abs(Number(b.total)) - Math.abs(Number(a.total)); })[0] || null;

    var h = '<div class="pagehead"><div><div class="kicker">Daily bias</div><h1>Top Setups</h1></div>' +
      '<span class="asof">As of ' + esc(day) + "</span></div>" +
      '<p class="muted sub">Every signal behind every score. Tap a heading to sort, tap a pair to open it.</p>';

    h += '<div class="statsrow">' +
      '<div class="stat"><span>Bullish</span><b class="up">' + bulls + "</b></div>" +
      '<div class="stat"><span>Bearish</span><b class="down">' + bears + "</b></div>" +
      '<div class="stat"><span>Neutral</span><b>' + neut + "</b></div>" +
      '<div class="stat"><span>Instruments</span><b>' + rows.length + "</b></div>" +
      "</div>";

    if (top) {
      var abs = Math.abs(Number(top.total));
      h += '<a class="hero-bias" href="#/scan/' + esc(top.pair) + '">' +
        '<div class="hb-top"><span class="kicker">Clearest bias</span>' +
        '<span class="conv ' + (abs >= 12 ? "conv-hi" : "conv-md") + '">' +
        (abs >= 12 ? "High conviction" : "Medium conviction") + "</span></div>" +
        '<div class="hb-main"><div><div class="hb-pair">' + esc(top.pair) + "</div>" +
        '<div class="hb-lab ' + (/Bull/.test(top.bias) ? "up" : /Bear/.test(top.bias) ? "down" : "muted") + '">' + esc(top.bias) + "</div></div>" +
        '<div class="hb-score ' + (top.total > 0 ? "up" : top.total < 0 ? "down" : "muted") + '">' + tsN(top.total) + "</div></div>" +
        '<div class="hb-bars">' + hbBar("Technical", top.technical, S3CFG.max.technical) +
          hbBar("Sentiment", top.sentiment, S3CFG.max.sentiment) +
          hbBar("Macro", top.macro, S3CFG.max.macro) + "</div>" +
        '<div class="hb-foot muted">Tap to see the full breakdown <span>&#8250;</span></div>' +
        "</a>";
    }

    h += filtBar();
    h += '<div class="gx"><div class="gr"><span class="gl">Hide Neutral</span><button class="msw" id="hn" aria-label="Hide Neutral"><i></i></button></div></div><div id="res"></div>';
    h += '<p class="note">Each signal runs from -2 (red) to +2 (green). The score is the plain sum of all signals. Blank means no data for that pair. Accuracy is not proven. Scores rank where to look first. They are not forecasts.</p>';
    el.innerHTML = h;

    var res = el.querySelector("#res");
    var draw = function () {
      var f = rows.filter(function (x) { return filtMatch(x.pair) && (!t3h || x.bias !== "Neutral"); });
      f.sort(function (a, b) { return (t3v(b, t3k) - t3v(a, t3k)) * (t3d < 0 ? 1 : -1); });
      res.innerHTML = f.length ? t3tab(f) : filtEmpty();
    };
    res.addEventListener("click", function (e) {
      var t = e.target.closest(".t2h");
      if (!t) return;
      var k = t.getAttribute("data-k");
      if (k === t3k) t3d = -t3d; else { t3k = k; t3d = -1; }
      draw();
    });
    filtWire(el, draw);
    var b = el.querySelector("#hn");
    b.className = "msw" + (t3h ? " on" : "");
    b.onclick = function () { t3h = !t3h; b.className = "msw" + (t3h ? " on" : ""); draw(); };
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load scores: ' + esc(e.message) + "</p>";
  }
};

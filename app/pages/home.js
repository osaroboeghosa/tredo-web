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

PAGES.home = async function (el) {
  el.innerHTML = '<p class="muted">Loading...</p>';
  try {
    var d = await sb("scores_v2?select=as_of&order=as_of.desc&limit=1");
    if (!d.length) { el.innerHTML = '<h1>Top Setups</h1><p class="muted">No scores yet.</p>'; return; }
    var day = d[0].as_of;
    var rows = await sb("scores_v2?select=pair,final,bias,technical,sentiment,fundamentals&as_of=eq." + day + "&order=final.desc&limit=100");
    rows.sort(function (a, b) { return Math.abs(b.final) - Math.abs(a.final); });
    var hide = false;
    var h = '<h1>Top Setups</h1><p class="muted sub">Strongest scores first. As of ' + esc(day) + "</p>" + filtBar();
    h += '<div class="gx"><div class="gr"><span class="gl">Hide Neutral</span><button class="msw" id="hn" aria-label="Hide Neutral"><i></i></button></div></div>';
    h += '<div id="res"></div>';
    h += '<p class="note">T is Technical, S is Sentiment, F is Fundamentals. Each runs from -100 to +100, and the final score blends them. Scores rank where to look first. They are not forecasts.</p>';
    el.innerHTML = h;
    var res = el.querySelector("#res");
    var draw = function () {
      var f = rows.filter(function (x) { return filtMatch(x.pair) && (!hide || x.bias !== "Neutral"); });
      res.innerHTML = f.length ? '<div class="sl">' + f.map(tsRow).join("") + "</div>" : filtEmpty();
    };
    filtWire(el, draw);
    var b = el.querySelector("#hn");
    b.onclick = function () { hide = !hide; b.className = "msw" + (hide ? " on" : ""); draw(); };
    draw();
  } catch (e) {
    el.innerHTML = '<p class="down">Could not load scores: ' + esc(e.message) + "</p>";
  }
};
